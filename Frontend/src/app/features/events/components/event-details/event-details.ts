import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { EventService } from '../../services/event.service';
import { Event } from '../../models/event.model';
import { GuestService, Guest } from '../../../../core/services/guest.service';
import { BillingService, PaymentDTO } from '../../../../core/services/billing.service';
import { MenuItemService, MenuItem } from '../../../../core/services/menu-item.service';
import { CatererService } from '../../../../core/services/caterer.service';
import { CurrencyService } from '../../../../core/services/currency.service';

@Component({
  selector: 'app-event-details',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './event-details.html'
})
export class EventDetails implements OnInit {
  private readonly eventService = inject(EventService);
  private readonly guestService = inject(GuestService);
  private readonly billingService = inject(BillingService);
  private readonly menuItemService = inject(MenuItemService);
  private readonly catererService = inject(CatererService);
  private readonly currencyService = inject(CurrencyService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly currencySymbol = computed(() => this.currencyService.activeSymbol());

  protected readonly event = signal<Event | null>(null);
  protected readonly guests = signal<Guest[]>([]);
  protected readonly totalBudget = signal<number>(0);
  protected readonly totalPaid = signal<number>(0);
  protected readonly menuItems = signal<MenuItem[]>([]);
  protected readonly payments = signal<PaymentDTO[]>([]);

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

  protected readonly remainingBudget = computed(() => {
    const rem = this.totalBudget() - this.totalPaid();
    return rem < 0 ? 0 : rem;
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

  protected readonly cateringBudget = computed(() => {
    return this.menuItems().reduce((sum, item) => sum + ((item.pricePerPerson || 0) * (item.selectedCount || 0)), 0);
  });

  protected readonly totalSentCount = computed(() => 
    this.guests().filter(g => g.invitationStatus === 'SENT' || g.isSent === true).length
  );

  protected readonly deliveredCount = computed(() => 
    this.guests().filter(g => (g.invitationStatus === 'SENT' || g.isSent === true) && (g.email || g.phone)).length
  );

  protected readonly pendingDeliveryCount = computed(() => 
    this.guests().filter(g => !g.invitationStatus || (g.invitationStatus !== 'SENT' && g.isSent !== true)).length
  );

  protected readonly whatsappCount = computed(() => 
    this.guests().filter(g => (g.invitationStatus === 'SENT' || g.isSent === true) && g.phone && g.phone.trim().length > 0).length
  );

  protected readonly emailCount = computed(() => 
    this.guests().filter(g => (g.invitationStatus === 'SENT' || g.isSent === true) && g.email && g.email.trim().length > 0).length
  );

  protected readonly invitationPreviewGuests = computed(() => 
    this.guests()
      .filter(g => g.isSent === true || g.invitationStatus === 'SENT')
      .slice(0, 5)
  );

  public ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const id = Number(idParam);
      this.loadEvent(id);
      this.loadGuests(id);
      this.loadBilling(id);
      this.loadMenuItems(id);
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

  private loadGuests(eventId: number): void {
    this.guestService.getGuestsByEvent(eventId).subscribe({
      next: (data) => {
        const updatedList = (data || []).map(g => {
          if (!g.id) return g;
          const localSent = localStorage.getItem(`guest_${g.id}_isSent`);
          if (localSent === 'true') {
            return { ...g, isSent: true, invitationStatus: 'SENT' };
          }
          return g;
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

