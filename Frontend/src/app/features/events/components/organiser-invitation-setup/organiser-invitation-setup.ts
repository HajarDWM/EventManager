import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { EventService } from '../../services/event.service';
import { TemplateService, DigitalTemplate } from '../../../../core/services/template.service';
import { Event } from '../../models/event.model';

@Component({
  selector: 'app-organiser-invitation-setup',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './organiser-invitation-setup.html',
  styleUrls: ['./organiser-invitation-setup.scss']
})
export class OrganiserInvitationSetup implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly eventService = inject(EventService);
  private readonly templateService = inject(TemplateService);

  protected readonly event = signal<Event | null>(null);
  protected readonly templates = signal<DigitalTemplate[]>([]);
  protected readonly isLoading = signal(true);
  protected readonly isSubmitting = signal(false);
  protected readonly successMessage = signal('');
  protected readonly errorMessage = signal('');

  // Tabs/Filter
  protected readonly selectedCategory = signal<string>('Mariage'); // 'Mariage' | 'Corporate'

  // Filtered templates
  protected readonly filteredTemplates = computed(() => {
    const category = this.selectedCategory();
    return this.templates().filter(t => t.category === category);
  });

  // Modal / Form state
  protected readonly isModalOpen = signal(false);
  protected readonly selectedTemplate = signal<DigitalTemplate | null>(null);

  // Customized invitation fields
  protected invitationTitle = '';
  protected invitationDateStr = '';
  protected invitationTimeStr = '';
  protected invitationLocation = '';
  protected invitationToken = '';

  // Generated Link Info
  protected readonly invitationLink = signal<string>('');
  protected isCopied = false;

  public ngOnInit(): void {
    const eventIdStr = this.route.snapshot.paramMap.get('id');
    if (!eventIdStr) {
      this.errorMessage.set('Événement non valide.');
      this.isLoading.set(false);
      return;
    }

    const eventId = parseInt(eventIdStr, 10);
    this.loadData(eventId);
  }

  protected setCategory(category: string): void {
    this.selectedCategory.set(category);
  }

  private loadData(eventId: number): void {
    this.isLoading.set(true);

    // Fetch templates first
    this.templateService.getTemplates().subscribe({
      next: (templateList) => {
        this.templates.set(templateList);

        // Then fetch event details
        this.eventService.getEventById(eventId).subscribe({
          next: (evt) => {
            this.event.set(evt);
            
            // Pre-fill customization fields with existing invitation info or default to event details
            this.invitationTitle = evt.invitationTitle || evt.title;
            this.invitationLocation = evt.invitationLocation || evt.location;
            
            const rawDate = evt.invitationDate ? new Date(evt.invitationDate) : new Date(evt.eventDate);
            this.invitationDateStr = rawDate.toISOString().split('T')[0];
            this.invitationTimeStr = rawDate.toTimeString().split(' ')[0].substring(0, 5);
            
            this.invitationToken = evt.invitationToken || '';
            if (this.invitationToken) {
              this.updateInvitationLink(this.invitationToken);
            }

            // Find selected template if any
            if (evt.digitalTemplateId) {
              const selected = templateList.find(t => t.id === evt.digitalTemplateId);
              if (selected) {
                this.selectedTemplate.set(selected);
                this.selectedCategory.set(selected.category);
              }
            }

            this.isLoading.set(false);
          },
          error: (err) => {
            console.error(err);
            this.errorMessage.set('Impossible de charger les détails de l\'événement.');
            this.isLoading.set(false);
          }
        });
      },
      error: (err) => {
        console.error(err);
        this.errorMessage.set('Impossible de charger les modèles de faire-part.');
        this.isLoading.set(false);
      }
    });
  }

  protected selectTemplate(template: DigitalTemplate): void {
    this.selectedTemplate.set(template);
    
    // Auto fill defaults if they are blank
    const evt = this.event();
    if (evt) {
      if (!this.invitationTitle) this.invitationTitle = evt.title;
      if (!this.invitationLocation) this.invitationLocation = evt.location;
      if (!this.invitationDateStr) {
        const rawDate = new Date(evt.eventDate);
        this.invitationDateStr = rawDate.toISOString().split('T')[0];
        this.invitationTimeStr = rawDate.toTimeString().split(' ')[0].substring(0, 5);
      }
    }

    this.isModalOpen.set(true);
  }

  protected closeModal(): void {
    this.isModalOpen.set(false);
  }

  protected saveSetup(): void {
    const evt = this.event();
    const template = this.selectedTemplate();
    if (!evt || !template) return;

    this.isSubmitting.set(true);
    this.errorMessage.set('');

    // Combine date and time
    const combinedDate = new Date(`${this.invitationDateStr}T${this.invitationTimeStr}:00`);

    let templateIdString = 'or-et-velours';
    if (template.id === 1) {
      templateIdString = 'fleurs-de-coton';
    } else if (template.id === 2) {
      templateIdString = 'or-et-velours';
    } else if (template.id === 3) {
      templateIdString = 'seminaire-imperial';
    } else {
      templateIdString = template.category === 'Mariage' ? 'fleurs-de-coton' : 'or-et-velours';
    }

    const payload = {
      templateId: template.id,
      templateIdString: templateIdString,
      invitationTitle: this.invitationTitle,
      invitationDate: combinedDate.toISOString(),
      invitationLocation: this.invitationLocation
    };

    this.eventService.setupInvitation(evt.id!, payload).subscribe({
      next: (res) => {
        this.successMessage.set('Faire-part personnalisé avec succès !');
        this.invitationToken = res.invitationToken;
        this.updateInvitationLink(res.invitationToken);
        
        // Update local event state
        this.event.update(e => e ? {
          ...e,
          digitalTemplateId: template.id,
          invitationTitle: res.invitationTitle,
          invitationDate: res.invitationDate,
          invitationLocation: res.invitationLocation,
          invitationToken: res.invitationToken
        } : null);

        this.closeModal();
        this.isSubmitting.set(false);
        setTimeout(() => this.successMessage.set(''), 4000);
      },
      error: (err) => {
        console.error(err);
        this.errorMessage.set('Une erreur est survenue lors de l\'enregistrement.');
        this.isSubmitting.set(false);
      }
    });
  }

  private updateInvitationLink(token: string): void {
    // Generate a clean invitation link pattern or base route
    this.invitationLink.set(`${window.location.origin}/rsvp/[ID_INVITE]`);
  }

  protected copyLink(): void {
    const linkText = this.invitationLink();
    if (!linkText) return;

    navigator.clipboard.writeText(linkText).then(() => {
      this.isCopied = true;
      setTimeout(() => this.isCopied = false, 2000);
    });
  }
}
