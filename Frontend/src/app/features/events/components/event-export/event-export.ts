import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ExportPdfService, EventExportData } from '../../../../core/services/export-pdf.service';
import { CurrencyService } from '../../../../core/services/currency.service';
import { MenuItem } from '../../../../core/services/menu-item.service';
import { EventTask } from '../../../../core/services/event-task.service';
import { Guest } from '../../../../core/services/guest.service';
import { Event } from '../../models/event.model';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-event-export',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './event-export.html',
  styleUrls: ['./event-export.scss']
})
export class EventExport implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly exportPdfService = inject(ExportPdfService);
  protected readonly currencyService = inject(CurrencyService);

  protected readonly currencySymbol = computed(() => this.currencyService.activeSymbol());

  protected readonly today = new Date();
  protected readonly eventId = signal<number | null>(null);
  protected readonly exportData = signal<EventExportData | null>(null);

  protected readonly isLoading = signal<boolean>(true);
  protected readonly errorMessage = signal<string>('');

  // Active Tab: 'kitchen' | 'guests' | 'tasks'
  protected readonly activeTab = signal<'kitchen' | 'guests' | 'tasks'>('kitchen');

  // Group Filtering state
  protected readonly selectedGroupFilter = signal<string>('ALL');

  // Computed Accessors
  protected readonly event = computed<Event | null>(() => this.exportData()?.event || null);
  protected readonly guests = computed<Guest[]>(() => this.exportData()?.guests || []);

  protected readonly uniqueGroups = computed(() => {
    const list = this.guests().map(g => g.groupName).filter((g): g is string => !!g);
    return Array.from(new Set(list));
  });

  protected readonly filteredGuests = computed(() => {
    const list = this.guests();
    const filter = this.selectedGroupFilter();
    if (filter === 'ALL') return list;
    return list.filter(g => g.groupName === filter);
  });
  protected readonly menuItems = computed<MenuItem[]>(() => this.exportData()?.menuItems || []);
  protected readonly tasks = computed<EventTask[]>(() => this.exportData()?.tasks || []);

  // Categorized Menu Items
  protected readonly starters = computed(() => this.menuItems().filter(m => m.category === 'STARTER'));
  protected readonly mains = computed(() => this.menuItems().filter(m => m.category === 'MAIN'));
  protected readonly desserts = computed(() => this.menuItems().filter(m => m.category === 'DESSERT'));
  protected readonly beverages = computed(() => this.menuItems().filter(m => m.category === 'BEVERAGE'));
  protected readonly others = computed(() => this.menuItems().filter(m => m.category === 'OTHER'));

  // Metrics
  protected readonly pricePerPerson = computed(() => {
    return this.menuItems().reduce((sum, item) => sum + (item.pricePerPerson || 0), 0);
  });

  protected readonly totalCateringBudget = computed(() => {
    const guestCount = this.event()?.guestCount || 0;
    return this.pricePerPerson() * guestCount;
  });

  protected readonly confirmedGuests = computed(() => this.guests().filter(g => g.status === 'CONFIRMED'));
  protected readonly pendingGuests = computed(() => this.guests().filter(g => g.status === 'PENDING'));
  protected readonly declinedGuests = computed(() => this.guests().filter(g => g.status === 'DECLINED'));

  protected readonly completedTasks = computed(() => this.tasks().filter(t => t.status === 'COMPLETED'));
  protected readonly pendingTasks = computed(() => this.tasks().filter(t => t.status !== 'COMPLETED'));

  // Kitchen Aggregations
  protected readonly confirmedGuestCount = computed(() => {
    return this.guests().filter(g => g.status === 'CONFIRMED').length;
  });

  protected readonly vegetarianCount = computed(() => {
    return this.guests().filter(g => {
      const diets = (g.dietaryRequirements || '').toLowerCase();
      return g.status === 'CONFIRMED' && (diets.includes('végétarien') || diets.includes('vegetarien'));
    }).length;
  });

  protected readonly veganCount = computed(() => {
    return this.guests().filter(g => {
      const diets = (g.dietaryRequirements || '').toLowerCase();
      return g.status === 'CONFIRMED' && (diets.includes('vegan') || diets.includes('végétalien') || diets.includes('végétalienne'));
    }).length;
  });

  protected readonly otherAllergiesList = computed(() => {
    const list: string[] = [];
    this.guests().forEach(g => {
      if (g.status === 'CONFIRMED' && g.dietaryRequirements) {
        const parts = g.dietaryRequirements.split(',').map(p => p.trim()).filter(Boolean);
        parts.forEach(p => {
          const lower = p.toLowerCase();
          const isStandardVeg = lower.includes('végétarien') || lower.includes('vegetarien') || lower.includes('vegan') || lower.includes('végétalien') || lower.includes('végétalienne');
          const isDishSelection = lower.startsWith('entrée:') || lower.startsWith('plat:') || lower.startsWith('boisson:');
          if (!isStandardVeg && !isDishSelection) {
            list.push(`${g.fullName} (${p})`);
          }
        });
      }
    });
    return list;
  });

  protected readonly dishQuantities = computed(() => {
    const quantities: Record<string, number> = {};
    const mappings: Record<string, { guestName: string, tableNumber: string }[]> = {};

    this.guests().forEach(g => {
      if (g.status === 'CONFIRMED' && g.dietaryRequirements) {
        const parts = g.dietaryRequirements.split(',').map(p => p.trim()).filter(Boolean);
        parts.forEach(p => {
          if (p.startsWith('Entrée: ') || p.startsWith('Plat: ') || p.startsWith('Boisson: ')) {
            const dishName = p.substring(p.indexOf(':') + 1).trim();
            if (dishName) {
              quantities[dishName] = (quantities[dishName] || 0) + 1;
              if (!mappings[dishName]) {
                mappings[dishName] = [];
              }
              mappings[dishName].push({
                guestName: g.fullName,
                tableNumber: g.tableNumber || 'Non assignée'
              });
            }
          }
        });
      }
    });

    return Object.entries(quantities).map(([name, qty]) => ({
      name,
      qty,
      guests: mappings[name] || []
    })).sort((a, b) => b.qty - a.qty);
  });

  protected readonly isHybridMode = computed(() => {
    const meal = this.event()?.mealType || '';
    return meal.includes('BUFFET_ENTREES') && meal.includes('PLATS_FIXES');
  });

  public ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const id = parseInt(idParam, 10);
      this.eventId.set(id);
      this.loadExportData(id);
    }
  }

  private loadExportData(id: number): void {
    this.isLoading.set(true);
    this.exportPdfService.getEventExportData(id).subscribe({
      next: (data) => {
        this.exportData.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set('Impossible de charger les données d\'exportation pour cet événement.');
        console.error(err);
      }
    });
  }

  protected setTab(tab: 'kitchen' | 'guests' | 'tasks'): void {
    this.activeTab.set(tab);
  }

  protected printDocument(): void {
    this.exportPdfService.triggerPrint();
  }
}
