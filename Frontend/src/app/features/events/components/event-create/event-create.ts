import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { EventService } from '../../services/event.service';
import { CatererService } from '../../../../core/services/caterer.service';

@Component({
  selector: 'app-event-create',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './event-create.html'
})
export class EventCreate implements OnInit {
  private readonly eventService = inject(EventService);
  private readonly catererService = inject(CatererService);
  private readonly router = inject(Router);

  protected readonly title = signal('');
  protected readonly eventDateOnly = signal('');
  protected readonly eventTimeOnly = signal('');
  protected readonly location = signal('');
  protected readonly guestCount = signal<number | null>(null);
  protected readonly status = signal<'DRAFT' | 'PLANNED' | 'COMPLETED' | 'CANCELLED'>('DRAFT');
  protected readonly errorMessage = signal('');
  protected readonly isLoading = signal(false);
  protected readonly isQuotaReached = signal(false);

  public ngOnInit(): void {
    this.catererService.getCurrentProfile().subscribe({
      next: (profile) => {
        if (profile.role !== 'SUPER_ADMIN' && 
            profile.eventCount !== undefined && 
            profile.eventLimit !== undefined && 
            profile.eventCount >= profile.eventLimit) {
          this.isQuotaReached.set(true);
          this.errorMessage.set(
            "Quota dépassé : Vous avez atteint la limite de votre forfait. Veuillez renouveler ou mettre à niveau votre abonnement pour ajouter d'autres événements."
          );
        }
      },
      error: (err) => {
        console.error('Erreur lors du chargement du profil traiteur:', err);
      }
    });
  }

  protected onSubmit(): void {
    if (!this.title() || !this.eventDateOnly() || !this.location()) {
      this.errorMessage.set('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    if (this.guestCount() !== null && this.guestCount() !== undefined && this.guestCount()! <= 0) {
      this.errorMessage.set('Le nombre d\'invités doit être supérieur à 0.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    const dateVal = this.eventDateOnly() + (this.eventTimeOnly() ? 'T' + this.eventTimeOnly() : 'T00:00');

    this.eventService.createEvent({
      title: this.title(),
      eventDate: dateVal,
      location: this.location(),
      guestCount: this.guestCount(),
      status: this.status()
    }).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.router.navigate(['/events']);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(
          err.error?.message || err.error?.error || 'Une erreur est survenue lors de la création de l\'événement.'
        );
        console.error(err);
      }
    });
  }
}
