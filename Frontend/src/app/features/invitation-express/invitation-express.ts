import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { ExpressInvitationService, ExpressGuestResponse, ExpressInvitationResponse } from './services/express-invitation.service';
import { TemplateService, DigitalTemplate } from '../../core/services/template.service';

export interface EventTypeOption {
  id: string;
  labelFr: string;
  labelAr: string;
  icon: string;
  defaultSubtitleFr: string;
  defaultSubtitleAr: string;
  placeholderTitle?: string;
  categoryFilter?: string;
}

@Component({
  selector: 'app-invitation-express',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './invitation-express.html',
  styleUrls: ['./invitation-express.scss']
})
export class InvitationExpress implements OnInit {
  private readonly expressService = inject(ExpressInvitationService);
  private readonly templateService = inject(TemplateService);
  private readonly router = inject(Router);

  // Stepper: 1 = Informations, 2 = Choix du modèle, 3 = Invités & WhatsApp
  public readonly currentStep = signal<1 | 2 | 3>(1);

  // Step 1: Form Inputs
  public eventType = signal<string>('Mariage');
  public title = signal<string>('');
  public subtitle = signal<string>('Le Mariage de');
  public eventDate = signal<string>('');
  public eventTime = signal<string>('19:00');
  public location = signal<string>('');
  public locationMapUrl = signal<string>('');

  // Step 2: Templates
  public readonly templates = signal<DigitalTemplate[]>([]);
  public readonly selectedTemplateId = signal<number | null>(null);
  public readonly showAllTemplates = signal<boolean>(false);
  public readonly isLoadingTemplates = signal<boolean>(false);

  // Subtitle Autocomplete / Dropdown State (comme Image 2)
  public readonly isSubtitleDropdownOpen = signal<boolean>(false);
  public readonly allSubtitles: string[] = [
    'Le Mariage de',
    'Les Fiançailles de',
    'Soirée de Gala',
    'Dîner d\'Affaires',
    'Événement d\'Entreprise',
    'Lancement de Produit',
    'Conférence & Réception',
    'L\'Anniversaire de',
    'La Célébration de Naissance de',
    'L\'Aqiqah de',
    'La Circoncision de',
    'Soirée Henné de',
    'Célébration de Diplôme de',
    'Réunion de Famille de',
    'Invitation d\'Exception'
  ];

  public readonly filteredSubtitles = computed(() => {
    const term = (this.subtitle() || '').toLowerCase().trim();
    if (!term) return this.allSubtitles;
    return this.allSubtitles.filter(s => s.toLowerCase().includes(term));
  });

  // Step 3: Event Created & Guests Management
  public readonly createdEvent = signal<ExpressInvitationResponse | null>(null);
  public readonly isSubmittingEvent = signal<boolean>(false);
  public readonly submissionError = signal<string>('');

  // New guest form
  public newGuestName = signal<string>('');
  public newGuestPhone = signal<string>('');
  public readonly isAddingGuest = signal<boolean>(false);
  public readonly guestAddError = signal<string>('');

  // General invite link copy state
  public readonly linkCopied = signal<boolean>(false);

