import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { EventService } from '../../services/event.service';
import { CatererService } from '../../../../core/services/caterer.service';
import { TemplateService, DigitalTemplate } from '../../../../core/services/template.service';

@Component({
  selector: 'app-event-create',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './event-create.html'
})
export class EventCreate implements OnInit {
  private readonly eventService = inject(EventService);
  private readonly catererService = inject(CatererService);
  private readonly templateService = inject(TemplateService);
  private readonly router = inject(Router);

  protected readonly title = signal('');
  protected readonly invitationSubtitle = signal('');
  protected readonly eventDateOnly = signal('');
  protected readonly eventTimeOnly = signal('');
  protected readonly location = signal('');
  protected readonly parkingLocation = signal('');
  protected readonly guestCount = signal<number | null>(null);
  protected readonly status = signal<'DRAFT' | 'PLANNED' | 'COMPLETED' | 'CANCELLED'>('DRAFT');
  protected readonly selectedTemplateId = signal<number | null>(null);
  protected readonly templates = signal<DigitalTemplate[]>([]);
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

    this.templateService.getTemplates().subscribe({
      next: (tpls) => {
        this.templates.set(tpls);
        if (tpls.length > 0 && !this.selectedTemplateId()) {
          this.selectedTemplateId.set(tpls[0].id || null);
        }
      },
      error: (err) => console.error('Erreur lors du chargement des modèles:', err)
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
    const chosenTemplate = this.templates().find(t => t.id === this.selectedTemplateId());

    this.eventService.createEvent({
      title: this.title(),
      eventDate: dateVal,
      location: this.location(),
      invitationLocation: this.location(),
      invitationTitle: this.title(),
      invitationSubtitle: this.invitationSubtitle() || undefined,
      invitationDate: dateVal,
      parkingLocation: this.parkingLocation() || undefined,
      guestCount: this.guestCount(),
      status: this.status(),
      digitalTemplateId: chosenTemplate?.id || undefined,
      templateId: chosenTemplate?.templateKey || (chosenTemplate?.category === 'Mariage' ? 'fleurs-de-coton' : 'corporate-professional'),
      mealType: 'PLATS_FIXES' // Default to PLATS_FIXES on creation, can be changed in Restaurations dashboard
    }).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.router.navigate(['/events']);
      },
      error: (err) => {
        this.isLoading.set(false);
        if (err.status === 402 && err.error?.error === 'SUBSCRIPTION_REQUIRED') {
          this.router.navigate(['/subscription']);
        } else {
          this.errorMessage.set(
            err.error?.message || err.error?.error || 'Une erreur est survenue lors de la création de l\'événement.'
          );
        }
        console.error(err);
      }
    });
  }
}
