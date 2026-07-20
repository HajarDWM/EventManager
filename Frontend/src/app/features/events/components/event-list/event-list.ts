import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { EventService } from '../../services/event.service';
import { Event } from '../../models/event.model';

@Component({
  selector: 'app-event-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './event-list.html'
})
export class EventList implements OnInit {
  private readonly eventService = inject(EventService);

  protected readonly events = signal<Event[]>([]);
  protected readonly isLoading = signal(false);
  protected readonly errorMessage = signal('');

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
        (e.location && e.location.toLowerCase().includes(term))
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
    this.loadEvents();
  }

  protected loadEvents(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.eventService.getAllEvents().subscribe({
      next: (data) => {
        this.events.set(data);
        this.isLoading.set(false);
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
        },
        error: (err) => {
          this.errorMessage.set('Une erreur est survenue lors de la suppression.');
          console.error(err);
        }
      });
    }
  }
}
