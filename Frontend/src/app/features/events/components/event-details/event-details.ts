import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { EventService } from '../../services/event.service';
import { Event } from '../../models/event.model';

@Component({
  selector: 'app-event-details',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './event-details.html'
})
export class EventDetails implements OnInit {
  private readonly eventService = inject(EventService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly event = signal<Event | null>(null);
  protected readonly isLoading = signal(true);
  protected readonly errorMessage = signal('');

  public ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const id = Number(idParam);
      this.loadEvent(id);
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
}
