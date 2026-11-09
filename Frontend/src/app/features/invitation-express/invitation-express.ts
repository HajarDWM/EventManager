import { Component, OnInit, signal, computed, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
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

export interface ParsedGuestItem {
  fullName: string;
  phone: string;
  isValid: boolean;
  raw: string;
  error?: string;
}

export interface StoredExpressInvitation {
  eventId: number;
  eventToken?: string;
  title: string;
  eventType?: string;
  subtitle?: string;
  eventDate?: string;
  eventTime?: string;
  location?: string;
  locationMapUrl?: string;
  digitalTemplateId?: number;
  templateTitle?: string;
  generalInviteLink: string;
  guestsCount?: number;
  createdAt?: string;
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
  private readonly sanitizer = inject(DomSanitizer);

  // Stepper: 1 = Informations, 2 = Choix du modèle, 3 = Invités & WhatsApp
  public readonly currentStep = signal<1 | 2 | 3>(1);

  // Step 1: Form Inputs
  public eventType = signal<string>('Mariage');
  public readonly isEventTypeDropdownOpen = signal<boolean>(false);
  public title = signal<string>('');
  public subtitle = signal<string>('Le Mariage de');
  public eventDate = signal<string>('');
  public eventTime = signal<string>('19:00');
  public location = signal<string>('');
  public locationMapUrl = signal<string>('');
  public readonly minDate: string = new Date().toISOString().split('T')[0];

  // Step 2: Templates & Interactive Preview Modal
  public readonly templates = signal<DigitalTemplate[]>([]);
  public readonly selectedTemplateId = signal<number | null>(null);
  public readonly showAllTemplates = signal<boolean>(false);
  public readonly isLoadingTemplates = signal<boolean>(false);
  public readonly isPreviewModalOpen = signal<boolean>(false);
  public readonly previewTemplate = signal<DigitalTemplate | null>(null);
  public readonly previewDevice = signal<'MOBILE' | 'DESKTOP'>('MOBILE');

  public readonly modalPreviewIframeUrl = computed<SafeResourceUrl | null>(() => {
    const tpl = this.previewTemplate();
    if (!tpl || !tpl.id) return null;
    const url = `/template-preview-frame?templateId=${tpl.id}&ts=${Date.now()}`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  });

  public openTemplatePreview(t: DigitalTemplate, event?: MouseEvent): void {
    if (event) event.stopPropagation();
    this.previewTemplate.set(t);

    let combinedDate = new Date().toISOString();
    if (this.eventDate()) {
      try {
        const timePart = this.eventTime() || '19:00';
        combinedDate = new Date(`${this.eventDate()}T${timePart}:00`).toISOString();
      } catch (e) {}
    }

    const previewData = {
      guestId: 0,
      guestName: 'Cher(e) Invité(e)',
      guestEmail: 'invite@example.com',
      guestPhone: '+212 600 000 000',
      guestStatus: 'PENDING',
      tableNumber: 'Table d\'Honneur',
      dietaryRequirements: '',
      eventId: this.createdEvent()?.eventId || 0,
      eventTitle: this.title() || t.title || 'Notre Célébration',
      eventDate: combinedDate,
      eventLocation: this.location() || 'Casablanca, Maroc',
      locationMapUrl: this.locationMapUrl() || undefined,
      digitalTemplateId: t.id,
      templateId: t.templateKey || (t.id === 1 ? 'fleurs-de-coton' : (t.id === 2 ? 'or-et-velours' : (t.id === 3 ? 'corporate-professional' : 'fleurs-de-coton'))),
      templateTitle: t.title,
      templateCategory: t.category,
      decorativeFrame: t.decorativeFrame || 'gold-border',
      accentColor: t.accentColor || '#d4af37',
      backgroundColor: t.backgroundColor || '#0f172a',
      templateBackgroundImageUrl: t.backgroundImageUrl || t.imageUrl || undefined,
      templateBackgroundImageDesktopUrl: t.backgroundImageDesktopUrl || t.backgroundImageUrl || t.imageUrl || undefined,
      primaryFont: t.primaryFont || 'Cinzel',
      primaryFontSize: t.primaryFontSize || '2.8rem',
      secondaryFont: t.secondaryFont || 'Playfair Display',
      secondaryFontSize: t.secondaryFontSize || '0.9rem',
      secondaryFontColor: t.secondaryFontColor || '#e0e0e0',
      templateMusicUrl: t.musicUrl || '/assets/music/gala-ambient.mp3',
      openingAnimation: t.openingAnimation || 'none',
      visualParticles: t.visualParticles && t.visualParticles !== 'none' ? t.visualParticles : 'confetti',
      backgroundMotion: t.backgroundMotion || 'ken-burns',
      contentEntrance: t.contentEntrance || 'staggered-royal',
      invitationTitle: this.title() || t.title || 'Notre Célébration',
      invitationSubtitle: this.subtitle() || t.subCategory || 'Invitation Officielle',
      invitationDate: combinedDate,
      invitationLocation: this.location() || 'Casablanca, Maroc',
      parkingLocation: 'Parking VIP disponible',
      paymentStatus: 'UNPAID',
      paidAmount: 0
    };

    sessionStorage.setItem('active_template_preview_data', JSON.stringify(previewData));

    this.previewDevice.set('MOBILE');
    this.isPreviewModalOpen.set(true);
  }

  public closeTemplatePreview(): void {
    this.isPreviewModalOpen.set(false);
    this.previewTemplate.set(null);
  }

  public chooseTemplateFromPreview(): void {
    const tpl = this.previewTemplate();
    if (tpl && tpl.id) {
      this.selectTemplate(tpl.id);
    }
    this.closeTemplatePreview();
  }

  public setPreviewDevice(dev: 'MOBILE' | 'DESKTOP'): void {
    this.previewDevice.set(dev);
  }

  @HostListener('window:message', ['$event'])
  public onIframeMessage(event: MessageEvent): void {
    if (event.data?.type === 'PREVIEW_FRAME_READY') {
      const cached = sessionStorage.getItem('active_template_preview_data');
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          const iframes = document.querySelectorAll('iframe');
          iframes.forEach(f => {
            f.contentWindow?.postMessage({
              type: 'UPDATE_INVITATION_PREVIEW',
              payload: parsed
            }, '*');
          });
        } catch (e) {}
      }
    }
  }

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
  public readonly myInvitations = signal<StoredExpressInvitation[]>([]);
  public readonly isMyInvitationsModalOpen = signal<boolean>(false);
  public readonly isSubmittingEvent = signal<boolean>(false);
  public readonly submissionError = signal<string>('');

  // New guest form
  public newGuestName = signal<string>('');
  public newGuestPhone = signal<string>('');
  public readonly isAddingGuest = signal<boolean>(false);
  public readonly guestAddError = signal<string>('');

  // General invite link copy state
  public readonly linkCopied = signal<boolean>(false);

  // Step 3 View Mode: 'guests' (Tableau nominatif) vs 'public' (Lien public WhatsApp)
  public readonly step3Tab = signal<'guests' | 'public'>('guests');

  // Accordion drawer for adding guests
  public readonly isAddGuestFormOpen = signal<boolean>(false);
  public readonly isAddGuestFormVisible = computed(() => this.isAddGuestFormOpen() || this.totalGuestsCount() === 0);

  public toggleAddGuestForm(): void {
    this.isAddGuestFormOpen.update(v => !v);
  }

  // Mode d'ajout des invités : 'single' (1 par 1) ou 'bulk' (Copier-Coller en masse)
  public readonly addGuestMode = signal<'single' | 'bulk'>('single');

  // Bulk Paste state
  public readonly bulkText = signal<string>('');
  public readonly isSubmittingBulk = signal<boolean>(false);
  public readonly bulkError = signal<string>('');
  public readonly bulkSuccessMsg = signal<string>('');

  // Live parser for bulk contacts
  public readonly parsedGuests = computed<ParsedGuestItem[]>(() => {
    const rawText = this.bulkText();
    if (!rawText.trim()) return [];

    const lines = rawText.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
    const items: ParsedGuestItem[] = [];

    for (const line of lines) {
      // Find a phone sequence (minimum 8 digits, supports +212, 06, 07, spaces, dashes)
      const phoneMatch = line.match(/(?:\+?[0-9][0-9\s\-().]{7,}[0-9])/);

      if (phoneMatch) {
        const rawPhone = phoneMatch[0];
        const digitsOnly = rawPhone.replace(/\D/g, '');

        if (digitsOnly.length >= 8 && digitsOnly.length <= 15) {
          let name = line.replace(rawPhone, '')
            .replace(/^[\s,;:\-\|]+|[\s,;:\-\|]+$/g, '')
            .trim();

          if (!name) {
            name = 'Invité';
          }

          let cleanPhone = rawPhone.replace(/[\s\-\(\)\.]/g, '');

          items.push({
            fullName: name,
            phone: cleanPhone,
            isValid: true,
            raw: line
          });
          continue;
        }
      }

      items.push({
        fullName: line,
        phone: '',
        isValid: false,
        raw: line,
        error: 'Numéro WhatsApp non détecté'
      });
    }

    return items;
  });

  public readonly validParsedGuests = computed(() => this.parsedGuests().filter(g => g.isValid));
  public readonly invalidParsedGuests = computed(() => this.parsedGuests().filter(g => !g.isValid));

  // Progress metrics for WhatsApp invitations
  public readonly totalGuestsCount = computed(() => this.createdEvent()?.guests?.length || 0);

  public readonly sentGuestsCount = computed(() => {
    const guests = this.createdEvent()?.guests || [];
    return guests.filter(g => this.isGuestSent(g)).length;
  });

  public readonly sendingProgressPercent = computed(() => {
    const total = this.totalGuestsCount();
    if (total === 0) return 0;
    return Math.round((this.sentGuestsCount() / total) * 100);
  });

  // Mobile detection for dynamic pagination and layout
  public readonly isMobile = signal<boolean>(typeof window !== 'undefined' ? window.innerWidth < 576 : false);

  @HostListener('window:resize')
  public onWindowResize(): void {
    if (typeof window !== 'undefined') {
      this.isMobile.set(window.innerWidth < 576);
    }
  }

  // Pagination & Search for Guests List (3 on mobile, 5 on desktop)
  public readonly guestPage = signal<number>(1);
  public readonly guestPageSize = computed<number>(() => this.isMobile() ? 3 : 5);
  public readonly guestSearchTerm = signal<string>('');

  public readonly filteredGuests = computed(() => {
    const list = this.createdEvent()?.guests || [];
    const term = this.guestSearchTerm().toLowerCase().trim();
    if (!term) return list;
    return list.filter(g => 
      (g.fullName && g.fullName.toLowerCase().includes(term)) ||
      (g.phone && g.phone.includes(term))
    );
  });

  public readonly totalGuestPages = computed(() => {
    const total = this.filteredGuests().length;
    return Math.max(1, Math.ceil(total / this.guestPageSize()));
  });

  public readonly paginatedGuests = computed(() => {
    const guests = this.filteredGuests();
    const page = this.guestPage();
    const size = this.guestPageSize();
    const start = (page - 1) * size;
    return guests.slice(start, start + size);
  });

  public readonly guestPageRange = computed(() => {
    const total = this.filteredGuests().length;
    if (total === 0) return '0';
    const start = (this.guestPage() - 1) * this.guestPageSize() + 1;
    const end = Math.min(this.guestPage() * this.guestPageSize(), total);
    return `${start} - ${end}`;
  });

  public onGuestSearchChange(term: string): void {
    this.guestSearchTerm.set(term);
    this.guestPage.set(1);
  }

  public nextGuestPage(): void {
    if (this.guestPage() < this.totalGuestPages()) {
      this.guestPage.update(p => p + 1);
    }
  }

  public prevGuestPage(): void {
    if (this.guestPage() > 1) {
      this.guestPage.update(p => p - 1);
    }
  }

  public setGuestPage(page: number): void {
    if (page >= 1 && page <= this.totalGuestPages()) {
      this.guestPage.set(page);
    }
  }

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

  public readonly filteredEventTypes = computed(() => {
    const term = (this.eventType() || '').toLowerCase().trim();
    if (!term) return this.eventTypes;
    return this.eventTypes.filter(opt => 
      opt.labelFr.toLowerCase().includes(term) || 
      opt.labelAr.includes(term) ||
      opt.id.toLowerCase().includes(term)
    );
  });

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
    this.isEventTypeDropdownOpen.set(false);
  }

  public onEventTypeInputChange(val: string): void {
    this.onEventTypeChange(val);
    this.isEventTypeDropdownOpen.set(true);
  }

  public toggleEventTypeDropdown(event?: MouseEvent): void {
    if (event) event.preventDefault();
    this.isEventTypeDropdownOpen.update(v => !v);
  }

  public onEventTypeBlur(): void {
    setTimeout(() => this.isEventTypeDropdownOpen.set(false), 200);
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
      if (!this.eventDate()) {
        this.submissionError.set('Veuillez sélectionner la date de votre événement.');
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
    if (!this.eventDate()) {
      this.currentStep.set(1);
      this.submissionError.set('Veuillez sélectionner la date de votre événement.');
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

    const payload = {
      title: this.title().trim(),
      eventType: this.eventType(),
      eventDate: formattedDate,
      location: this.location().trim(),
      locationMapUrl: this.locationMapUrl().trim(),
      invitationSubtitle: this.subtitle().trim(),
      digitalTemplateId: this.selectedTemplateId()!
    };

    const existing = this.createdEvent();

    if (existing && existing.eventId) {
      this.expressService.updateInvitation(existing.eventId, payload).subscribe({
        next: (res) => {
          const guests = (res.guests && res.guests.length > 0) ? res.guests : (existing.guests || []);
          const updated: ExpressInvitationResponse = {
            ...existing,
            ...res,
            eventToken: res.eventToken || existing.eventToken,
            generalInviteLink: res.generalInviteLink || existing.generalInviteLink,
            templateTitle: res.templateTitle || existing.templateTitle,
            guests
          };
          this.createdEvent.set(updated);
          this.isSubmittingEvent.set(false);
          this.saveSession(updated);
          this.currentStep.set(3);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        },
        error: (err) => {
          this.isSubmittingEvent.set(false);
          this.submissionError.set(err.error?.message || 'Erreur lors de la mise à jour de l\'invitation.');
        }
      });
    } else {
      this.expressService.createInvitation(payload).subscribe({
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
  }

  public addGuest(): void {
    const name = this.newGuestName().trim();
    const phone = this.newGuestPhone().trim();
    const evt = this.createdEvent();

    if (!name) {
      this.guestAddError.set('Veuillez renseigner le nom de l\'invité.');
      return;
    }
    if (!phone) {
      this.guestAddError.set('Le numéro WhatsApp est obligatoire pour envoyer l\'invitation.');
      return;
    }
    const cleanDigits = phone.replace(/[^0-9]/g, '');
    if (cleanDigits.length < 8) {
      this.guestAddError.set('Veuillez renseigner un numéro WhatsApp valide (ex: 0661234567).');
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
        this.guestPage.set(1);
        this.isAddingGuest.set(false);
        this.saveSession(this.createdEvent()!);
      },
      error: (err) => {
        this.isAddingGuest.set(false);
        this.guestAddError.set(err.error?.message || 'Erreur lors de l\'ajout de l\'invité.');
      }
    });
  }

  public insertBulkExample(): void {
    const example = 
`Si Mohammed Benani, 0661234567
Lalla Fatima Zahra, 0662345678
Driss Alami - 0663456789
Kenza Tazi: +212664567890
0665554433 Mehdi Chraibi`;
    this.bulkText.set(example);
    this.bulkError.set('');
    this.bulkSuccessMsg.set('');
  }

  public clearBulk(): void {
    this.bulkText.set('');
    this.bulkError.set('');
    this.bulkSuccessMsg.set('');
  }

  public importBulkGuests(): void {
    const evt = this.createdEvent();
    if (!evt) return;

    const valids = this.validParsedGuests();
    if (valids.length === 0) {
      this.bulkError.set('Aucun invité valide avec numéro WhatsApp n\'a été détecté.');
      return;
    }

    this.isSubmittingBulk.set(true);
    this.bulkError.set('');
    this.bulkSuccessMsg.set('');

    const payload = valids.map(v => ({ fullName: v.fullName, phone: v.phone }));

    this.expressService.addGuestsBatch(evt.eventId, payload).subscribe({
      next: (newGuests) => {
        this.createdEvent.update(current => {
          if (!current) return current;
          return {
            ...current,
            guests: [...newGuests, ...current.guests]
          };
        });

        this.bulkText.set('');
        this.guestPage.set(1);
        this.isSubmittingBulk.set(false);
        this.bulkSuccessMsg.set(`🎉 Bravo ! ${newGuests.length} invité(s) importé(s) avec succès.`);
        this.saveSession(this.createdEvent()!);
      },
      error: (err) => {
        this.isSubmittingBulk.set(false);
        this.bulkError.set(err.error?.message || 'Erreur lors de l\'import en masse des invités.');
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
      `للاطلاع على بطاقة الدعوة الفخمة وتأكيد الحضور أو موقع القاعة عبر GPS :\n\n` +
      `${fullRsvpUrl}\n\n` +
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

  public shareGeneralLinkWhatsApp(): void {
    const evt = this.createdEvent();
    if (!evt) return;

    const fullUrl = window.location.origin + evt.generalInviteLink;
    const eventTitle = evt.title || 'notre événement';
    const eventDate = evt.eventDate ? new Date(evt.eventDate).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '';
    const eventLocation = evt.location || '';

    const message = `✨ السلام عليكم جميعاً،\n\n` +
      `يسعدنا ويشرفنا كثيراً دعوتكم لحضور : ${eventTitle}\n` +
      (eventDate ? `📅 التاريخ : ${eventDate}\n` : '') +
      (eventLocation ? `📍 المكان : ${eventLocation}\n\n` : '\n') +
      `للاطلاع على بطاقة الدعوة الرقمية الفخمة وتأكيد الحضور أو موقع القاعة عبر GPS :\n\n` +
      `${fullUrl}\n\n` +
      `حضوركم يسعدنا ويشرفنا كثيراً ! ❤️`;

    const encoded = encodeURIComponent(message);
    const waUrl = `https://api.whatsapp.com/send?text=${encoded}`;
    window.open(waUrl, '_blank');
  }

  public isDeletingGuest = signal<number | null>(null);

  public deleteGuest(guest: ExpressGuestResponse): void {
    const evt = this.createdEvent();
    if (!evt) return;

    if (!confirm(`Voulez-vous vraiment supprimer « ${guest.fullName} » de votre liste d'invités ?`)) {
      return;
    }

    this.isDeletingGuest.set(guest.id);

    this.expressService.deleteGuest(evt.eventId, guest.id).subscribe({
      next: () => {
        this.finishGuestDeletion(guest.id);
      },
      error: () => {
        this.finishGuestDeletion(guest.id);
      }
    });
  }

  private finishGuestDeletion(guestId: number): void {
    this.isDeletingGuest.set(null);
    this.createdEvent.update(curr => {
      if (!curr) return null;
      const updatedGuests = (curr.guests || []).filter(g => g.id !== guestId);
      return {
        ...curr,
        guests: updatedGuests
      };
    });

    const evt = this.createdEvent();
    if (evt) {
      this.saveSession(evt);
    }

    if (this.guestPage() > this.totalGuestPages()) {
      this.guestPage.set(Math.max(1, this.totalGuestPages()));
    }
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

  private loadMyInvitationsFromStorage(): StoredExpressInvitation[] {
    try {
      const stored = localStorage.getItem('express_my_invitations');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return [];
  }

  private saveSession(eventData: ExpressInvitationResponse): void {
    try {
      localStorage.setItem('express_invitation_session', JSON.stringify(eventData));

      const list = this.loadMyInvitationsFromStorage();
      const existingIdx = list.findIndex(x => x.eventId === eventData.eventId);

      const item: StoredExpressInvitation = {
        eventId: eventData.eventId,
        eventToken: eventData.eventToken,
        title: eventData.title,
        eventType: this.eventType(),
        subtitle: this.subtitle() || eventData.invitationSubtitle,
        eventDate: eventData.eventDate || this.eventDate(),
        eventTime: this.eventTime(),
        location: eventData.location || this.location(),
        locationMapUrl: eventData.locationMapUrl || this.locationMapUrl(),
        digitalTemplateId: eventData.digitalTemplateId || this.selectedTemplateId() || 1,
        templateTitle: eventData.templateTitle || '',
        generalInviteLink: eventData.generalInviteLink,
        guestsCount: eventData.guests?.length || 0,
        createdAt: existingIdx >= 0 && list[existingIdx].createdAt ? list[existingIdx].createdAt : new Date().toISOString()
      };

      if (existingIdx >= 0) {
        list[existingIdx] = { ...list[existingIdx], ...item };
      } else {
        list.unshift(item);
      }

      localStorage.setItem('express_my_invitations', JSON.stringify(list));
      this.myInvitations.set(list);
    } catch {}
  }

  private restoreSessionIfAny(): void {
    try {
      const myInvList = this.loadMyInvitationsFromStorage();

      const stored = localStorage.getItem('express_invitation_session');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.eventId) {
          this.createdEvent.set(parsed);
          if (parsed.digitalTemplateId) {
            this.selectedTemplateId.set(parsed.digitalTemplateId);
          }
          if (parsed.title) this.title.set(parsed.title);
          if (parsed.invitationSubtitle) this.subtitle.set(parsed.invitationSubtitle);
          if (parsed.location) this.location.set(parsed.location);
          if (parsed.locationMapUrl) this.locationMapUrl.set(parsed.locationMapUrl);
          if (parsed.eventDate) {
            const parts = parsed.eventDate.split('T');
            this.eventDate.set(parts[0]);
            if (parts[1]) {
              this.eventTime.set(parts[1].substring(0, 5));
            }
          }

          const found = myInvList.find(x => x.eventId === parsed.eventId);
          if (found) {
            if (found.eventType) this.eventType.set(found.eventType);
            if (found.subtitle) this.subtitle.set(found.subtitle);
            if (found.eventDate) this.eventDate.set(found.eventDate);
            if (found.eventTime) this.eventTime.set(found.eventTime);
          }

          // If not in myInvList yet, add it
          if (!myInvList.some(x => x.eventId === parsed.eventId)) {
            const initialItem: StoredExpressInvitation = {
              eventId: parsed.eventId,
              eventToken: parsed.eventToken || '',
              title: parsed.title,
              eventType: this.eventType() || 'Mariage',
              subtitle: parsed.invitationSubtitle,
              eventDate: this.eventDate() || parsed.eventDate,
              eventTime: this.eventTime() || '19:00',
              location: parsed.location,
              locationMapUrl: parsed.locationMapUrl,
              digitalTemplateId: parsed.digitalTemplateId || 1,
              templateTitle: parsed.templateTitle || '',
              generalInviteLink: parsed.generalInviteLink,
              guestsCount: parsed.guests?.length || 0,
              createdAt: new Date().toISOString()
            };
            myInvList.unshift(initialItem);
            localStorage.setItem('express_my_invitations', JSON.stringify(myInvList));
          }
        }
      }

      this.myInvitations.set(myInvList);
    } catch {}
  }

  public openMyInvitationsModal(): void {
    this.isMyInvitationsModalOpen.set(true);
  }

  public selectInvitationFromModal(inv: StoredExpressInvitation): void {
    this.isMyInvitationsModalOpen.set(false);
    this.expressService.getGuests(inv.eventId).subscribe({
      next: (guests) => {
        const fullEvent: ExpressInvitationResponse = {
          eventId: inv.eventId,
          eventToken: inv.eventToken || '',
          title: inv.title,
          eventDate: inv.eventDate || '',
          location: inv.location || '',
          locationMapUrl: inv.locationMapUrl || '',
          invitationSubtitle: inv.subtitle || '',
          digitalTemplateId: inv.digitalTemplateId || 1,
          templateTitle: inv.templateTitle || 'Modèle Personnalisé',
          generalInviteLink: inv.generalInviteLink,
          guests: guests || []
        };
        this.createdEvent.set(fullEvent);
        if (inv.eventType) this.eventType.set(inv.eventType);
        if (inv.subtitle) this.subtitle.set(inv.subtitle);
        this.title.set(inv.title || '');
        if (inv.eventDate) this.eventDate.set(inv.eventDate);
        if (inv.eventTime) this.eventTime.set(inv.eventTime);
        if (inv.location) this.location.set(inv.location);
        if (inv.locationMapUrl) this.locationMapUrl.set(inv.locationMapUrl);
        if (inv.digitalTemplateId) this.selectedTemplateId.set(inv.digitalTemplateId);
        this.saveSession(fullEvent);
        this.currentStep.set(3);
      },
      error: () => {
        const fullEvent: ExpressInvitationResponse = {
          eventId: inv.eventId,
          eventToken: inv.eventToken || '',
          title: inv.title,
          eventDate: inv.eventDate || '',
          location: inv.location || '',
          locationMapUrl: inv.locationMapUrl || '',
          invitationSubtitle: inv.subtitle || '',
          digitalTemplateId: inv.digitalTemplateId || 1,
          templateTitle: inv.templateTitle || 'Modèle Personnalisé',
          generalInviteLink: inv.generalInviteLink,
          guests: []
        };
        this.createdEvent.set(fullEvent);
        if (inv.eventType) this.eventType.set(inv.eventType);
        if (inv.subtitle) this.subtitle.set(inv.subtitle);
        this.title.set(inv.title || '');
        if (inv.eventDate) this.eventDate.set(inv.eventDate);
        if (inv.eventTime) this.eventTime.set(inv.eventTime);
        if (inv.location) this.location.set(inv.location);
        if (inv.locationMapUrl) this.locationMapUrl.set(inv.locationMapUrl);
        if (inv.digitalTemplateId) this.selectedTemplateId.set(inv.digitalTemplateId);
        this.saveSession(fullEvent);
        this.currentStep.set(3);
      }
    });
  }

  public deleteInvitationFromModal(inv: StoredExpressInvitation, event: MouseEvent): void {
    event.stopPropagation();
    if (confirm(`Voulez-vous supprimer « ${inv.title} » de votre historique sur cet appareil ?`)) {
      const updated = this.myInvitations().filter(x => x.eventId !== inv.eventId);
      this.myInvitations.set(updated);
      localStorage.setItem('express_my_invitations', JSON.stringify(updated));

      if (this.createdEvent()?.eventId === inv.eventId) {
        if (updated.length > 0) {
          this.selectInvitationFromModal(updated[0]);
        } else {
          localStorage.removeItem('express_invitation_session');
          this.createdEvent.set(null);
          this.title.set('');
          this.location.set('');
          this.locationMapUrl.set('');
          this.subtitle.set('');
          this.eventDate.set('');
          this.currentStep.set(1);
        }
      }
    }
  }

  public createNewFromModal(): void {
    this.isMyInvitationsModalOpen.set(false);
    this.startNewInvitation();
  }

  public resumeActiveEvent(): void {
    if (this.currentStep() !== 3) {
      this.submitAndProceedToGuests();
    } else {
      this.currentStep.set(3);
    }
  }

  public startNewInvitation(): void {
    if (this.createdEvent()) {
      if (confirm('Voulez-vous créer une nouvelle invitation ? Votre invitation actuelle restera sauvegardée dans « Mes invitations ».')) {
        localStorage.removeItem('express_invitation_session');
        this.createdEvent.set(null);
        this.title.set('');
        this.location.set('');
        this.locationMapUrl.set('');
        this.subtitle.set('');
        this.eventDate.set('');
        this.currentStep.set(1);
      }
    } else {
      this.createdEvent.set(null);
      this.title.set('');
      this.location.set('');
      this.locationMapUrl.set('');
      this.subtitle.set('');
      this.eventDate.set('');
      this.currentStep.set(1);
    }
  }
}

