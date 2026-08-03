import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AdminService } from '../../../core/services/admin.service';
import { EventService } from '../../events/services/event.service';

@Component({
  selector: 'app-admin-caterer-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-caterer-detail.html'
})
export class AdminCatererDetail implements OnInit {
  private readonly adminService = inject(AdminService);
  private readonly eventService = inject(EventService);
  private readonly route = inject(ActivatedRoute);

  // States
  protected readonly caterer = signal<any | null>(null);
  protected readonly events = signal<any[]>([]);
  protected readonly isLoading = signal(true);
  protected readonly errorMessage = signal('');

  public ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const id = Number(idParam);
      this.loadCatererData(id);
    } else {
      this.errorMessage.set("Identifiant de l'organisateur manquant.");
      this.isLoading.set(false);
    }
  }

  private loadCatererData(id: number): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.adminService.getCatererById(id).subscribe({
      next: (catererData) => {
        this.caterer.set(catererData);
        // Once caterer is loaded, load their events
        this.loadCatererEvents(id);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set("Impossible de charger les détails de cet organisateur.");
        console.error(err);
      }
    });
  }

  private loadCatererEvents(catererId: number): void {
    this.eventService.getAllEvents(catererId).subscribe({
      next: (eventsData) => {
        this.events.set(eventsData);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.isLoading.set(false);
        // We still show the caterer details even if loading events fails
        console.error('Erreur lors du chargement des événements :', err);
      }
    });
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
