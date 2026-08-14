import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { EventService } from '../../services/event.service';
import { TemplateService, DigitalTemplate } from '../../../../core/services/template.service';
import { GuestService, Guest } from '../../../../core/services/guest.service';
import { Event } from '../../models/event.model';
import { 
  TEMPLATE_TAXONOMY, 
  MainCategoryInfo, 
  SubCategoryInfo, 
  getCategoryTaxonomy 
} from '../../../../core/constants/template-taxonomy.constants';

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
  private readonly guestService = inject(GuestService);

  protected readonly event = signal<Event | null>(null);
  protected readonly templates = signal<DigitalTemplate[]>([]);
  protected readonly guests = signal<Guest[]>([]);
  protected readonly selectedGuestIds = signal<Record<number, boolean>>({});
  protected readonly channelWhatsapp = signal(true);
  protected readonly channelEmail = signal(true);
  protected readonly channelSms = signal(false);
  protected readonly channelPaper = signal(false);
  protected readonly isSending = signal(false);

  protected readonly hasSelectedChannel = computed(() => {
    return this.channelWhatsapp() || this.channelEmail() || this.channelSms() || this.channelPaper();
  });
  protected readonly sendSuccessMessage = signal('');

  protected readonly isLoading = signal(true);
  protected readonly isSubmitting = signal(false);
  protected readonly successMessage = signal('');
  protected readonly errorMessage = signal('');

  // Taxonomy & Filters
  protected readonly taxonomy = TEMPLATE_TAXONOMY;
  protected readonly selectedCategory = signal<string>('TRADITIONAL');
  protected readonly selectedSubCategory = signal<string>('ALL');

  protected readonly currentMainCategoryInfo = computed(() => getCategoryTaxonomy(this.selectedCategory()));
  protected readonly availableSubCategoriesForFilter = computed(() => this.currentMainCategoryInfo()?.subCategories || []);

  // Filtered templates
  protected readonly filteredTemplates = computed(() => {
    const cat = this.selectedCategory();
    const sub = this.selectedSubCategory();
    const mainCat = getCategoryTaxonomy(cat);
    
    let list = this.templates();
    if (mainCat) {
      list = list.filter(t => {
        const tMain = getCategoryTaxonomy(t.category);
        return tMain?.id === mainCat.id || t.category === mainCat.name;
      });
    }

    if (sub !== 'ALL') {
      list = list.filter(t => t.subCategory === sub);
    }

    return list;
  });

  // Modal / Form state
  protected readonly isModalOpen = signal(false);
  protected readonly selectedTemplate = signal<DigitalTemplate | null>(null);

  // Customized invitation fields
  protected invitationTitle = '';
  protected invitationSubtitle = '';
  protected invitationDateStr = '';
  protected invitationTimeStr = '';
  protected invitationLocation = '';
  protected invitationParking = '';
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
    this.selectedSubCategory.set('ALL');
  }

  protected setSubCategory(subCategory: string): void {
    this.selectedSubCategory.set(subCategory);
  }

  public setQuickSubtitle(subtitle: string): void {
    this.invitationSubtitle = subtitle;
  }

  public getMainCategoryBadgeClass(category: string): string {
    const tax = getCategoryTaxonomy(category);
    return tax ? tax.badgeClass : 'bg-secondary-subtle text-secondary';
  }

  public getMainCategoryIcon(category: string): string {
    const tax = getCategoryTaxonomy(category);
    return tax ? tax.icon : 'fa-tag';
  }

  public getSubCategoryIcon(category: string, subCategory?: string): string {
    if (!subCategory) return 'fa-folder';
    const tax = getCategoryTaxonomy(category);
    const sub = tax?.subCategories.find(s => s.name.toLowerCase() === subCategory.toLowerCase());
    return sub ? sub.icon : 'fa-star';
  }

  private loadData(eventId: number): void {
    this.isLoading.set(true);

    // Fetch templates first
    this.templateService.getTemplates().subscribe({
      next: (templateList) => {
        const modifiedList = templateList.map(t => {
          if (t.id === 2 || t.title === 'Or & Velours') {
            return {
              ...t,
              imageUrl: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=500'
            };
          }
          return t;
        });
        this.templates.set(modifiedList);

        // Fetch guests
        this.guestService.getGuestsByEvent(eventId).subscribe({
          next: (guestList) => {
            const updatedList = (guestList || []).map(g => {
              if (!g.id) return g;
              const localSent = localStorage.getItem(`guest_${g.id}_isSent`);
              if (localSent === 'true') {
                return { ...g, isSent: true, invitationStatus: 'SENT' };
              }
              return g;
            });
            this.guests.set(updatedList);

            // Default select only guests who are STILL PENDING (not sent yet)
            const initialSelection: Record<number, boolean> = {};
            updatedList.forEach(g => {
              if (g.id) {
                initialSelection[g.id] = !(g.isSent === true || g.invitationStatus === 'SENT');
              }
            });
            this.selectedGuestIds.set(initialSelection);
          },
          error: (err) => {
            console.error('Erreur chargement invités:', err);
          }
        });

        // Then fetch event details
        this.eventService.getEventById(eventId).subscribe({
          next: (evt) => {
            this.event.set(evt);
            
            // Pre-fill customization fields with existing invitation info or default to event details
            this.invitationTitle = evt.invitationTitle || evt.title;
            this.invitationSubtitle = evt.invitationSubtitle || '';
            this.invitationLocation = evt.invitationLocation || evt.location;
            this.invitationParking = evt.parkingLocation || '';
            
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
                const tax = getCategoryTaxonomy(selected.category);
                if (tax) {
                  this.selectedCategory.set(tax.id);
                  if (selected.subCategory) {
                    this.selectedSubCategory.set(selected.subCategory);
                  }
                }
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
        this.errorMessage.set('Impossible de charger les modèles d\'invitation.');
        this.isLoading.set(false);
      }
    });
  }

  protected selectTemplate(template: DigitalTemplate): void {
    this.selectedTemplate.set(template);
    
    // Auto fill defaults corresponding to the chosen celebration
    const evt = this.event();
    if (evt) {
      if (!this.invitationTitle) this.invitationTitle = evt.title;
      
      // Auto-set subtitle according to the template's celebration subcategory
      const tax = getCategoryTaxonomy(template.category);
      const sub = tax?.subCategories.find(s => s.name.toLowerCase() === template.subCategory?.toLowerCase());
      this.invitationSubtitle = sub?.defaultSubtitle || evt.invitationSubtitle || 'Invitation d\'Exception';
      
      if (!this.invitationLocation) this.invitationLocation = evt.location;
      if (!this.invitationParking) this.invitationParking = evt.parkingLocation || '';
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

    const combinedDate = new Date(`${this.invitationDateStr}T${this.invitationTimeStr}:00`);

    const templateIdString = template.templateKey || 
      (template.id === 1 ? 'fleurs-de-coton' : 
      (template.id === 2 ? 'or-et-velours' : 
      (template.id === 3 ? 'corporate-professional' : 
      (template.category === 'Mariage' ? 'fleurs-de-coton' : 'corporate-professional'))));

    const payload = {
      templateId: template.id,
      templateIdString: templateIdString,
      invitationTitle: this.invitationTitle,
      invitationSubtitle: this.invitationSubtitle,
      invitationDate: combinedDate.toISOString(),
      invitationLocation: this.invitationLocation,
      parkingLocation: this.invitationParking
    };

    this.eventService.setupInvitation(evt.id!, payload).subscribe({
      next: (res) => {
        this.successMessage.set('Invitation personnalisée avec succès !');
        this.invitationToken = res.invitationToken;
        this.updateInvitationLink(res.invitationToken);
        
        // Update local event state
        this.event.update(e => e ? {
          ...e,
          digitalTemplateId: template.id,
          templateId: res.templateIdString,
          invitationTitle: res.invitationTitle,
          invitationSubtitle: res.invitationSubtitle,
          invitationDate: res.invitationDate,
          invitationLocation: res.invitationLocation,
          parkingLocation: res.parkingLocation,
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
    this.invitationLink.set(`${window.location.origin}/rsvp/[ID_INVITE]`);
  }

  protected toggleGuest(guestId: number): void {
    this.selectedGuestIds.update(selection => ({
      ...selection,
      [guestId]: !selection[guestId]
    }));
  }

  protected toggleAllGuests(event: any): void {
    const isChecked = event.target.checked;
    const selection: Record<number, boolean> = {};
    this.guests().forEach(g => {
      if (g.id) {
        if (isChecked) {
          selection[g.id] = !(g.isSent === true || g.invitationStatus === 'SENT');
        } else {
          selection[g.id] = false;
        }
      }
    });
    this.selectedGuestIds.set(selection);
  }

  protected isAllSelected(): boolean {
    const list = this.guests().filter(g => !(g.isSent === true || g.invitationStatus === 'SENT'));
    if (list.length === 0) return false;
    const selection = this.selectedGuestIds();
    return list.every(g => g.id && selection[g.id]);
  }

  protected getSelectedCount(): number {
    const selection = this.selectedGuestIds();
    return this.guests().filter(g => g.id && selection[g.id]).length;
  }

  protected sendInvitations(): void {
    const selectedCount = this.getSelectedCount();
    if (selectedCount === 0) {
      this.errorMessage.set('Veuillez sélectionner au moins un invité à qui envoyer l\'invitation.');
      setTimeout(() => this.errorMessage.set(''), 3000);
      return;
    }

    const activeChannels: string[] = [];
    if (this.channelWhatsapp()) activeChannels.push('WhatsApp');
    if (this.channelEmail()) activeChannels.push('E-mail');
    if (this.channelSms()) activeChannels.push('SMS');
    if (this.channelPaper()) activeChannels.push('Papier');

    if (activeChannels.length === 0) {
      this.errorMessage.set("Veuillez sélectionner au moins un canal d'envoi.");
      setTimeout(() => this.errorMessage.set(''), 3000);
      return;
    }

    this.isSending.set(true);
    this.sendSuccessMessage.set('');

    const channelLabel = activeChannels.join(' & ');

    console.log(`--- ENVOI DES INVITATIONS VIA ${activeChannels.join(', ')} ---`);
    const currentGuests = this.guests();
    const updatedGuests = currentGuests.map(guest => {
      if (guest.id && this.selectedGuestIds()[guest.id]) {
        const guestLink = `${window.location.origin}/rsvp/${guest.id}`;
        console.log(`Envoi à: ${guest.fullName} | Lien unique: ${guestLink} | Canaux: ${activeChannels.join(', ')}`);
        localStorage.setItem(`guest_${guest.id}_isSent`, 'true');
        return { ...guest, isSent: true, invitationStatus: 'SENT' };
      }
      return guest;
    });

    // Simulate sending network latency
    setTimeout(() => {
      this.guests.set(updatedGuests);

      // Reset selection of checkboxes: only keep pending ones checked
      const newSelection: Record<number, boolean> = {};
      updatedGuests.forEach(g => {
        if (g.id) {
          newSelection[g.id] = !(g.isSent === true || g.invitationStatus === 'SENT');
        }
      });
      this.selectedGuestIds.set(newSelection);

      this.isSending.set(false);
      this.sendSuccessMessage.set(`Félicitations ! Les invitations ont été envoyées avec succès à ${selectedCount} invité(s) via ${channelLabel}.`);
      setTimeout(() => this.sendSuccessMessage.set(''), 5000);
    }, 1500);
  }
}