  // Event types catalog & suggestions
  public readonly eventTypes: EventTypeOption[] = [
    {
      id: 'MARIAGE',
      labelFr: 'Mariage',
      labelAr: 'حفل زفاف',
      icon: 'fa-heart',
      defaultSubtitleFr: 'Le Mariage de',
      defaultSubtitleAr: 'حفل زفاف',
      placeholderTitle: 'Ex: Sarah & Youssef',
      categoryFilter: 'Tradition'
    },
    {
      id: 'FIANCAILLES',
      labelFr: 'Fiançailles',
      labelAr: 'خطوبة',
      icon: 'fa-ring',
      defaultSubtitleFr: 'Les Fiançailles de',
      defaultSubtitleAr: 'حفل خطوبة',
      placeholderTitle: 'Ex: Sofia & Mehdi',
      categoryFilter: 'Tradition'
    },
    {
      id: 'HENNE',
      labelFr: 'Henné',
      labelAr: 'ليلة الحناء',
      icon: 'fa-spa',
      defaultSubtitleFr: 'Soirée Henné de',
      defaultSubtitleAr: 'ليلة حناء',
      placeholderTitle: 'Ex: Kenza',
      categoryFilter: 'Tradition'
    },
    {
      id: 'CIRCONCISION',
      labelFr: 'Circoncision',
      labelAr: 'حفل ختان',
      icon: 'fa-crown',
      defaultSubtitleFr: 'La Célébration de Circoncision de',
      defaultSubtitleAr: 'حفل ختان مبارك',
      placeholderTitle: 'Ex: Rayan',
      categoryFilter: 'Tradition'
    },
    {
      id: 'SBOU3',
      labelFr: 'Sbou3 & Aqiqah',
      labelAr: 'عقيقة وسبوع',
      icon: 'fa-baby',
      defaultSubtitleFr: 'La Célébration de Naissance de',
      defaultSubtitleAr: 'حفل عقيقة ومولود مبارك',
      placeholderTitle: 'Ex: Amir',
      categoryFilter: 'Famille'
    },
    {
      id: 'ANNIVERSAIRE',
      labelFr: 'Anniversaire',
      labelAr: 'عيد ميلاد',
      icon: 'fa-cake-candles',
      defaultSubtitleFr: 'L\'Anniversaire de',
      defaultSubtitleAr: 'عيد ميلاد سعيد',
      placeholderTitle: 'Ex: Leila',
      categoryFilter: 'Famille'
    },
    {
      id: 'DIPLOME',
      labelFr: 'Remise de Diplôme',
      labelAr: 'حفل تخرج',
      icon: 'fa-graduation-cap',
      defaultSubtitleFr: 'Célébration de Diplôme de',
      defaultSubtitleAr: 'حفل تخرج واحتفاء بالنجاح',
      placeholderTitle: 'Ex: Docteur Anas',
      categoryFilter: 'Scolaire'
    },
    {
      id: 'DINER',
      labelFr: 'Dîner & Soirée Gala',
      labelAr: 'عشاء واستقبال فاخر',
      icon: 'fa-martini-glass-citrus',
      defaultSubtitleFr: 'Soirée de Gala',
      defaultSubtitleAr: 'حفل عشاء واستقبال',
      placeholderTitle: 'Ex: Soirée Annuelle Tech Horizons',
      categoryFilter: 'Corporate'
    },
    {
      id: 'CONFERENCE',
      labelFr: 'Conférence & Séminaire',
      labelAr: 'مؤتمر وندوة',
      icon: 'fa-microphone-alt',
      defaultSubtitleFr: 'Conférence & Réception',
      defaultSubtitleAr: 'مؤتمر واستقبال',
      placeholderTitle: 'Ex: Forum & Séminaire 2026',
      categoryFilter: 'Corporate'
    },
    {
      id: 'FAMILLE',
      labelFr: 'Fête de Famille',
      labelAr: 'لمة عائلية',
      icon: 'fa-users',
      defaultSubtitleFr: 'Réunion de Famille de',
      defaultSubtitleAr: 'لم شمل عائلي',
      placeholderTitle: 'Ex: Famille Benkirane',
      categoryFilter: 'Famille'
    }
  ];

  public readonly titlePlaceholder = computed(() => {
    const cur = (this.eventType() || '').trim().toLowerCase();
    const match = this.eventTypes.find(opt => 
      cur === opt.labelFr.toLowerCase() || 
      cur === opt.id.toLowerCase() || 
      cur.includes(opt.labelFr.toLowerCase())
    );
    return match?.placeholderTitle || 'Ex: Mariage de Sarah & Youssef, Soirée Henné de Kenza...';
  });

