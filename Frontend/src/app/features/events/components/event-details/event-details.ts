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

  protected readonly startersCount = computed(() => 
    this.menuItems().filter(m => m.category === 'STARTER').length
  );

  protected readonly mainsCount = computed(() => 
    this.menuItems().filter(m => m.category === 'MAIN').length
  );

  protected readonly dessertsCount = computed(() => 
    this.menuItems().filter(m => m.category === 'DESSERT').length
  );

  protected readonly beveragesCount = computed(() => 
    this.menuItems().filter(m => m.category === 'BEVERAGE' || m.category === 'DRINK').length
  );

  protected readonly totalPlatesAndBeverages = computed(() => {
    const confirmCount = this.confirmedGuestsCount();
    const dishCount = this.menuItems().length;
    return confirmCount * (dishCount > 0 ? dishCount : 1);
  });

  protected readonly cateringBudget = computed(() => {
    const pricePerPerson = this.menuItems().reduce((sum, item) => sum + (item.pricePerPerson || 0), 0);
    return pricePerPerson * this.confirmedGuestsCount();
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
}
