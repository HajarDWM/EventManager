import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { EventService } from '../../services/event.service';

@Component({
  selector: 'app-event-create',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './event-create.html'
})
export class EventCreate {
  private readonly eventService = inject(EventService);
  private readonly router = inject(Router);

  protected readonly title = signal('');
  protected readonly eventDate = signal('');
  protected readonly location = signal('');
  protected readonly guestCount = signal<number | null>(null);
  protected readonly status = signal<'DRAFT' | 'PLANNED' | 'COMPLETED' | 'CANCELLED'>('PLANNED');
  protected readonly errorMessage = signal('');
  protected readonly isLoading = signal(false);

  protected onSubmit(): void {
    if (!this.title() || !this.eventDate() || !this.location() || this.guestCount() === null) {
      this.errorMessage.set('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    if (this.guestCount()! <= 0) {
      this.errorMessage.set('Le nombre d\'invités doit être supérieur à 0.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    this.eventService.createEvent({
      title: this.title(),
      eventDate: this.eventDate(),
      location: this.location(),
      guestCount: this.guestCount()!,
      status: this.status()
    }).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.router.navigate(['/events']);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(
          err.error?.error || 'Une erreur est survenue lors de la création de l\'événement.'
        );
        console.error(err);
      }
    });
  }
}