  public readonly recommendedTemplates = computed(() => {
    const all = this.templates();
    if (all.length === 0) return [];

    const norm = (str: string) => (str || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();

    const typeStr = norm(this.eventType());
    const subStr = norm(this.subtitle());
    const combined = `${typeStr} ${subStr}`;

    let targetSub = '';
    let targetCat = '';

    if (combined.includes('mariage') || combined.includes('زفاف') || combined.includes('عرس')) {
      targetSub = 'mariage';
      targetCat = 'tradition';
    } else if (combined.includes('fianc') || combined.includes('خطوب')) {
      targetSub = 'fiancailles';
      targetCat = 'tradition';
    } else if (combined.includes('henn') || combined.includes('حناء') || combined.includes('حنة')) {
      targetSub = 'henne';
      targetCat = 'tradition';
    } else if (combined.includes('circonc') || combined.includes('tahra') || combined.includes('ختان')) {
      targetSub = 'circoncision';
      targetCat = 'tradition';
    } else if (combined.includes('sbou') || combined.includes('aqiq') || combined.includes('naissance') || combined.includes('عقيق') || combined.includes('سبوع') || combined.includes('baby shower')) {
      targetSub = 'baby shower';
      targetCat = 'famille';
    } else if (combined.includes('anniv') || combined.includes('birthday') || combined.includes('ميلاد')) {
      targetSub = 'anniversaire';
      targetCat = 'famille';
    } else if (combined.includes('dipl') || combined.includes('soutenance') || combined.includes('تخرج')) {
      targetSub = 'diplome';
      targetCat = 'scolaire';
    } else if (combined.includes('gala') || combined.includes('diner') || combined.includes('affaires') || combined.includes('عشاء') || combined.includes('استقبال')) {
      targetSub = 'gala';
      targetCat = 'corporate';
    } else if (combined.includes('conf') || combined.includes('semin') || combined.includes('مؤتمر') || combined.includes('ندوة')) {
      targetSub = 'seminaire';
      targetCat = 'corporate';
    } else if (combined.includes('famill') || combined.includes('عائل')) {
      targetSub = 'famille';
      targetCat = 'famille';
    }

    let matches: DigitalTemplate[] = [];

    if (targetSub) {
      matches = all.filter(t => {
        const tSub = norm(t.subCategory || '');
        const tTitle = norm(t.title || '');
        return tSub.includes(targetSub) || targetSub.includes(tSub) || tTitle.includes(targetSub);
      });
    }

    if (matches.length === 0 && targetCat) {
      matches = all.filter(t => norm(t.category || '').includes(targetCat));
    }

    if (matches.length === 0 && typeStr) {
      matches = all.filter(t => {
        const tSub = norm(t.subCategory || '');
        const tCat = norm(t.category || '');
        const tTitle = norm(t.title || '');
        return typeStr.includes(tSub) || tSub.includes(typeStr) || tTitle.includes(typeStr) || tCat.includes(typeStr);
      });
    }

    return matches.length > 0 ? matches : all;
  });

  public readonly recommendedCount = computed(() => this.recommendedTemplates().length);

  public readonly filteredTemplates = computed(() => {
    return this.showAllTemplates() ? this.templates() : this.recommendedTemplates();
  });

  public readonly selectedTemplate = computed(() => {
    const id = this.selectedTemplateId();
    if (!id) return null;
    return this.templates().find(t => t.id === id) || null;
  });

  public ngOnInit(): void {
    this.selectEventType(this.eventTypes[0]);
    this.loadTemplates();
    this.restoreSessionIfAny();
  }

  public selectEventType(option: EventTypeOption): void {
    this.eventType.set(option.labelFr);
    this.subtitle.set(option.defaultSubtitleFr);
  }

  public onEventTypeChange(val: string): void {
    this.eventType.set(val);
    const low = (val || '').toLowerCase().trim();
    if (!low) return;

    // Smart detection: propose matching welcome subtitle when typing
    const match = this.eventTypes.find(opt => 
      low === opt.labelFr.toLowerCase() ||
      low === opt.id.toLowerCase() ||
      low.includes(opt.labelFr.toLowerCase()) ||
      (opt.id === 'MARIAGE' && (low.includes('mariage') || low.includes('زفاف') || low.includes('عرس'))) ||
      (opt.id === 'FIANCAILLES' && (low.includes('fianc') || low.includes('خطوب'))) ||
      (opt.id === 'HENNE' && (low.includes('henn') || low.includes('حناء') || low.includes('حنة'))) ||
      (opt.id === 'CIRCONCISION' && (low.includes('circonc') || low.includes('tahra') || low.includes('ختان'))) ||
      (opt.id === 'SBOU3' && (low.includes('sbou') || low.includes('aqiq') || low.includes('naissance') || low.includes('عقيق') || low.includes('سبوع'))) ||
      (opt.id === 'ANNIVERSAIRE' && (low.includes('anniv') || low.includes('birthday') || low.includes('ميلاد'))) ||
      (opt.id === 'DIPLOME' && (low.includes('dipl') || low.includes('soutenance') || low.includes('graduat') || low.includes('تخرج'))) ||
      (opt.id === 'DINER' && (low.includes('din') || low.includes('dîn') || low.includes('gala') || low.includes('عشاء'))) ||
      (opt.id === 'CONFERENCE' && (low.includes('conf') || low.includes('semin') || low.includes('sémin') || low.includes('مؤتمر') || low.includes('ندوة'))) ||
      (opt.id === 'FAMILLE' && (low.includes('famill') || low.includes('عائل')))
    );

    if (match) {
      this.subtitle.set(match.defaultSubtitleFr);
    }
  }

  public selectSubtitle(sub: string): void {
    this.subtitle.set(sub);
    this.isSubtitleDropdownOpen.set(false);

    // Auto-sync eventType if recognized
    const low = sub.toLowerCase();
    if (low.includes('mariage')) this.eventType.set('Mariage');
    else if (low.includes('fianc')) this.eventType.set('Fiançailles');
    else if (low.includes('henn')) this.eventType.set('Henné');
    else if (low.includes('circonc')) this.eventType.set('Circoncision');
    else if (low.includes('naissance') || low.includes('aqiq')) this.eventType.set('Sbou3 & Aqiqah');
    else if (low.includes('anniv')) this.eventType.set('Anniversaire');
    else if (low.includes('dipl')) this.eventType.set('Remise de Diplôme');
    else if (low.includes('gala') || low.includes('diner') || low.includes('dîner')) this.eventType.set('Dîner & Soirée Gala');
    else if (low.includes('conf') || low.includes('entreprise')) this.eventType.set('Conférence & Séminaire');
  }

  public onSubtitleInputChange(val: string): void {
    this.subtitle.set(val);
    this.isSubtitleDropdownOpen.set(true);
  }

  public toggleSubtitleDropdown(event?: MouseEvent): void {
    if (event) event.preventDefault();
    this.isSubtitleDropdownOpen.update(v => !v);
  }

  public onSubtitleBlur(): void {
    setTimeout(() => this.isSubtitleDropdownOpen.set(false), 200);
  }

  public isOptionSelected(opt: EventTypeOption): boolean {
    const cur = (this.eventType() || '').trim().toLowerCase();
    return cur === opt.labelFr.toLowerCase() || cur === opt.id.toLowerCase();
  }

  public loadTemplates(): void {
    this.isLoadingTemplates.set(true);
    this.templateService.getTemplates().subscribe({
      next: (list) => {
        this.templates.set(list || []);
        const available = this.filteredTemplates();
        if (available.length > 0 && !this.selectedTemplateId()) {
          this.selectedTemplateId.set(available[0].id || 1);
        }
        this.isLoadingTemplates.set(false);
      },
      error: () => {
        this.isLoadingTemplates.set(false);
      }
    });
  }

  public selectTemplate(templateId: number): void {
    this.selectedTemplateId.set(templateId);
  }

  public goToStep(step: 1 | 2 | 3): void {
    if (step === 2) {
      if (!this.title().trim()) {
        this.submissionError.set('Veuillez renseigner le nom de l\'événement.');
        return;
      }
      this.submissionError.set('');

      // Auto-select first matching template if current selection is not in list
      const available = this.filteredTemplates();
      if (available.length > 0) {
        const curSelected = this.selectedTemplateId();
        if (!curSelected || !available.some(t => t.id === curSelected)) {
          this.selectedTemplateId.set(available[0].id || null);
        }
      }
    }
    this.currentStep.set(step);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  public submitAndProceedToGuests(): void {
    if (!this.title().trim()) {
      this.currentStep.set(1);
      this.submissionError.set('Veuillez renseigner le nom de l\'événement.');
      return;
    }
    if (!this.selectedTemplateId()) {
      this.currentStep.set(2);
      this.submissionError.set('Veuillez sélectionner un modèle d\'invitation.');
      return;
    }

    this.isSubmittingEvent.set(true);
    this.submissionError.set('');

    const formattedDate = this.eventDate() ? `${this.eventDate()}T${this.eventTime() || '19:00'}:00` : '';

    this.expressService.createInvitation({
      title: this.title().trim(),
      eventType: this.eventType(),
      eventDate: formattedDate,
      location: this.location().trim(),
      locationMapUrl: this.locationMapUrl().trim(),
      invitationSubtitle: this.subtitle().trim(),
      digitalTemplateId: this.selectedTemplateId()!
    }).subscribe({
      next: (res) => {
        this.createdEvent.set(res);
        this.isSubmittingEvent.set(false);
        this.saveSession(res);
        this.currentStep.set(3);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
      error: (err) => {
        this.isSubmittingEvent.set(false);
        this.submissionError.set(err.error?.message || 'Erreur lors de la création de l\'invitation.');
      }
    });
  }

  public addGuest(): void {
    const name = this.newGuestName().trim();
    const phone = this.newGuestPhone().trim();
    const evt = this.createdEvent();

    if (!name) {
      this.guestAddError.set('Veuillez renseigner le nom de l\'invité.');
      return;
    }
    if (!evt) return;

    this.isAddingGuest.set(true);
    this.guestAddError.set('');

    this.expressService.addGuest(evt.eventId, { fullName: name, phone }).subscribe({
      next: (savedGuest) => {
        this.createdEvent.update(current => {
          if (!current) return current;
          return {
            ...current,
            guests: [savedGuest, ...current.guests]
          };
        });
        this.newGuestName.set('');
        this.newGuestPhone.set('');
        this.isAddingGuest.set(false);
        this.saveSession(this.createdEvent()!);
      },
      error: (err) => {
        this.isAddingGuest.set(false);
        this.guestAddError.set(err.error?.message || 'Erreur lors de l\'ajout de l\'invité.');
      }
    });
  }

  public openWhatsApp(guest: ExpressGuestResponse): void {
    guest.isSent = true;
    localStorage.setItem(`express_guest_${guest.id}_sent`, 'true');
    
    const origin = window.location.origin;
    const rsvpToken = guest.invitationToken || guest.rsvpLink?.replace('/rsvp/', '') || '';
    const fullRsvpUrl = `${origin}/rsvp/${rsvpToken}`;
    
    let phone = (guest.phone || '').trim().replace(/[^0-9+]/g, '');
    if (phone.startsWith('0')) {
      phone = '212' + phone.substring(1);
    } else if (phone.startsWith('+')) {
      phone = phone.substring(1);
    }

    const evt = this.createdEvent();
    const eventTitle = evt?.title || 'notre événement';
    const eventDate = evt?.eventDate ? new Date(evt.eventDate).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '';
    const eventLocation = evt?.location || '';

    const message = `السلام عليكم ${guest.fullName}،\n\n` +
      `كيتشرفوا أصحاب الحفل بالدعوة ديالكم لحضور : ${eventTitle}\n` +
      (eventDate ? `📅 التاريخ : ${eventDate}\n` : '') +
      (eventLocation ? `📍 المكان : ${eventLocation}\n\n` : '\n') +
      `للاطلاع على بطاقة الدعوة الفخمة وتأكيد الحضور أو الاطلاع على موقع القاعة عبر GPS :\n` +
      `👉 ${fullRsvpUrl}\n\n` +
      `حضوركم يسعدنا ويشرفنا كثيراً ! ❤️`;

    const encoded = encodeURIComponent(message);
    const waUrl = phone ? `https://api.whatsapp.com/send?phone=${phone}&text=${encoded}` : `https://api.whatsapp.com/send?text=${encoded}`;
    
    window.open(waUrl, '_blank');
  }

  public isGuestSent(guest: ExpressGuestResponse): boolean {
    if (guest.isSent) return true;
    return localStorage.getItem(`express_guest_${guest.id}_sent`) === 'true';
  }

  public copyGeneralLink(): void {
    const evt = this.createdEvent();
    if (!evt) return;
    const fullUrl = window.location.origin + evt.generalInviteLink;
    navigator.clipboard.writeText(fullUrl).then(() => {
      this.linkCopied.set(true);
      setTimeout(() => this.linkCopied.set(false), 3000);
    });
  }

  public refreshGuests(): void {
    const evt = this.createdEvent();
    if (!evt) return;
    this.expressService.getGuests(evt.eventId).subscribe({
      next: (guests) => {
        this.createdEvent.update(curr => curr ? { ...curr, guests } : null);
        this.saveSession(this.createdEvent()!);
      }
    });
  }

  private saveSession(eventData: ExpressInvitationResponse): void {
    try {
      localStorage.setItem('express_invitation_session', JSON.stringify(eventData));
    } catch {}
  }

  private restoreSessionIfAny(): void {
    try {
      const stored = localStorage.getItem('express_invitation_session');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.eventId) {
          this.createdEvent.set(parsed);
          this.title.set(parsed.title || '');
          this.location.set(parsed.location || '');
          this.locationMapUrl.set(parsed.locationMapUrl || '');
          this.subtitle.set(parsed.invitationSubtitle || '');
          if (parsed.digitalTemplateId) {
            this.selectedTemplateId.set(parsed.digitalTemplateId);
          }
        }
      }
    } catch {}
  }

  public startNewInvitation(): void {
    if (confirm('Voulez-vous créer une toute nouvelle invitation ?')) {
      localStorage.removeItem('express_invitation_session');
      this.createdEvent.set(null);
      this.title.set('');
      this.location.set('');
      this.locationMapUrl.set('');
      this.subtitle.set('');
      this.currentStep.set(1);
    }
  }
}

