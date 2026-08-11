import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { EventService } from '../../services/event.service';
import { TemplateService, DigitalTemplate } from '../../../../core/services/template.service';

@Component({
  selector: 'app-event-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './event-edit.html'
})
export class EventEdit implements OnInit {
  private readonly eventService = inject(EventService);
  private readonly templateService = inject(TemplateService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly eventId = signal<number | null>(null);
  protected readonly title = signal('');
  protected readonly eventDateOnly = signal('');
  protected readonly eventTimeOnly = signal('');
  protected readonly location = signal('');
  protected readonly guestCount = signal<number | null>(null);
  protected readonly status = signal<'DRAFT' | 'PLANNED' | 'COMPLETED' | 'CANCELLED'>('PLANNED');
  protected readonly selectedTemplateId = signal<number | null>(null);
  protected readonly templates = signal<DigitalTemplate[]>([]);
  
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

    this.templateService.getTemplates().subscribe({
      next: (tpls) => this.templates.set(tpls),
      error: (err) => console.error('Erreur lors du chargement des modèles:', err)
    });
  }

  private loadEvent(id: number): void {
    this.isLoading.set(true);
    this.eventService.getEventById(id).subscribe({
      next: (data) => {
        this.title.set(data.title);
        // Formater la date pour <input type="datetime-local"> (yyyy-MM-ddTHH:mm)
        if (data.eventDate) {
          if (data.eventDate.includes('T')) {
            const parts = data.eventDate.split('T');
            this.eventDateOnly.set(parts[0]);
            if (parts[1]) {
              this.eventTimeOnly.set(parts[1].slice(0, 5));
            }
          } else {
            const date = new Date(data.eventDate);
            if (!isNaN(date.getTime())) {
              const formattedDate = date.toISOString().slice(0, 10);
              const formattedTime = date.toISOString().slice(11, 16);
              this.eventDateOnly.set(formattedDate);
              this.eventTimeOnly.set(formattedTime);
            }
          }
        }
        this.location.set(data.location);
        this.guestCount.set(data.guestCount ?? null);
        if (data.status) {
          this.status.set(data.status);
        }
        if (data.digitalTemplateId) {
          this.selectedTemplateId.set(data.digitalTemplateId);
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
    if (!this.eventId() || !this.title() || !this.eventDateOnly() || !this.location()) {
      this.errorMessage.set('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    if (this.guestCount() !== null && this.guestCount() !== undefined && this.guestCount()! <= 0) {
      this.errorMessage.set('Le nombre d\'invités doit être supérieur à 0.');
      return;
    }

    this.isSaving.set(true);
    this.errorMessage.set('');

    const dateVal = this.eventDateOnly() + (this.eventTimeOnly() ? 'T' + this.eventTimeOnly() : 'T00:00');
    const chosenTemplate = this.templates().find(t => t.id === this.selectedTemplateId());

    this.eventService.updateEvent(this.eventId()!, {
      id: this.eventId()!,
      title: this.title(),
      eventDate: dateVal,
      location: this.location(),
      guestCount: this.guestCount(),
      status: this.status(),
      digitalTemplateId: chosenTemplate?.id || undefined,
      templateId: chosenTemplate?.templateKey || (chosenTemplate?.category === 'Mariage' ? 'fleurs-de-coton' : 'corporate-professional')
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
