import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { EventService } from '../../services/event.service';

@Component({
  selector: 'app-event-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './event-edit.html'
})
export class EventEdit implements OnInit {
  private readonly eventService = inject(EventService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly eventId = signal<number | null>(null);
  protected readonly title = signal('');
  protected readonly eventDate = signal('');
  protected readonly location = signal('');
  protected readonly guestCount = signal<number | null>(null);
  protected readonly status = signal<'DRAFT' | 'PLANNED' | 'COMPLETED' | 'CANCELLED'>('PLANNED');
  
  protected readonly errorMessage = signal('');
  protected readonly isLoading = signal(false);
  protected readonly isSaving = signal(false);

  public ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const id = Number(idParam);
      this.eventId.set(id);
      this.loadEvent(id);
    }
  }

  private loadEvent(id: number): void {
    this.isLoading.set(true);
    this.eventService.getEventById(id).subscribe({
      next: (data) => {
        this.title.set(data.title);
        // Formater la date pour <input type="datetime-local"> (yyyy-MM-ddTHH:mm)
        if (data.eventDate) {
          const date = new Date(data.eventDate);
          const formatted = date.toISOString().slice(0, 16);
          this.eventDate.set(formatted);
        }
        this.location.set(data.location);
        this.guestCount.set(data.guestCount);
        if (data.status) {
          this.status.set(data.status);
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set('Impossible de charger les détails de cet événement.');
        console.error(err);
      }
    });
  }

  protected onSubmit(): void {
    if (!this.eventId() || !this.title() || !this.eventDate() || !this.location() || this.guestCount() === null) {
      this.errorMessage.set('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    this.isSaving.set(true);
    this.errorMessage.set('');

    this.eventService.updateEvent(this.eventId()!, {
      id: this.eventId()!,
      title: this.title(),
      eventDate: this.eventDate(),
      location: this.location(),
      guestCount: this.guestCount()!,
      status: this.status()
    }).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.router.navigate(['/events']);
      },
      error: (err) => {
        this.isSaving.set(false);
        this.errorMessage.set(
          err.error?.error || 'Une erreur est survenue lors de la mise à jour de l\'événement.'
        );
        console.error(err);
      }
    });
  }
}
