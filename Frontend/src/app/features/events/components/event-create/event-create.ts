import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { EventService } from '../../services/event.service';
import { CatererService } from '../../../../core/services/caterer.service';
import { TemplateService, DigitalTemplate } from '../../../../core/services/template.service';
import { TranslatePipe } from '../../../../core/pipes/translate.pipe';

@Component({
  selector: 'app-event-create',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TranslatePipe],
  templateUrl: './event-create.html'
})
export class EventCreate implements OnInit {
  private readonly eventService = inject(EventService);
  private readonly catererService = inject(CatererService);
  private readonly templateService = inject(TemplateService);
  private readonly router = inject(Router);

  protected readonly title = signal('');
  protected readonly clientName = signal('');
  protected readonly clientPhone = signal('');
  protected readonly clientEmail = signal('');
  protected readonly invitationSubtitle = signal('');
  protected readonly eventDateOnly = signal('');
  protected readonly eventTimeOnly = signal<string | null>(null);
  protected readonly location = signal('');
  protected readonly locationMapUrl = signal('');
  protected readonly parkingLocation = signal('');
  protected readonly guestCount = signal<number | null>(null);
  protected readonly isPaidEvent = signal<boolean>(false);
  protected readonly ticketPrice = signal<number>(0);
  protected readonly currency = signal<string>('MAD');
  protected readonly tableShape = signal<string>('ROUND');
  protected readonly tableCapacity = signal<number>(10);
  protected readonly tablesCount = signal<number | null>(null);
  protected readonly status = signal<'DRAFT' | 'PLANNED' | 'COMPLETED' | 'CANCELLED'>('DRAFT');
  protected readonly selectedTemplateId = signal<number | null>(null);
  protected readonly templates = signal<DigitalTemplate[]>([]);
  protected readonly errorMessage = signal('');
  protected readonly isLoading = signal(false);
  protected readonly isQuotaReached = signal(false);

  // Stepper State
  protected readonly activeStep = signal<number>(1);
  protected readonly totalSteps = 3;

  protected nextStep(): void {
    if (this.activeStep() === 1) {
      if (!this.title()) {
        this.errorMessage.set('Veuillez spécifier le nom de l\'événement.');
        return;
      }
      if (this.guestCount() !== null && this.guestCount() !== undefined && this.guestCount()! < 0) {
        this.errorMessage.set('Le nombre d\'invités ne peut pas être négatif.');
        return;
      }
    } else if (this.activeStep() === 2) {
      if (!this.eventDateOnly() || !this.location()) {
        this.errorMessage.set('Veuillez spécifier la date et le lieu de l\'événement.');
        return;
      }
    }

    this.errorMessage.set('');
    if (this.activeStep() < this.totalSteps) {
      this.activeStep.update(s => s + 1);
    }
  }

  protected prevStep(): void {
    this.errorMessage.set('');
    if (this.activeStep() > 1) {
      this.activeStep.update(s => s - 1);
    }
  }

  // Autocomplete state
  protected readonly isSubtitleDropdownOpen = signal(false);
  protected readonly allSubtitles = [
    'Le Mariage de', 'Les Fiançailles de', 'Soirée de Gala', 'Dîner d\'Affaires',
    'Événement d\'Entreprise', 'Lancement de Produit', 'Conférence & Réception',
    'L\'Anniversaire de', 'La Célébration de Naissance de', 'L\'Aqiqah de',
    'La Circoncision de', 'Soirée Henné de', 'Invitation d\'Exception'
  ];

  protected get filteredSubtitles(): string[] {
    const term = this.invitationSubtitle()?.toLowerCase() || '';
    if (!term) return this.allSubtitles;
    return this.allSubtitles.filter(s => s.toLowerCase().includes(term));
  }

  protected selectSubtitle(subtitle: string): void {
    this.invitationSubtitle.set(subtitle);
    this.isSubtitleDropdownOpen.set(false);
  }

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
    // Validate Step 1/2 again just in case, though nextStep handles them
    if (!this.title() || !this.eventDateOnly() || !this.location()) {
      this.errorMessage.set('Veuillez remplir tous les champs obligatoires des étapes précédentes.');
      return;
    }

    if (this.guestCount() !== null && this.guestCount() !== undefined && this.guestCount()! < 0) {
      this.errorMessage.set('Le nombre d\'invités ne peut pas être négatif.');
      return;
    }

    // Validate Step 3 (Client Info)
    if (!this.clientName() || !this.clientPhone() || !this.clientEmail()) {
      this.errorMessage.set('Les informations du client (Nom, Téléphone et Email) sont obligatoires.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    const dateVal = this.eventDateOnly() + (this.eventTimeOnly() ? 'T' + this.eventTimeOnly() : 'T00:00');
    const chosenTemplate = this.templates().find(t => t.id === this.selectedTemplateId());

    this.eventService.createEvent({
      title: this.title(),
      clientName: this.clientName() || undefined,
      clientPhone: this.clientPhone() || undefined,
      clientEmail: this.clientEmail() || undefined,
      eventDate: dateVal,
      location: this.location(),
      locationMapUrl: this.locationMapUrl() || undefined,
      invitationLocation: this.location(),
      invitationTitle: this.title(),
      invitationSubtitle: this.invitationSubtitle() || undefined,
      invitationDate: dateVal,
      parkingLocation: this.parkingLocation() || undefined,
      guestCount: this.guestCount(),
      status: this.status(),
      digitalTemplateId: chosenTemplate?.id || undefined,
      templateId: chosenTemplate?.templateKey || (chosenTemplate?.category === 'Mariage' ? 'fleurs-de-coton' : 'corporate-professional'),
      mealType: 'PLATS_FIXES', // Default to PLATS_FIXES on creation, can be changed in Restaurations dashboard
      isPaidEvent: this.isPaidEvent(),
      ticketPrice: this.isPaidEvent() ? this.ticketPrice() : 0,
      currency: this.currency(),
      tableShape: this.tableShape(),
      tableCapacity: this.tableCapacity() || 10,
      tablesCount: this.tablesCount() || undefined
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
