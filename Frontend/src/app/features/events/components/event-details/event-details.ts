import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { EventService } from '../../services/event.service';
import { Event } from '../../models/event.model';
import { GuestService, Guest } from '../../../../core/services/guest.service';
import { BillingService, PaymentDTO, EventExpenseDTO } from '../../../../core/services/billing.service';
import { MenuItemService, MenuItem } from '../../../../core/services/menu-item.service';
import { CatererService } from '../../../../core/services/caterer.service';
import { CurrencyService } from '../../../../core/services/currency.service';
import { TemplateService } from '../../../../core/services/template.service';

@Component({
  selector: 'app-event-details',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './event-details.html'
})
export class EventDetails implements OnInit {
  private readonly eventService = inject(EventService);
  private readonly guestService = inject(GuestService);
  private readonly billingService = inject(BillingService);
  private readonly menuItemService = inject(MenuItemService);
  private readonly catererService = inject(CatererService);
  private readonly currencyService = inject(CurrencyService);
  private readonly templateService = inject(TemplateService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly currencySymbol = computed(() => this.currencyService.activeSymbol());

  protected readonly event = signal<Event | null>(null);
  protected readonly guests = signal<Guest[]>([]);
  protected readonly totalBudget = signal<number>(0);
  protected readonly totalPaid = signal<number>(0);
  protected readonly menuItems = signal<MenuItem[]>([]);
  protected readonly payments = signal<PaymentDTO[]>([]);
  protected readonly expenses = signal<EventExpenseDTO[]>([]);

  protected readonly isLoading = signal(true);
  protected readonly errorMessage = signal('');
  
  protected readonly linkCopied = signal(false);

  protected readonly isSubscriptionExpired = computed(() => {
    const profile = this.catererService.currentProfile();
    if (profile && profile.role === 'SUPER_ADMIN') return false;
    return profile && (!!profile.isExpired || !!profile.expired || profile.subscriptionStatus === 'EXPIRED');
  });

  // Computed KPIs & stats for the Mini-Dashboard
  protected readonly confirmedGuestsCount = computed(() => 
    this.guests().filter(g => g.status === 'CONFIRMED').length
  );

  protected readonly pendingGuestsCount = computed(() => 
    this.guests().filter(g => g.status === 'PENDING').length
  );

  protected readonly declinedGuestsCount = computed(() => 
    this.guests().filter(g => g.status === 'DECLINED').length
  );

  protected readonly confirmedGuests = computed(() => 
    this.guests().filter(g => g.status === 'CONFIRMED').slice(0, 10)
  );

  protected readonly rsvpResponseRate = computed(() => {
    const list = this.guests();
    if (list.length === 0) return 0;
    const responded = list.filter(g => g.status === 'CONFIRMED' || g.status === 'DECLINED').length;
    return Math.round((responded / list.length) * 100);
  });

  protected readonly assignedGuestsCount = computed(() => 
    this.guests().filter(g => g.tableNumber && g.tableNumber.trim().length > 0).length
  );

  protected readonly unassignedGuestsCount = computed(() => 
    this.guests().filter(g => !g.tableNumber || g.tableNumber.trim().length === 0).length
  );

  protected readonly dietaryGuests = computed(() => 
    this.guests().filter(g => g.dietaryRequirements && g.dietaryRequirements.trim().length > 0)
  );

  protected readonly recentGuests = computed(() => 
    this.guests().slice(0, 10)
  );

  // Dashboard filter & pagination
  protected readonly dashboardStatusFilter = signal<'ALL' | 'PENDING' | 'CONFIRMED' | 'DECLINED'>('ALL');
  protected readonly dashboardCurrentPage = signal<number>(1);
  protected readonly dashboardPageSize = 5;

  protected readonly dashboardFilteredGuests = computed(() => {
    const f = this.dashboardStatusFilter();
    if (f === 'ALL') return this.guests();
    return this.guests().filter(g => g.status === f);
  });

  protected readonly dashboardTotalPages = computed(() =>
    Math.max(1, Math.ceil(this.dashboardFilteredGuests().length / this.dashboardPageSize))
  );

  protected readonly dashboardPagedGuests = computed(() => {
    const start = (this.dashboardCurrentPage() - 1) * this.dashboardPageSize;
    return this.dashboardFilteredGuests().slice(start, start + this.dashboardPageSize);
  });

  protected setDashboardFilter(filter: 'ALL' | 'PENDING' | 'CONFIRMED' | 'DECLINED'): void {
    this.dashboardStatusFilter.set(filter);
    this.dashboardCurrentPage.set(1);
  }

  protected dashboardPrevPage(): void {
    if (this.dashboardCurrentPage() > 1) this.dashboardCurrentPage.update(p => p - 1);
  }

  protected dashboardNextPage(): void {
    if (this.dashboardCurrentPage() < this.dashboardTotalPages()) this.dashboardCurrentPage.update(p => p + 1);
  }

  protected readonly remainingBudget = computed(() => {
    const rem = this.totalBudget() - this.totalPaid();
    return rem < 0 ? 0 : rem;
  });

  // Financial & Expense KPIs
  protected readonly totalExpenses = computed(() => {
    return this.expenses().reduce((sum, exp) => sum + (exp.amount || 0), 0);
  });

  protected readonly netProfitAmount = computed(() => {
    return this.totalBudget() - this.totalExpenses();
  });

  protected readonly netProfitMargin = computed(() => {
    const budget = this.totalBudget();
    if (budget <= 0) return 0;
    return Math.round((this.netProfitAmount() / budget) * 100);
  });

  protected readonly paymentProgressPercentage = computed(() => {
    const budget = this.totalBudget();
    if (budget <= 0) return 0;
    return Math.min(100, Math.round((this.totalPaid() / budget) * 100));
  });

  // Catering Format & Service Details with dynamic counts
  protected readonly cateringFormatDetails = computed(() => {
    const mode = this.masterCateringMode();
    const mealType = this.event()?.mealType || '';
    const items = this.menuItems();

    const starterCount = items.filter(i => i.category === 'STARTER' || i.category === 'BUFFET_STARTER').length;
    const mainCount = items.filter(i => i.category === 'MAIN' || i.category === 'BUFFET_MAIN').length;
    const dessertCount = items.filter(i => i.category === 'DESSERT' || i.category === 'BUFFET_DESSERT').length;
    const beverageCount = items.filter(i => i.category === 'BEVERAGE' || i.category === 'BUFFET_BEVERAGES').length;
    
    if (mode === 'MIX') {
      const parts: { label: string; count: number; icon: string }[] = [];
      if (mealType.includes('BUFFET_ENTREES') || starterCount > 0) parts.push({ label: 'Entrées Buffet', count: starterCount, icon: 'fa-leaf' });
      if (mealType.includes('PLATS_FIXES') || mainCount > 0) parts.push({ label: 'Plat à table', count: mainCount, icon: 'fa-drumstick-bite' });
      if (mealType.includes('BUFFET_DESSERTS') || dessertCount > 0) parts.push({ label: 'Desserts Buffet', count: dessertCount, icon: 'fa-birthday-cake' });
      if (mealType.includes('BUFFET_BEVERAGES') || beverageCount > 0) parts.push({ label: 'Boissons Buffet', count: beverageCount, icon: 'fa-glass-cheers' });
      return {
        title: 'Formule Combinée (Mix)',
        badgeClass: 'bg-primary text-white',
        icon: 'fa-layer-group',
        parts,
        description: parts.map(p => `${p.label} (${p.count})`).join(' • ') || 'Buffets & Service assis'
      };
    } else if (mode === 'BUFFET') {
      const parts: { label: string; count: number; icon: string }[] = [];
      if (starterCount > 0) parts.push({ label: 'Cocktail & Entrées', count: starterCount, icon: 'fa-leaf' });
      if (mainCount > 0) parts.push({ label: 'Plats Chauds', count: mainCount, icon: 'fa-drumstick-bite' });
      if (dessertCount > 0) parts.push({ label: 'Douceurs & Desserts', count: dessertCount, icon: 'fa-birthday-cake' });
      if (beverageCount > 0) parts.push({ label: 'Boissons & Bar', count: beverageCount, icon: 'fa-glass-cheers' });
      return {
        title: 'Formule Buffet Libre',
        badgeClass: 'bg-info text-white',
        icon: 'fa-concierge-bell',
        parts,
        description: parts.map(p => `${p.label} (${p.count})`).join(' • ') || 'Libre-service intégral pour tous les convives'
      };
    } else {
      const parts: { label: string; count: number; icon: string }[] = [];
      if (starterCount > 0) parts.push({ label: 'Entrées', count: starterCount, icon: 'fa-leaf' });
      if (mainCount > 0) parts.push({ label: 'Plats Principaux', count: mainCount, icon: 'fa-drumstick-bite' });
      if (dessertCount > 0) parts.push({ label: 'Desserts', count: dessertCount, icon: 'fa-birthday-cake' });
      if (beverageCount > 0) parts.push({ label: 'Boissons', count: beverageCount, icon: 'fa-glass-cheers' });
      return {
        title: 'Service à l\'assiette',
        badgeClass: 'bg-warning text-dark',
        icon: 'fa-utensils',
        parts,
        description: parts.map(p => `${p.label} (${p.count})`).join(' • ') || 'Service traditionnel des plats à table'
      };
    }
  });

  protected readonly realDietarySummary = computed(() => {
    const confirmedGuests = this.guests().filter(g => g.status === 'CONFIRMED');
    const dietsMap = new Map<string, number>();
    let guestsWithDietCount = 0;

    confirmedGuests.forEach(g => {
      let rawDiets = g.dietaryRequirements || '';
      if (!rawDiets && g.id) {
        const localAllergies = localStorage.getItem(`guest_${g.id}_allergies`);
        if (localAllergies) {
          try {
            const arr = JSON.parse(localAllergies);
            if (Array.isArray(arr)) rawDiets = arr.join(', ');
          } catch (e) {}
        }
      }

      if (rawDiets) {
        const parts = rawDiets.split(',').map(s => s.trim()).filter(s => s.length > 0);
        const filteredDiets = parts.filter(p => {
          const lower = p.toLowerCase();
          return !lower.startsWith('plat:') && 
                 !lower.startsWith('entrée:') && 
                 !lower.startsWith('entree:') && 
                 !lower.startsWith('dessert:') && 
                 !lower.startsWith('boisson:') && 
                 !lower.startsWith('menu:') &&
                 !lower.startsWith('message:');
        });

        if (filteredDiets.length > 0) {
          guestsWithDietCount++;
          filteredDiets.forEach(d => {
            dietsMap.set(d, (dietsMap.get(d) || 0) + 1);
          });
        }
      }
    });

    const breakdown: { name: string; count: number }[] = [];
    dietsMap.forEach((count, name) => {
      breakdown.push({ name, count });
    });
    breakdown.sort((a, b) => b.count - a.count);

    return {
      totalGuests: guestsWithDietCount,
      breakdown,
      label: breakdown.length > 0 ? breakdown.map(b => `${b.count} ${b.name}`).join(', ') : 'Aucune restriction'
    };
  });

  protected readonly totalDishesSelected = computed(() => {
    return this.menuItems().reduce((sum, item) => sum + (item.selectedCount || 0), 0);
  });

  protected readonly menuSelectionCount = computed(() => {
    const confirmed = this.confirmedGuestsCount();
    if (confirmed === 0) return 0;
    if (this.masterCateringMode() === 'BUFFET') return confirmed;
    const mainDishes = this.menuItems().filter(i => i.category === 'MAIN');
    const mainSelections = mainDishes.reduce((sum, i) => sum + (i.selectedCount || 0), 0);
    if (mainSelections > 0) return Math.min(confirmed, mainSelections);
    return Math.min(confirmed, this.totalDishesSelected());
  });

  protected readonly menuSelectionRate = computed(() => {
    const confirmed = this.confirmedGuestsCount();
    if (confirmed === 0) return 0;
    if (this.masterCateringMode() === 'BUFFET') return confirmed > 0 ? 100 : 0;
    const count = this.menuSelectionCount();
    return Math.min(100, Math.round((count / confirmed) * 100));
  });

  protected readonly selectedMealDietFilter = signal<string>('ALL');

  protected setMealDietFilter(filter: string): void {
    this.selectedMealDietFilter.set(filter);
  }

  protected getDietIcon(dietName: string): string {
    const lower = dietName.toLowerCase();
    if (lower.includes('halal')) return 'fa-drumstick-bite';
    if (lower.includes('veg') || lower.includes('vegan')) return 'fa-leaf';
    if (lower.includes('gluten') || lower.includes('lactose')) return 'fa-wheat-awn';
    if (lower.includes('arachid') || lower.includes('alert') || lower.includes('médical')) return 'fa-shield-alt';
    if (lower.includes('fruit') || lower.includes('mer') || lower.includes('fish') || lower.includes('poisson')) return 'fa-fish';
    if (lower.includes('sucre') || lower.includes('diab')) return 'fa-cube';
    return 'fa-check';
  }

  protected readonly mainDishBreakdown = computed(() => {
    const confirmedGuests = this.guests().filter(g => g.status === 'CONFIRMED');
    const items = this.menuItems();
    const mainItems = items.filter(i => i.category === 'MAIN' || i.category === 'BUFFET_MAIN');
    const activeFilter = this.selectedMealDietFilter();

    // 1. Build guest profiles with chosenDish and diets
    const guestProfiles = confirmedGuests.map(g => {
      let chosenDish: string | null = null;
      if (g.dietaryRequirements) {
        const match = g.dietaryRequirements.match(/Plat:\s*([^,]+)/i);
        if (match && match[1]) {
          chosenDish = match[1].trim();
        }
      }
      if (!chosenDish && g.id) {
        const localChoice = localStorage.getItem(`guest_${g.id}_mealChoice`);
        if (localChoice && localChoice.trim()) {
          chosenDish = localChoice.trim();
        }
      }

      let rawDiets = g.dietaryRequirements || '';
      if (!rawDiets && g.id) {
        const localAllergies = localStorage.getItem(`guest_${g.id}_allergies`);
        if (localAllergies) {
          try {
            const arr = JSON.parse(localAllergies);
            if (Array.isArray(arr)) rawDiets = arr.join(', ');
          } catch (e) {}
        }
      }

      const dietsList: string[] = [];
      if (rawDiets) {
        const parts = rawDiets.split(',').map(s => s.trim()).filter(s => s.length > 0);
        parts.forEach(p => {
          const lower = p.toLowerCase();
          if (!lower.startsWith('plat:') && 
              !lower.startsWith('entrée:') && 
              !lower.startsWith('entree:') && 
              !lower.startsWith('dessert:') && 
              !lower.startsWith('boisson:') && 
              !lower.startsWith('menu:') &&
              !lower.startsWith('message:')) {
            dietsList.push(p);
          }
        });
      }

      return {
        guest: g,
        chosenDish,
        dietsList
      };
    });

    // 2. Filter guests matching active diet filter
    const matchingProfiles = guestProfiles.filter(p => {
      if (activeFilter === 'ALL') return true;
      return p.dietsList.some(d => d.toLowerCase().includes(activeFilter.toLowerCase()) || activeFilter.toLowerCase().includes(d.toLowerCase()));
    });

    const countsMap = new Map<string, number>();

    if (activeFilter === 'ALL') {
      // Tally from menuItems selectedCount if available
      mainItems.forEach(item => {
        if (item.selectedCount && item.selectedCount > 0) {
          countsMap.set(item.name.trim(), (countsMap.get(item.name.trim()) || 0) + item.selectedCount);
        }
      });
    }

    matchingProfiles.forEach(p => {
      if (p.chosenDish) {
        const matchedItem = mainItems.find(i => i.name.trim().toLowerCase() === p.chosenDish!.toLowerCase());
        const canonicalName = matchedItem ? matchedItem.name.trim() : p.chosenDish;
        
        if (activeFilter !== 'ALL' || mainItems.every(i => !i.selectedCount || i.selectedCount === 0)) {
          countsMap.set(canonicalName, (countsMap.get(canonicalName) || 0) + 1);
        }
      }
    });

    // Format list of chosen dishes
    const chosenDishes: { name: string; count: number; percentage: number }[] = [];
    let totalSelected = 0;

    countsMap.forEach((count, name) => {
      if (count > 0) {
        totalSelected += count;
        chosenDishes.push({
          name,
          count,
          percentage: matchingProfiles.length > 0 ? Math.round((count / matchingProfiles.length) * 100) : 0
        });
      }
    });

    chosenDishes.sort((a, b) => b.count - a.count);

    const unselectedCount = Math.max(0, matchingProfiles.length - totalSelected);

    return {
      chosenDishes,
      totalSelected,
      unselectedCount,
      confirmedCount: confirmedGuests.length,
      matchingCount: matchingProfiles.length,
      activeFilter
    };
  });

  // Meal Table Pagination & Dietary Matching
  protected readonly mealCurrentPage = signal<number>(1);
  protected readonly mealPageSize = 4;

  protected readonly mealTableItems = computed(() => {
    const items = this.menuItems();
    const confirmedGuests = this.guests().filter(g => g.status === 'CONFIRMED');
    const activeFilter = this.selectedMealDietFilter();
    const mode = this.masterCateringMode();

    // 1. Build guest profiles with chosen dish and diets
    const guestProfiles = confirmedGuests.map(g => {
      let chosenDish: string | null = null;
      if (g.dietaryRequirements) {
        const match = g.dietaryRequirements.match(/Plat:\s*([^,]+)/i);
        if (match && match[1]) chosenDish = match[1].trim();
      }
      if (!chosenDish && g.id) {
        const localChoice = localStorage.getItem(`guest_${g.id}_mealChoice`);
        if (localChoice && localChoice.trim()) chosenDish = localChoice.trim();
      }

      let rawDiets = g.dietaryRequirements || '';
      if (!rawDiets && g.id) {
        const localAllergies = localStorage.getItem(`guest_${g.id}_allergies`);
        if (localAllergies) {
          try {
            const arr = JSON.parse(localAllergies);
            if (Array.isArray(arr)) rawDiets = arr.join(', ');
          } catch (e) {}
        }
      }

      const dietsList: string[] = [];
      if (rawDiets) {
        const parts = rawDiets.split(',').map(s => s.trim()).filter(s => s.length > 0);
        parts.forEach(p => {
          const lower = p.toLowerCase();
          if (!lower.startsWith('plat:') && 
              !lower.startsWith('entrée:') && 
              !lower.startsWith('entree:') && 
              !lower.startsWith('dessert:') && 
              !lower.startsWith('boisson:') && 
              !lower.startsWith('menu:') &&
              !lower.startsWith('message:')) {
            dietsList.push(p);
          }
        });
      }

      return { guest: g, chosenDish, dietsList };
    });

    const matchingProfiles = guestProfiles.filter(p => {
      if (activeFilter === 'ALL') return true;
      return p.dietsList.some(d => d.toLowerCase().includes(activeFilter.toLowerCase()) || activeFilter.toLowerCase().includes(d.toLowerCase()));
    });

    const list: {
      id?: number;
      name: string;
      category: string;
      serviceType: string;
      serviceIcon: string;
      dietaryTag: string;
      portionsCount: number;
      portionLabel: string;
      isBuffet: boolean;
    }[] = [];

    items.forEach(item => {
      const isBuffetItem = item.category.startsWith('BUFFET_') || mode === 'BUFFET' || (mode === 'MIX' && item.category !== 'MAIN');
      const tagMatches = !!(item.dietaryTag && item.dietaryTag.toLowerCase().includes(activeFilter.toLowerCase()));
      
      // Calculate portions chosen
      let count = 0;
      if (isBuffetItem) {
        count = activeFilter === 'ALL' ? confirmedGuests.length : matchingProfiles.length;
      } else {
        matchingProfiles.forEach(p => {
          if (p.chosenDish && p.chosenDish.toLowerCase() === item.name.toLowerCase()) {
            count++;
          }
        });
        if (activeFilter === 'ALL' && count === 0 && item.selectedCount) {
          count = item.selectedCount;
        }
      }

      // Check relevance when filtering by specific diet
      let isRelevant = false;
      if (activeFilter === 'ALL') {
        isRelevant = true;
      } else {
        const isChosenByDietGuest = count > 0;
        // Strictly relevant if tagged with this specific diet OR chosen by guest with this diet
        isRelevant = tagMatches || isChosenByDietGuest;
      }

      if (isRelevant) {
        let serviceType = 'À Table';
        let serviceIcon = 'fa-utensils';
        if (isBuffetItem) {
          serviceType = 'Buffet Libre';
          serviceIcon = 'fa-concierge-bell';
        } else if (item.category === 'BEVERAGE' || item.category === 'BUFFET_BEVERAGES') {
          serviceType = 'Boisson';
          serviceIcon = 'fa-glass-cheers';
        }

        let portionLabel = '';
        if (isBuffetItem) {
          portionLabel = `${count} convive(s)`;
        } else {
          portionLabel = count > 0 ? `${count} choix` : '0 choix';
        }

        // Strictly display the filtered diet name when a filter is active
        const displayedDiet = activeFilter !== 'ALL' ? activeFilter : (item.dietaryTag || 'Standard');

        list.push({
          id: item.id,
          name: item.name,
          category: this.formatItemCategory(item.category),
          serviceType,
          serviceIcon,
          dietaryTag: displayedDiet,
          portionsCount: count,
          portionLabel,
          isBuffet: isBuffetItem
        });
      }
    });

    // Sort: items with chosen portions > 0 first
    list.sort((a, b) => b.portionsCount - a.portionsCount);

    return list;
  });

  protected formatItemCategory(cat: string): string {
    switch (cat) {
      case 'STARTER':
      case 'BUFFET_STARTER':
        return 'Entrée';
      case 'MAIN':
      case 'BUFFET_MAIN':
        return 'Plat Principal';
      case 'DESSERT':
      case 'BUFFET_DESSERT':
        return 'Dessert';
      case 'BEVERAGE':
      case 'BUFFET_BEVERAGES':
        return 'Boisson';
      default:
        return cat || 'Plat';
    }
  }

  protected readonly mealTotalPages = computed(() =>
    Math.max(1, Math.ceil(this.mealTableItems().length / this.mealPageSize))
  );

  protected readonly mealPagedItems = computed(() => {
    const start = (this.mealCurrentPage() - 1) * this.mealPageSize;
    return this.mealTableItems().slice(start, start + this.mealPageSize);
  });

  protected mealPrevPage(): void {
    if (this.mealCurrentPage() > 1) this.mealCurrentPage.update(p => p - 1);
  }

  protected mealNextPage(): void {
    if (this.mealCurrentPage() < this.mealTotalPages()) this.mealCurrentPage.update(p => p + 1);
  }

  protected readonly cateringBudget = computed(() => {
    const items = this.menuItems();
    const confirmed = this.confirmedGuestsCount();
    if (items.length === 0) return 0;
    
    const mode = this.masterCateringMode();
    const guestMultiplier = confirmed > 0 ? confirmed : 1;

    if (mode === 'MIX') {
      // 1. Buffet items: consumed by ALL confirmed guests
      const buffetItems = items.filter(i => i.category !== 'MAIN' && i.category !== 'BUFFET_MAIN');
      const buffetPerPersonCost = buffetItems.reduce((sum, item) => sum + (item.pricePerPerson || 0), 0);
      const totalBuffetCost = buffetPerPersonCost * guestMultiplier;

      // 2. Main course (Plat à table): Each guest chooses only 1 main dish
      const mainItems = items.filter(i => i.category === 'MAIN' || i.category === 'BUFFET_MAIN');
      let totalMainCost = 0;
      
      if (mainItems.length > 0) {
        const totalSelections = mainItems.reduce((sum, i) => sum + (i.selectedCount || 0), 0);
        const actualSelectionsCost = mainItems.reduce((sum, i) => sum + ((i.pricePerPerson || 0) * (i.selectedCount || 0)), 0);
        
        const avgMainPrice = mainItems.reduce((sum, i) => sum + (i.pricePerPerson || 0), 0) / mainItems.length;
        const unselectedGuests = Math.max(0, guestMultiplier - totalSelections);
        
        totalMainCost = actualSelectionsCost + (unselectedGuests * avgMainPrice);
      }

      return totalBuffetCost + totalMainCost;
    } else if (mode === 'BUFFET') {
      const buffetPerPerson = items.reduce((sum, item) => sum + (item.pricePerPerson || 0), 0);
      return buffetPerPerson * guestMultiplier;
    } else {
      // PLATS_FIXES: 1 starter + 1 main + 1 dessert + 1 beverage per guest
      const starters = items.filter(i => i.category === 'STARTER' || i.category === 'BUFFET_STARTER');
      const mains = items.filter(i => i.category === 'MAIN' || i.category === 'BUFFET_MAIN');
      const desserts = items.filter(i => i.category === 'DESSERT' || i.category === 'BUFFET_DESSERT');
      const beverages = items.filter(i => i.category === 'BEVERAGE' || i.category === 'BUFFET_BEVERAGES');

      const avgStarter = starters.length > 0 ? starters.reduce((s, i) => s + (i.pricePerPerson || 0), 0) / starters.length : 0;
      const avgMain = mains.length > 0 ? mains.reduce((s, i) => s + (i.pricePerPerson || 0), 0) / mains.length : 0;
      const avgDessert = desserts.length > 0 ? desserts.reduce((s, i) => s + (i.pricePerPerson || 0), 0) / desserts.length : 0;
      const avgBeverage = beverages.length > 0 ? beverages.reduce((s, i) => s + (i.pricePerPerson || 0), 0) / beverages.length : 0;

      const singleGuestCost = avgStarter + avgMain + avgDessert + avgBeverage;
      return singleGuestCost * guestMultiplier;
    }
  });

  protected readonly averageCostPerPerson = computed(() => {
    const confirmed = this.confirmedGuestsCount();
    const totalBudget = this.cateringBudget();
    if (confirmed > 0) {
      return totalBudget / confirmed;
    }
    return totalBudget;
  });

  protected readonly vegetarianCount = computed(() => 
    this.guests().filter(g => g.dietaryRequirements && g.dietaryRequirements.toLowerCase().includes('veg')).length
  );

  protected readonly allergyCount = computed(() => 
    this.guests().filter(g => g.dietaryRequirements && g.dietaryRequirements.toLowerCase().includes('allerg')).length
  );

  protected readonly otherDietaryCount = computed(() => 
    this.guests().filter(g => g.dietaryRequirements && g.dietaryRequirements.trim().length > 0 && 
      !g.dietaryRequirements.toLowerCase().includes('veg') && 
      !g.dietaryRequirements.toLowerCase().includes('allerg')
    ).length
  );

  protected readonly uniqueTablesCount = computed(() => {
    const list = this.guests()
      .map(g => g.tableNumber?.trim())
      .filter((val): val is string => !!val);
    return new Set(list).size;
  });

  protected readonly masterCateringMode = computed(() => {
    const e = this.event();
    if (!e || !e.mealType) return 'PLATS_FIXES';
    const t = e.mealType;
    if (t.includes('BUFFET_ENTREES') && t.includes('PLATS_FIXES')) {
      return 'MIX';
    } else if (t.startsWith('BUFFET') || t.includes('BUFFET_STANDARD')) {
      return 'BUFFET';
    }
    return 'PLATS_FIXES';
  });

  protected getCategoryLabel(cat: string, mode: string): string {
    if (mode === 'MIX') {
      switch (cat) {
        case 'BEVERAGE': return "Boissons d'accueil";
        case 'BUFFET_STARTER': return 'Pièces cocktail';
        case 'STARTER': return 'Salad Bar';
        case 'MAIN': return 'Plats';
        case 'DESSERT': return 'Desserts';
        case 'BUFFET_DESSERT': return 'Station Desserts (Buffet)';
        default: return cat;
      }
    }
    switch (cat) {
      case 'STARTER': return 'Entrées';
      case 'MAIN': return 'Plats';
      case 'DESSERT': return 'Desserts';
      case 'BEVERAGE': return 'Boissons';
      case 'OTHER': return 'Autres';
      case 'BUFFET_STARTER': return 'Pièces cocktail';
      case 'BUFFET_MAIN': return 'Plats Chauds';
      case 'BUFFET_DESSERT': return 'Station Desserts';
      case 'BUFFET_BEVERAGES': return 'Boissons Buffet';
      default: return cat;
    }
  }

  protected getCategoryIcon(cat: string): string {
    switch (cat) {
      case 'STARTER':
      case 'BUFFET_STARTER': return 'fa-cookie';
      case 'MAIN':
      case 'BUFFET_MAIN': return 'fa-drumstick-bite';
      case 'DESSERT':
      case 'BUFFET_DESSERT': return 'fa-birthday-cake';
      case 'BEVERAGE':
      case 'BUFFET_BEVERAGES': return 'fa-wine-glass';
      case 'OTHER': return 'fa-utensils';
      default: return 'fa-utensils';
    }
  }

  protected readonly menuCategoriesBreakdown = computed(() => {
    const items = this.menuItems();
    const categoriesMap = new Map<string, number>();

    items.forEach(item => {
      const cat = item.category || 'UNKNOWN';
      categoriesMap.set(cat, (categoriesMap.get(cat) || 0) + 1);
    });

    const mode = this.masterCateringMode();
    let allowedCategories: string[] = [];
    if (mode === 'PLATS_FIXES') {
      allowedCategories = ['STARTER', 'MAIN', 'DESSERT', 'BEVERAGE'];
    } else if (mode === 'BUFFET') {
      allowedCategories = ['BUFFET_STARTER', 'BUFFET_MAIN', 'BUFFET_DESSERT', 'BUFFET_BEVERAGES'];
    } else if (mode === 'MIX') {
      allowedCategories = ['BUFFET_STARTER', 'STARTER', 'MAIN', 'BUFFET_DESSERT', 'DESSERT', 'BEVERAGE'];
    }

    const breakdown: { category: string, label: string, icon: string, count: number }[] = [];
    categoriesMap.forEach((count, cat) => {
      if (count > 0 && cat !== 'UNKNOWN' && cat !== 'OTHER' && allowedCategories.includes(cat)) {
        breakdown.push({
          category: cat,
          label: this.getCategoryLabel(cat, mode),
          icon: this.getCategoryIcon(cat),
          count: count
        });
      }
    });

    const order = ['STARTER', 'BUFFET_STARTER', 'MAIN', 'BUFFET_MAIN', 'DESSERT', 'BUFFET_DESSERT', 'BEVERAGE', 'BUFFET_BEVERAGES'];
    breakdown.sort((a, b) => {
      let idxA = order.indexOf(a.category);
      let idxB = order.indexOf(b.category);
      if (idxA === -1) idxA = 99;
      if (idxB === -1) idxB = 99;
      return idxA - idxB;
    });

    return breakdown;
  });

  protected readonly totalPlatesAndBeverages = computed(() => {
    const confirmCount = this.confirmedGuestsCount();
    const dishCount = this.menuItems().length;
    return confirmCount * (dishCount > 0 ? dishCount : 1);
  });

  // Invitation Filter & Pagination
  protected readonly invitationFilter = signal<'ALL' | 'SENT' | 'DELIVERED' | 'PENDING' | 'INTERACTED'>('ALL');
  protected readonly invitationCurrentPage = signal<number>(1);
  protected readonly invitationPageSize = 5;
  protected readonly copiedGuestId = signal<number | null>(null);

  protected readonly totalSentCount = computed(() => 
    this.guests().filter(g => g.invitationStatus === 'SENT' || g.isSent === true).length
  );

  protected readonly deliveredCount = computed(() => 
    this.guests().filter(g => (g.invitationStatus === 'SENT' || g.isSent === true) && (g.email || g.phone)).length
  );

  protected readonly pendingDeliveryCount = computed(() => 
    this.guests().filter(g => !g.invitationStatus || (g.invitationStatus !== 'SENT' && g.isSent !== true)).length
  );

  protected readonly interactedCount = computed(() => 
    this.guests().filter(g => g.status === 'CONFIRMED' || g.status === 'DECLINED').length
  );

  protected readonly interactedPercentage = computed(() => {
    const total = this.guests().length;
    if (total === 0) return 0;
    return Math.round((this.interactedCount() / total) * 100);
  });

  protected readonly whatsappCount = computed(() => 
    this.guests().filter(g => g.phone && g.phone.trim().length > 0).length
  );

  protected readonly emailCount = computed(() => 
    this.guests().filter(g => g.email && g.email.trim().length > 0).length
  );

  protected readonly smsCount = computed(() => 
    this.guests().filter(g => g.phone && g.phone.trim().length > 0).length
  );

  // Canal le plus performant & Réactivité des réponses
  protected readonly whatsappRespondedCount = computed(() => 
    this.guests().filter(g => (g.status === 'CONFIRMED' || g.status === 'DECLINED') && g.phone && g.phone.trim().length > 0).length
  );

  protected readonly emailRespondedCount = computed(() => 
    this.guests().filter(g => (g.status === 'CONFIRMED' || g.status === 'DECLINED') && g.email && g.email.trim().length > 0).length
  );

  protected readonly bestChannel = computed(() => {
    const wa = this.whatsappRespondedCount();
    const mail = this.emailRespondedCount();
    const total = this.interactedCount();
    if (total === 0) {
      return { name: 'En attente de réponses', icon: 'fa-clock', colorClass: 'text-muted', percent: 0, count: 0 };
    }
    if (wa >= mail) {
      const pct = Math.round((wa / total) * 100);
      return { name: 'WhatsApp', icon: 'fab fa-whatsapp', colorClass: 'text-success', percent: pct, count: wa };
    } else {
      const pct = Math.round((mail / total) * 100);
      return { name: 'E-mail', icon: 'fa fa-envelope', colorClass: 'text-primary', percent: pct, count: mail };
    }
  });

  protected readonly invitationFilteredGuests = computed(() => {
    const f = this.invitationFilter();
    const list = this.guests();
    switch (f) {
      case 'SENT':
        return list.filter(g => g.isSent === true || g.invitationStatus === 'SENT');
      case 'INTERACTED':
        return list.filter(g => g.status === 'CONFIRMED' || g.status === 'DECLINED');
      case 'PENDING':
        return list.filter(g => !g.invitationStatus || (g.invitationStatus !== 'SENT' && g.isSent !== true));
      case 'ALL':
      default:
        return list;
    }
  });

  protected readonly invitationTotalPages = computed(() =>
    Math.max(1, Math.ceil(this.invitationFilteredGuests().length / this.invitationPageSize))
  );

  protected readonly invitationPagedGuests = computed(() => {
    const start = (this.invitationCurrentPage() - 1) * this.invitationPageSize;
    return this.invitationFilteredGuests().slice(start, start + this.invitationPageSize);
  });

  protected setInvitationFilter(filter: 'ALL' | 'SENT' | 'DELIVERED' | 'PENDING' | 'INTERACTED'): void {
    this.invitationFilter.set(filter);
    this.invitationCurrentPage.set(1);
  }

  protected invitationPrevPage(): void {
    if (this.invitationCurrentPage() > 1) this.invitationCurrentPage.update(p => p - 1);
  }

  protected invitationNextPage(): void {
    if (this.invitationCurrentPage() < this.invitationTotalPages()) this.invitationCurrentPage.update(p => p + 1);
  }

  protected getGuestInvitationLink(g: Guest): string {
    const tokenOrId = g.invitationToken || g.id;
    return `${window.location.origin}/rsvp/${tokenOrId}`;
  }

  protected copyGuestLink(g: Guest): void {
    if (!g.id) return;
    const url = this.getGuestInvitationLink(g);
    navigator.clipboard.writeText(url).then(() => {
      this.copiedGuestId.set(g.id!);
      setTimeout(() => this.copiedGuestId.set(null), 2500);
    });
  }

  protected getGuestWhatsAppUrl(g: Guest): string {
    const cleanPhone = (g.phone || '').replace(/[^0-9+]/g, '');
    const link = this.getGuestInvitationLink(g);
    const msg = encodeURIComponent(`Bonjour ${g.fullName},\nVous êtes convié(e) à l'événement "${this.event()?.title || ''}". Découvrez votre invitation officielle et confirmez votre présence ici : ${link}`);
    return cleanPhone ? `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${msg}` : `https://api.whatsapp.com/send?text=${msg}`;
  }

  public ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const id = Number(idParam);
      this.loadEvent(id);
      this.loadGuests(id);
      this.loadBilling(id);
      this.loadMenuItems(id);
      // Pre-warm template cache in background for instant navigation to invitation setup
      this.templateService.preloadTemplates();
    } else {
      this.errorMessage.set('Identifiant d\'événement manquant.');
      this.isLoading.set(false);
    }
  }

  private loadEvent(id: number): void {
    this.isLoading.set(true);
    this.errorMessage.set('');
    this.eventService.getEventById(id).subscribe({
      next: (data) => {
        this.event.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set('Impossible de charger les détails de cet événement.');
        console.error(err);
      }
    });
  }

  protected getGuestChannels(g: Guest): { type: string; icon: string; colorClass: string; title: string }[] {
    const channels: { type: string; icon: string; colorClass: string; title: string }[] = [];
    
    // If guest has recorded sent channels, display ONLY those sent channels
    if (g.sentChannels && g.sentChannels.length > 0) {
      if (g.sentChannels.includes('WhatsApp')) {
        channels.push({ type: 'WhatsApp', icon: 'fab fa-whatsapp', colorClass: 'text-success', title: `Envoyé via WhatsApp: ${g.phone || ''}` });
      }
      if (g.sentChannels.includes('SMS')) {
        channels.push({ type: 'SMS', icon: 'fa fa-comment-sms', colorClass: 'text-warning', title: `Envoyé via SMS: ${g.phone || ''}` });
      }
      if (g.sentChannels.includes('E-mail')) {
        channels.push({ type: 'E-mail', icon: 'fa fa-envelope', colorClass: 'text-primary', title: `Envoyé via E-mail: ${g.email || ''}` });
      }
      if (g.sentChannels.includes('Papier')) {
        channels.push({ type: 'Papier', icon: 'fa fa-envelope-open-text', colorClass: 'text-secondary', title: 'Format Papier / En main propre' });
      }
      return channels;
    }

    // Otherwise (pending / not sent yet), show available channels based on provided contact details
    if (g.phone && g.phone.trim().length > 0) {
      channels.push({ type: 'WhatsApp', icon: 'fab fa-whatsapp', colorClass: 'text-success', title: `WhatsApp: ${g.phone}` });
      channels.push({ type: 'SMS', icon: 'fa fa-comment-sms', colorClass: 'text-warning', title: `SMS: ${g.phone}` });
    }
    if (g.email && g.email.trim().length > 0) {
      channels.push({ type: 'E-mail', icon: 'fa fa-envelope', colorClass: 'text-primary', title: `E-mail: ${g.email}` });
    }

    return channels;
  }

  private loadGuests(eventId: number): void {
    this.guestService.getGuestsByEvent(eventId).subscribe({
      next: (data) => {
        const updatedList = (data || []).map(g => {
          if (!g.id) return g;
          const localSent = localStorage.getItem(`guest_${g.id}_isSent`);
          const rawChannels = localStorage.getItem(`guest_${g.id}_sentChannels`);
          let sentChannels: string[] | undefined = undefined;
          if (rawChannels) {
            try {
              sentChannels = JSON.parse(rawChannels);
            } catch (e) {}
          }
          if (localSent === 'true') {
            return { ...g, isSent: true, invitationStatus: 'SENT', sentChannels: sentChannels || g.sentChannels };
          }
          return { ...g, sentChannels: sentChannels || g.sentChannels };
        });
        this.guests.set(updatedList);
      },
      error: (err) => {
        console.error('Erreur chargement convives', err);
      }
    });
  }

  private loadBilling(eventId: number): void {
    // Fetch budget (Quotes)
    this.billingService.getQuotes(eventId).subscribe({
      next: (quotes) => {
        const globalQuote = quotes.find(q => q.reference?.startsWith('QT-GLOBAL-') || q.status === 'ACCEPTED' || q.status === 'INVOICED') || quotes[0];
        if (globalQuote) {
          this.totalBudget.set(globalQuote.totalTtc || 0);
        } else {
          this.totalBudget.set(0);
        }
      },
      error: (err) => {
        console.error('Erreur chargement devis', err);
      }
    });

    // Fetch total paid & recent payments (Invoices)
    this.billingService.getInvoices(eventId).subscribe({
      next: (invoices) => {
        const paidAmount = invoices.reduce((sum, inv) => sum + (inv.totalPaid || 0), 0);
        this.totalPaid.set(paidAmount);

        // Extract and sort payments
        const list: PaymentDTO[] = [];
        invoices.forEach(inv => {
          if (inv.payments) {
            list.push(...inv.payments);
          }
        });
        list.sort((a, b) => {
          const dateA = a.paymentDate ? new Date(a.paymentDate).getTime() : 0;
          const dateB = b.paymentDate ? new Date(b.paymentDate).getTime() : 0;
          return dateB - dateA;
        });
        this.payments.set(list.slice(0, 5));
      },
      error: (err) => {
        console.error('Erreur chargement factures', err);
      }
    });

    // Fetch expenses / charges
    this.billingService.getEventExpenses(eventId).subscribe({
      next: (expList) => {
        this.expenses.set(expList || []);
      },
      error: (err) => {
        console.error('Erreur chargement dépenses', err);
      }
    });
  }

  private loadMenuItems(eventId: number): void {
    this.menuItemService.getMenuItemsByEvent(eventId).subscribe({
      next: (items) => {
        this.menuItems.set(items || []);
      },
      error: (err) => {
        console.error('Erreur chargement du menu', err);
      }
    });
  }

  protected deleteEvent(): void {
    const currentEvent = this.event();
    if (!currentEvent || !currentEvent.id) return;

    if (confirm(`Êtes-vous sûr de vouloir supprimer l'événement "${currentEvent.title}" ?`)) {
      this.isLoading.set(true);
      this.eventService.deleteEvent(currentEvent.id).subscribe({
        next: () => {
          this.router.navigate(['/events']);
        },
        error: (err) => {
          this.isLoading.set(false);
          this.errorMessage.set('Une erreur est survenue lors de la suppression.');
          console.error(err);
        }
      });
    }
  }

  protected getStatusBadgeClass(status: string | undefined): string {
    switch (status) {
      case 'DRAFT': return 'bg-warning-light text-black border border-warning-light';
      case 'PLANNED': return 'bg-success-light text-black border border-success-light';
      case 'COMPLETED': return 'bg-info-light text-black border border-info-light';
      case 'CANCELLED': return 'bg-danger-light text-black border border-danger-light';
      default: return 'bg-body-dark text-black';
    }
  }

  protected getStatusLabel(status: string | undefined): string {
    switch (status) {
      case 'DRAFT': return 'Brouillon';
      case 'PLANNED': return 'Planifié';
      case 'COMPLETED': return 'Terminé';
      case 'CANCELLED': return 'Annulé';
      default: return 'Inconnu';
    }
  }

  protected getGuestPosition(guest: Guest): string {
    if (!guest || !guest.id) return 'Invité';
    // Determinist role mapping based on the guest ID
    const roles = ['Famille', 'Ami', 'Témoin', 'Marié', 'Mariée', 'Famille Proche', 'Prestataire', 'Ami d\'enfance'];
    return roles[guest.id % roles.length];
  }

  protected readonly isRegeneratingToken = signal(false);

  protected readonly isClientTokenExpired = computed(() => {
    const expiresAt = this.event()?.accessLinkExpiresAt;
    if (!expiresAt) return false;
    return new Date(expiresAt).getTime() < Date.now();
  });

  protected regenerateClientLink(): void {
    const eventId = this.event()?.id;
    if (!eventId) return;
    if (!confirm('Voulez-vous générer un nouveau lien pour votre client ? L\'ancien lien ne sera plus accessible et la validité sera réinitialisée.')) {
      return;
    }
    this.isRegeneratingToken.set(true);
    this.eventService.regenerateClientToken(eventId).subscribe({
      next: (updatedEvent) => {
        this.isRegeneratingToken.set(false);
        this.event.set(updatedEvent);
      },
      error: (err) => {
        this.isRegeneratingToken.set(false);
        console.error('Erreur lors de la régénération du lien client:', err);
      }
    });
  }

  protected clientPortalUrl(): string {
    const e = this.event();
    if (e && e.accessLinkToken) {
      return `${window.location.origin}/client/login?token=${e.accessLinkToken}`;
    }
    return 'Lien non disponible';
  }

  protected copyClientLink(): void {
    const url = this.clientPortalUrl();
    if (url !== 'Lien non disponible') {
      navigator.clipboard.writeText(url).then(() => {
        this.linkCopied.set(true);
        setTimeout(() => this.linkCopied.set(false), 3000);
      });
    }
  }

  protected whatsappShareUrl(): string {
    const url = this.clientPortalUrl();
    if (url === 'Lien non disponible') return '';
    const text = `Bonjour,\n\nVoici le lien d'accès sécurisé pour votre événement :\n${url}\n\nCordialement.`;
    return `https://wa.me/?text=${encodeURIComponent(text)}`;
  }

  protected emailShareUrl(): string {
    const url = this.clientPortalUrl();
    if (url === 'Lien non disponible') return '';
    const subject = `Accès Portail Client - ${this.event()?.title || 'Votre événement'}`;
    const body = `Bonjour,\n\nVoici le lien d'accès sécurisé pour votre événement :\n${url}\n\nCordialement.`;
    return `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  protected smsShareUrl(): string {
    const url = this.clientPortalUrl();
    if (url === 'Lien non disponible') return '';
    const body = `Bonjour, voici le lien d'accès à votre événement: ${url}`;
    return `sms:?&body=${encodeURIComponent(body)}`;
  }
}

