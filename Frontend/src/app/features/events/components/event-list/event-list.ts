import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { EventService } from '../../services/event.service';
import { Event } from '../../models/event.model';
import { CatererService } from '../../../../core/services/caterer.service';

@Component({
  selector: 'app-event-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './event-list.html'
})
export class EventList implements OnInit {
  private readonly eventService = inject(EventService);
  private readonly catererService = inject(CatererService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly events = signal<Event[]>([]);
  protected readonly isLoading = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly selectedCatererId = signal<number | null>(null);

  protected readonly isSuspended = computed(() => {
    const profile = this.catererService.currentProfile();
    return profile && profile.accountStatus === 'SUSPENDED';
  });

  protected readonly isSubscriptionExpired = computed(() => {
    const profile = this.catererService.currentProfile();
    if (profile && profile.role === 'SUPER_ADMIN') return false;
    return profile && (!!profile.isExpired || !!profile.expired || profile.subscriptionStatus === 'EXPIRED');
  });

  // Feature toggle flag for modularity (can easily be set to false to completely turn off this feature)
  protected readonly showQuotaUsageBanner = signal(true);
  protected readonly currentPlan = signal('FREE');
  protected readonly eventsLimit = signal(2);
  protected readonly usagePercentage = signal(0);
  protected readonly filteredQuotaEventsUsed = signal(0);

  // Search & Filter State
  protected readonly searchTerm = signal('');
  protected readonly statusFilter = signal('ALL');
  protected readonly sortBy = signal('date-asc');

  // Computed Filtered & Sorted Events
  protected readonly filteredEvents = computed(() => {
    let list = [...this.events()];

    // Search filter (Title or Location)
    const term = this.searchTerm().trim().toLowerCase();
    if (term) {
      list = list.filter(e =>
        (e.title && e.title.toLowerCase().includes(term)) ||
        (e.location && e.location.toLowerCase().includes(term)) ||
        (e.invitationSubtitle && e.invitationSubtitle.toLowerCase().includes(term))
      );
    }

    // Status filter
    const status = this.statusFilter();
    if (status !== 'ALL') {
      list = list.filter(e => e.status === status);
    }

    // Sorting
    const sort = this.sortBy();
    list.sort((a, b) => {
      if (sort === 'date-asc') {
        return new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime();
      }
      if (sort === 'date-desc') {
        return new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime();
      }
      if (sort === 'guests-desc') {
        return (b.guestCount || 0) - (a.guestCount || 0);
      }
      if (sort === 'title-asc') {
        return (a.title || '').localeCompare(b.title || '');
      }
      return 0;
    });

    return list;
  });

  public ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const paramCatererId = params['catererId'] ? Number(params['catererId']) : null;
      this.selectedCatererId.set(paramCatererId);

      const profile = this.catererService.currentProfile();
      const isSuper = profile && profile.role === 'SUPER_ADMIN';

      if (isSuper && !paramCatererId) {
        this.router.navigate(['/admin/caterers']);
        return;
      }

      if (profile) {
        this.loadEvents(paramCatererId);
      } else {
        // Otherwise fetch to confirm or retrieve from REST
        this.catererService.getCurrentProfile().subscribe({
          next: (prof) => {
            const isSuperFetch = prof && prof.role === 'SUPER_ADMIN';
            if (isSuperFetch && !paramCatererId) {
              this.router.navigate(['/admin/caterers']);
            } else {
              this.loadEvents(paramCatererId);
            }
          },
          error: () => {
            this.loadEvents(paramCatererId);
          }
        });
      }
    });
  }

  protected loadEvents(catererId: number | null = null): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.eventService.getAllEvents(catererId || undefined).subscribe({
      next: (data) => {
        this.events.set(data);
        this.isLoading.set(false);
        this.updateQuotaStats();
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set('Impossible de charger les événements.');
        console.error(err);
      }
    });
  }

  protected resetFilters(): void {
    this.searchTerm.set('');
    this.statusFilter.set('ALL');
    this.sortBy.set('date-asc');
  }

  protected getStatusBadgeClass(status: string | undefined): string {
    switch (status) {
      case 'DRAFT': return 'bg-warning-light text-warning';
      case 'PLANNED': return 'bg-success-light text-success';
      case 'COMPLETED': return 'bg-info-light text-info';
      case 'CANCELLED': return 'bg-danger-light text-danger';
      default: return 'bg-body-dark text-dark';
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

  protected deleteEvent(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) {
      this.eventService.deleteEvent(id).subscribe({
        next: () => {
          this.events.update(list => list.filter(e => e.id !== id));
          this.updateQuotaStats();
        },
        error: (err) => {
          this.errorMessage.set('Une erreur est survenue lors de la suppression.');
          console.error(err);
        }
      });
    }
  }

  private updateQuotaStats(): void {
    this.catererService.getCurrentProfile().subscribe({
      next: (profile) => {
        const plan = profile.subscriptionPlan || 'FREE';
        this.currentPlan.set(plan);
        const limit = profile.eventLimit || 2;
        const count = profile.eventCount || 0;
        
        this.eventsLimit.set(limit);
        this.filteredQuotaEventsUsed.set(count);
        
        const percentage = Math.min(100, Math.round((count / limit) * 100));
        this.usagePercentage.set(percentage);
      }
    });
  }
}
