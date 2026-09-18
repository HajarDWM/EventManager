import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { forkJoin } from 'rxjs';
import { EventService } from '../../services/event.service';
import { TemplateService, DigitalTemplate } from '../../../../core/services/template.service';
import { GuestService, Guest } from '../../../../core/services/guest.service';
import { CatererService } from '../../../../core/services/caterer.service';
import { Event } from '../../models/event.model';
import { 
  TEMPLATE_TAXONOMY, 
  MainCategoryInfo, 
  SubCategoryInfo, 
  getCategoryTaxonomy 
} from '../../../../core/constants/template-taxonomy.constants';
import { GuestRsvp, PublicRsvpDetail } from '../guest-rsvp/guest-rsvp';

export interface DietaryTag {
  label: string;
  icon: string;
  badgeClass: string;
}

export interface CateringTab {
  key: string;
  label: string;
}

export interface SampleDish {
  name: string;
  category: string;
  image: string;
}

export interface JourneyStep {
  stepNumber: number;
  title: string;
  shortTitle: string;
  subtitle: string;
  icon: string;
  screenType: 'SMS_MESSAGE' | 'ENVELOPE_SEAL' | 'INVITATION_CARD' | 'INVITATION_PAGE1' | 'MENU_CHOICE' | 'DIETARY_CHOICE' | 'RSVP_DECISION';
  isCompleted: boolean;
  isCurrent: boolean;
  timestamp?: string;
  badgeLabel: string;
  badgeClass: string;
  details?: string;
  channels?: { name: string; icon: string; colorClass: string }[];
  page1Title?: string;
  page1Subtitle?: string;
  page1GuestName?: string;
  page1Date?: string;
  page1Location?: string;
  page1BgImage?: string;
  page1AccentColor?: string;
  dishChoice?: string;
  dishCategory?: string;
  dishCategoryKey?: string;
  dishImage?: string;
  cateringFormula?: string;
  cateringTabs?: CateringTab[];
  isBuffetMode?: boolean;
  sampleBuffetDishes?: SampleDish[];
  dietaryTags?: DietaryTag[];
  hasDietaryRestrictions?: boolean;
  dietarySummary?: string;
  guestFirstName?: string;
  narrativeMessage?: string;
  primaryChannelType?: 'WHATSAPP' | 'EMAIL' | 'SMS' | 'PAPER';
  isPaidEvent?: boolean;
  ticketPrice?: number;
  currency?: string;
  isPaid?: boolean;
  tableNumber?: string;
  guestStatus?: string;
}

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
  private readonly catererService = inject(CatererService);
  private readonly sanitizer = inject(DomSanitizer);

  protected readonly event = signal<Event | null>(null);
  protected readonly templates = signal<DigitalTemplate[]>([]);
  protected readonly guests = signal<Guest[]>([]);

  protected readonly isSubscriptionExpired = computed(() => {
    const profile = this.catererService.currentProfile();
    if (profile && profile.role === 'SUPER_ADMIN') return false;
    return profile && (!!profile.isExpired || !!profile.expired || profile.subscriptionStatus === 'EXPIRED');
  });
  protected readonly selectedGuestIds = signal<Record<number, boolean>>({});
  protected readonly channelWhatsapp = signal(true);
  protected readonly channelEmail = signal(true);
  protected readonly channelSms = signal(true);
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
  protected readonly taxonomy = computed(() => this.templateService.categories());
  protected readonly selectedCategory = signal<string>('TRADITIONAL');
  protected readonly selectedSubCategory = signal<string>('ALL');

  protected readonly currentMainCategoryInfo = computed(() => getCategoryTaxonomy(this.selectedCategory(), this.taxonomy()));
  protected readonly availableSubCategoriesForFilter = computed(() => this.currentMainCategoryInfo()?.subCategories || []);

  // Filtered templates
  protected readonly filteredTemplates = computed(() => {
    const cat = this.selectedCategory();
    const sub = this.selectedSubCategory();
    const allTaxonomy = this.taxonomy();
    const mainCat = getCategoryTaxonomy(cat, allTaxonomy);
    
    let list = this.templates();
    if (mainCat) {
      list = list.filter(t => {
        const tMain = getCategoryTaxonomy(t.category, allTaxonomy);
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

  // Dedicated Template Preview Modal State
  protected readonly isPreviewModalOpen = signal(false);
  protected readonly previewTemplate = signal<DigitalTemplate | null>(null);
  protected readonly previewDevice = signal<'MOBILE' | 'DESKTOP'>('MOBILE');

  protected openTemplatePreview(template: DigitalTemplate): void {
    this.previewTemplate.set(template);
    this.previewDevice.set('MOBILE');
    this.isPreviewModalOpen.set(true);
  }

  protected setPreviewDevice(device: 'MOBILE' | 'DESKTOP'): void {
    this.previewDevice.set(device);
  }

  protected closeTemplatePreview(): void {
    this.isPreviewModalOpen.set(false);
    this.previewTemplate.set(null);
  }

  protected chooseFromPreview(): void {
    const tpl = this.previewTemplate();
    this.closeTemplatePreview();
    if (tpl) {
      this.selectTemplate(tpl);
    }
  }

  protected readonly templatePreviewData = computed<PublicRsvpDetail | null>(() => {
    const tpl = this.previewTemplate();
    const ev = this.event();
    if (!tpl) return null;

    const baseDate = ev?.invitationDate || ev?.eventDate || new Date().toISOString();
    const baseLocation = ev?.invitationLocation || ev?.location || 'Casablanca, Maroc';
    const baseTitle = ev?.invitationTitle || ev?.title || tpl.title || 'Notre Célébration';
    const baseSubtitle = ev?.invitationSubtitle || tpl.subCategory || tpl.category || 'Invitation Officielle';

    return {
      guestId: 0,
      guestName: 'Amine Idrissi',
      guestEmail: 'invite@example.com',
      guestPhone: '+212 600 000 000',
      guestStatus: 'PENDING',
      tableNumber: 'Table d\'Honneur',
      dietaryRequirements: '',
      eventId: ev?.id || 0,
      eventTitle: ev?.title || tpl.title,
      eventDate: baseDate,
      eventLocation: baseLocation,
      locationMapUrl: ev?.locationMapUrl || undefined,
      digitalTemplateId: tpl.id,
      templateId: tpl.templateKey || (tpl.id === 1 ? 'fleurs-de-coton' : (tpl.id === 2 ? 'or-et-velours' : (tpl.id === 3 ? 'corporate-professional' : 'fleurs-de-coton'))),
      templateTitle: tpl.title,
      templateCategory: tpl.category,
      decorativeFrame: tpl.decorativeFrame || 'gold-border',
      accentColor: tpl.accentColor || '#d4af37',
      backgroundColor: tpl.backgroundColor || '#fdfbf7',
      templateBackgroundImageUrl: tpl.backgroundImageUrl || tpl.imageUrl || undefined,
      templateBackgroundImageDesktopUrl: tpl.backgroundImageDesktopUrl || tpl.backgroundImageUrl || tpl.imageUrl || undefined,
      primaryFont: tpl.primaryFont || 'Alex Brush',
      primaryFontSize: tpl.primaryFontSize || '2.8rem',
      secondaryFont: tpl.secondaryFont || 'Cinzel',
      secondaryFontSize: tpl.secondaryFontSize || '0.9rem',
      secondaryFontColor: tpl.secondaryFontColor || '#1e293b',
      templateMusicUrl: tpl.musicUrl || '/assets/music/gala-ambient.mp3',
      openingAnimation: tpl.openingAnimation || 'none',
      visualParticles: tpl.visualParticles && tpl.visualParticles !== 'none' ? tpl.visualParticles : 'confetti',
      invitationTitle: baseTitle,
      invitationSubtitle: baseSubtitle,
      invitationDate: baseDate,
      invitationLocation: baseLocation,
      parkingLocation: ev?.parkingLocation || 'Parking VIP disponible',
      mealType: ev?.mealType || 'PLATS_FIXES',
      isPaidEvent: ev?.isPaidEvent,
      ticketPrice: ev?.ticketPrice,
      currency: ev?.currency,
      paymentStatus: 'UNPAID',
      paidAmount: 0
    };
  });

  protected readonly studioLivePreviewData = computed<PublicRsvpDetail | null>(() => {
    const tpl = this.selectedTemplate();
    const ev = this.event();
    if (!tpl) return null;

    let combinedDate = ev?.invitationDate || ev?.eventDate || new Date().toISOString();
    if (this.invitationDateStr) {
      try {
        const timePart = this.invitationTimeStr || '19:00';
        combinedDate = new Date(`${this.invitationDateStr}T${timePart}:00`).toISOString();
      } catch (e) {}
    }

    return {
      guestId: 0,
      guestName: 'Amine Idrissi',
      guestEmail: 'invite@example.com',
      guestPhone: '+212 600 000 000',
      guestStatus: 'PENDING',
      tableNumber: 'Table d\'Honneur',
      dietaryRequirements: '',
      eventId: ev?.id || 0,
      eventTitle: this.invitationTitle || ev?.title || tpl.title,
      eventDate: combinedDate,
      eventLocation: this.invitationLocation || ev?.location || 'Casablanca, Maroc',
      locationMapUrl: ev?.locationMapUrl || undefined,
      digitalTemplateId: tpl.id,
      templateId: tpl.templateKey || (tpl.id === 1 ? 'fleurs-de-coton' : (tpl.id === 2 ? 'or-et-velours' : (tpl.id === 3 ? 'corporate-professional' : 'fleurs-de-coton'))),
      templateTitle: tpl.title,
      templateCategory: tpl.category,
      decorativeFrame: tpl.decorativeFrame || 'gold-border',
      accentColor: tpl.accentColor || '#d4af37',
      backgroundColor: tpl.backgroundColor || '#fdfbf7',
      templateBackgroundImageUrl: tpl.backgroundImageUrl || tpl.imageUrl || undefined,
      templateBackgroundImageDesktopUrl: tpl.backgroundImageDesktopUrl || tpl.backgroundImageUrl || tpl.imageUrl || undefined,
      primaryFont: tpl.primaryFont || 'Alex Brush',
      primaryFontSize: tpl.primaryFontSize || '2.8rem',
      secondaryFont: tpl.secondaryFont || 'Cinzel',
      secondaryFontSize: tpl.secondaryFontSize || '0.9rem',
      secondaryFontColor: tpl.secondaryFontColor || '#1e293b',
      templateMusicUrl: tpl.musicUrl || '/assets/music/gala-ambient.mp3',
      openingAnimation: tpl.openingAnimation || 'none',
      visualParticles: tpl.visualParticles && tpl.visualParticles !== 'none' ? tpl.visualParticles : 'confetti',
      invitationTitle: this.invitationTitle || ev?.title || tpl.title,
      invitationSubtitle: this.invitationSubtitle || tpl.subCategory || 'Invitation Officielle',
      invitationDate: combinedDate,
      invitationLocation: this.invitationLocation || ev?.location || 'Casablanca, Maroc',
      parkingLocation: this.invitationParking || 'Parking VIP disponible',
      mealType: ev?.mealType || 'PLATS_FIXES',
      isPaidEvent: ev?.isPaidEvent,
      ticketPrice: ev?.ticketPrice,
      currency: ev?.currency,
      paymentStatus: 'UNPAID',
      paidAmount: 0
    };
  });

  protected readonly modalPreviewIframeUrl = computed<SafeResourceUrl | null>(() => {
    const data = this.templatePreviewData();
    if (!data) return null;
    sessionStorage.setItem('active_template_preview_data', JSON.stringify(data));
    return this.sanitizer.bypassSecurityTrustResourceUrl(`/template-preview-frame?templateId=${data.digitalTemplateId || 0}`);
  });

  protected readonly studioLivePreviewIframeUrl = computed<SafeResourceUrl | null>(() => {
    const data = this.studioLivePreviewData();
    if (!data) return null;
    sessionStorage.setItem('active_template_preview_data', JSON.stringify(data));
    return this.sanitizer.bypassSecurityTrustResourceUrl(`/template-preview-frame?templateId=${data.digitalTemplateId || 0}`);
  });

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

  protected copyLink(): void {
    const link = this.invitationLink();
    if (!link) return;
    navigator.clipboard.writeText(link).then(() => {
      this.isCopied = true;
      setTimeout(() => {
        this.isCopied = false;
      }, 2500);
    });
  }

  // Guest Journey Modal State
  protected readonly selectedJourneyGuest = signal<Guest | null>(null);
  protected readonly isJourneyModalOpen = signal<boolean>(false);
  protected readonly copiedJourneyLinkId = signal<number | null>(null);

  protected testGuestInvitation(guest: Guest): void {
    const tokenOrId = (guest as any).invitationToken || guest.id;
    if (tokenOrId) {
      window.open(`/rsvp/${tokenOrId}`, '_blank');
    }
  }

  protected openGuestJourney(guest: Guest): void {
    this.selectedJourneyGuest.set(guest);
    this.isJourneyModalOpen.set(true);
  }

  protected closeGuestJourney(): void {
    this.isJourneyModalOpen.set(false);
    this.selectedJourneyGuest.set(null);
  }

  protected getGuestJourneyLink(guest: Guest): string {
    const tokenOrId = (guest as any).invitationToken || guest.id;
    const j = this.getJourneyData(guest);
    let stepParam = '';
    if (j.currentActiveStepIndex === 2) {
      stepParam = '?step=envelope';
    } else if (j.currentActiveStepIndex === 3) {
      stepParam = '?step=menu';
    } else if (j.currentActiveStepIndex === 4) {
      stepParam = '?step=dietary';
    } else if (j.currentActiveStepIndex === 5) {
      stepParam = '?step=rsvp';
    }
    return `${window.location.origin}/rsvp/${tokenOrId}${stepParam}`;
  }

  protected copyJourneyGuestLink(guest: Guest): void {
    if (!guest.id) return;
    const url = this.getGuestJourneyLink(guest);
    navigator.clipboard.writeText(url).then(() => {
      this.copiedJourneyLinkId.set(guest.id!);
      setTimeout(() => this.copiedJourneyLinkId.set(null), 2500);
    });
  }

  protected getJourneyGuestWhatsAppUrl(guest: Guest): string {
    const cleanPhone = (guest.phone || '').replace(/[^0-9+]/g, '');
    const link = this.getGuestJourneyLink(guest);
    const j = this.getJourneyData(guest);
    const eventName = this.event()?.title || "l'événement";
    let stepContext = "finaliser votre réponse";
    if (j.currentActiveStepIndex === 2) {
      stepContext = "découvrir votre invitation et décacheter votre enveloppe";
    } else if (j.currentActiveStepIndex === 3) {
      stepContext = "sélectionner vos choix de menu pour le traiteur";
    } else if (j.currentActiveStepIndex === 4) {
      stepContext = "indiquer vos préférences et régimes alimentaires pour le traiteur";
    } else if (j.currentActiveStepIndex === 5) {
      stepContext = "confirmer définitivement votre présence";
    }
    const msg = encodeURIComponent(`Bonjour ${guest.fullName},\n\nRappel amical concernant ${eventName}.\nAfin de permettre au traiteur d'ajuster au mieux les préparatifs, merci de ${stepContext} directement via votre lien personnalisé :\n${link}`);
    return cleanPhone ? `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${msg}` : `https://api.whatsapp.com/send?text=${msg}`;
  }

  protected getJourneyGuestEmailUrl(guest: Guest): string {
    const link = this.getGuestJourneyLink(guest);
    const j = this.getJourneyData(guest);
    const eventName = this.event()?.title || "l'événement";
    let stepContext = "finaliser votre réponse";
    if (j.currentActiveStepIndex === 2) {
      stepContext = "découvrir votre invitation et décacheter votre enveloppe";
    } else if (j.currentActiveStepIndex === 3) {
      stepContext = "sélectionner vos choix de menu avec le traiteur";
    } else if (j.currentActiveStepIndex === 4) {
      stepContext = "indiquer vos préférences alimentaires et allergies";
    } else if (j.currentActiveStepIndex === 5) {
      stepContext = "confirmer votre présence";
    }
    const subject = encodeURIComponent(`Rappel : Votre invitation officielle pour ${eventName}`);
    const body = encodeURIComponent(`Bonjour ${guest.fullName},\n\nNous nous permettons de vous rappeler votre invitation à l'événement "${eventName}".\n\nAfin de nous coordonner avec le traiteur pour un accueil parfait, nous vous serions reconnaissants de bien vouloir ${stepContext} en cliquant sur le lien suivant :\n${link}\n\nAu plaisir de vous compter parmi nous,\nL'organisation.`);
    return `mailto:${guest.email || ''}?subject=${subject}&body=${body}`;
  }

  protected getJourneyGuestSmsUrl(guest: Guest): string {
    const link = this.getGuestJourneyLink(guest);
    const eventName = this.event()?.title || "l'événement";
    const body = encodeURIComponent(`Bonjour ${guest.fullName}, rappel pour ${eventName}. Merci de finaliser votre confirmation traiteur ici : ${link}`);
    return `sms:${guest.phone || ''}?body=${body}`;
  }

  protected getPreferredReminderChannel(guest: Guest | null): {
    type: 'WHATSAPP' | 'EMAIL' | 'SMS' | 'LINK';
    label: string;
    actionTitle: string;
    icon: string;
    btnClass: string;
    url: string;
    isExternal: boolean;
  } | null {
    if (!guest) return null;
    const hasPhone = !!guest.phone && guest.phone.trim().length > 0;
    const hasEmail = !!guest.email && guest.email.trim().length > 0;
    const sentChannels = guest.sentChannels || [];
    
    // 1. If sent ONLY via Email (or only Email is available)
    if ((sentChannels.includes('E-mail') && !sentChannels.includes('WhatsApp')) || (!hasPhone && hasEmail)) {
      return {
        type: 'EMAIL',
        label: 'Rappeler par E-mail',
        actionTitle: 'Ouvrir votre messagerie et envoyer le rappel par E-mail',
        icon: 'far fa-envelope',
        btnClass: 'btn-info text-white',
        url: this.getJourneyGuestEmailUrl(guest),
        isExternal: true
      };
    }

    // 2. If sent via WhatsApp or phone is available
    if (hasPhone) {
      return {
        type: 'WHATSAPP',
        label: 'Rappeler par WhatsApp',
        actionTitle: 'Ouvrir WhatsApp et envoyer le rappel personnalisé',
        icon: 'fab fa-whatsapp',
        btnClass: 'btn-success',
        url: this.getJourneyGuestWhatsAppUrl(guest),
        isExternal: true
      };
    }

    // 3. If email is available
    if (hasEmail) {
      return {
        type: 'EMAIL',
        label: 'Rappeler par E-mail',
        actionTitle: 'Ouvrir votre messagerie et envoyer le rappel par E-mail',
        icon: 'far fa-envelope',
        btnClass: 'btn-info text-white',
        url: this.getJourneyGuestEmailUrl(guest),
        isExternal: true
      };
    }

    // 4. Default fallback: Copy link
    return {
      type: 'LINK',
      label: 'Copier le lien direct',
      actionTitle: 'Copier le lien direct de relance',
      icon: 'fa fa-copy',
      btnClass: 'btn-primary',
      url: this.getGuestJourneyLink(guest),
      isExternal: false
    };
  }

  protected getJourneyData(guest: Guest): {
    guest: Guest;
    completionPercentage: number;
    currentStatusLabel: string;
    currentStatusBadgeClass: string;
    currentActiveStepIndex: number;
    steps: JourneyStep[];
  } {
    const gid = guest.id;
    const isSent = guest.isSent === true || guest.invitationStatus === 'SENT' || localStorage.getItem(`guest_${gid}_isSent`) === 'true';
    const isConfirmed = guest.status === 'CONFIRMED' || localStorage.getItem(`guest_${gid}_status`) === 'CONFIRMED';
    const isDeclined = guest.status === 'DECLINED' || localStorage.getItem(`guest_${gid}_status`) === 'DECLINED';
    const hasResponded = isConfirmed || isDeclined || !!localStorage.getItem(`guest_${gid}_responded_at`);

    // Stored timestamps and triggers
    const sentAt = isSent ? (localStorage.getItem(`guest_${gid}_sent_at`) || 'Envoyé') : undefined;
    const openedAt = (hasResponded || localStorage.getItem(`guest_${gid}_opened_at`)) ? (localStorage.getItem(`guest_${gid}_opened_at`) || 'Consulté') : undefined;
    const isOpened = !!openedAt || hasResponded;
    const isDetailsViewed = isOpened || hasResponded || !!localStorage.getItem(`guest_${gid}_viewed_details_at`);
    const isMenuViewed = isConfirmed || (!!guest.dietaryRequirements && guest.dietaryRequirements.trim().length > 0) || localStorage.getItem(`guest_${gid}_menu_viewed`) === 'true';

    // Catering formula details for realistic visual mockup
    const rawMealType = ((guest as any).mealType || this.event()?.mealType || '').toUpperCase();
    const isMixMode = rawMealType.includes('MIX') || 
                      (rawMealType.includes('BUFFET') && rawMealType.includes('PLATS_FIXES')) || 
                      (rawMealType.includes('BUFFET_ENTREES') && rawMealType.includes('PLATS_FIXES'));
    const isBuffetMode = !isMixMode && rawMealType.includes('BUFFET');
    const isPlatedMode = !isMixMode && !isBuffetMode;

    let cateringFormulaName = 'Service à Table (Plats Fixes)';
    let cateringTabs: CateringTab[] = [
      { key: 'STARTER', label: 'Entrées' },
      { key: 'MAIN', label: 'Plats' },
      { key: 'DESSERT', label: 'Desserts' }
    ];

    if (isMixMode) {
      cateringFormulaName = 'Formule Mixte (Buffet & Plat Chaud)';
      cateringTabs = [
        { key: 'STARTER', label: 'Buffet Entrées' },
        { key: 'MAIN', label: 'Plat Chaud' },
        { key: 'DESSERT', label: 'Buffet Desserts' }
      ];
    } else if (isBuffetMode) {
      cateringFormulaName = 'Formule Buffet Libre-Service';
      cateringTabs = [
        { key: 'STARTER', label: 'Entrées Buffet' },
        { key: 'MAIN', label: 'Plats Buffet' },
        { key: 'DESSERT', label: 'Desserts Buffet' }
      ];
    }

    // Parse dietary requirements & allergies (e.g. Vegan, Sans gluten, Sans lactose, Halal, Custom notes)
    const rawDietStr = (guest.dietaryRequirements || '').trim();
    const rawLocalAllergies = localStorage.getItem(`guest_${gid}_allergies`);
    let localAllergiesList: string[] = [];
    if (rawLocalAllergies) {
      try {
        localAllergiesList = JSON.parse(rawLocalAllergies);
      } catch (e) {}
    }

    const rawParts = rawDietStr.split(',').map(p => p.trim()).filter(Boolean);
    const dietaryList: string[] = [...localAllergiesList];
    let extractedDish = '';

    rawParts.forEach(part => {
      const lower = part.toLowerCase();
      if (lower.startsWith('plat:') || lower.startsWith('main:')) {
        extractedDish = part.replace(/^(plat|main):\s*/i, '').trim();
      } else if (lower.startsWith('entrée:') || lower.startsWith('starter:')) {
        if (!extractedDish) extractedDish = part.replace(/^(entrée|starter):\s*/i, '').trim();
      } else if (lower.startsWith('dessert:')) {
        if (!extractedDish) extractedDish = part.replace(/^dessert:\s*/i, '').trim();
      } else if (lower.startsWith('boisson:') || lower.startsWith('beverage:')) {
        if (!extractedDish) extractedDish = part.replace(/^(boisson|beverage):\s*/i, '').trim();
      } else if (!lower.startsWith('message:')) {
        if (!dietaryList.includes(part)) {
          dietaryList.push(part);
        }
      }
    });

    const localDish = localStorage.getItem(`guest_${gid}_last_selected_dish`);
    let cleanDishName = extractedDish || (localDish ? localDish.trim() : '');
    let detectedCat = localStorage.getItem(`guest_${gid}_last_selected_cat`) || 'MAIN';

    // Remove any raw enum prefix like 'MAIN: ', 'STARTER: ', 'DESSERT: ', 'Plat: '
    if (cleanDishName.startsWith('MAIN:')) {
      cleanDishName = cleanDishName.replace(/^MAIN:\s*/i, '').trim();
      detectedCat = 'MAIN';
    } else if (cleanDishName.startsWith('STARTER:')) {
      cleanDishName = cleanDishName.replace(/^STARTER:\s*/i, '').trim();
      detectedCat = 'STARTER';
    } else if (cleanDishName.startsWith('DESSERT:')) {
      cleanDishName = cleanDishName.replace(/^DESSERT:\s*/i, '').trim();
      detectedCat = 'DESSERT';
    } else if (cleanDishName.startsWith('Plat:')) {
      cleanDishName = cleanDishName.replace(/^Plat:\s*/i, '').trim();
      detectedCat = 'MAIN';
    } else if (cleanDishName.startsWith('Entrée:')) {
      cleanDishName = cleanDishName.replace(/^Entrée:\s*/i, '').trim();
      detectedCat = 'STARTER';
    } else if (cleanDishName.startsWith('Dessert:')) {
      cleanDishName = cleanDishName.replace(/^Dessert:\s*/i, '').trim();
      detectedCat = 'DESSERT';
    }

    if (!cleanDishName && isMenuViewed) {
      cleanDishName = isMixMode ? 'Dos de cabillaud sauce vierge' : 'Sélection des plats du menu';
    }

    let dishCategoryLabel = isMixMode ? 'Plat Chaud' : (isBuffetMode ? 'Plat Buffet' : 'Plat Principal');
    if (detectedCat === 'STARTER') dishCategoryLabel = isMixMode ? 'Buffet Entrées' : (isBuffetMode ? 'Entrée Buffet' : 'Entrée');
    else if (detectedCat === 'MAIN') dishCategoryLabel = isMixMode ? 'Plat Chaud' : (isBuffetMode ? 'Plat Buffet' : 'Plat Principal');
    else if (detectedCat === 'DESSERT') dishCategoryLabel = isMixMode ? 'Buffet Desserts' : (isBuffetMode ? 'Dessert Buffet' : 'Dessert');
    else if (detectedCat === 'BEVERAGE') dishCategoryLabel = 'Boisson & Bar';

    const dishImg = localStorage.getItem(`guest_${gid}_last_selected_image`) || 
      (detectedCat === 'DESSERT' ? '/assets/images/menu_dessert.png' : 
      (detectedCat === 'STARTER' ? '/assets/images/menu_starter.png' : '/assets/images/menu_main.png'));

    const dietaryTags = dietaryList.map(tag => {
      const lower = tag.toLowerCase();
      let icon = 'fa-circle-exclamation';
      let badgeClass = 'bg-warning-subtle text-amber-900 border border-warning';

      if (lower.includes('vegan') || lower.includes('végétalien')) {
        icon = 'fa-leaf';
        badgeClass = 'bg-success-subtle text-success border border-success';
      } else if (lower.includes('végéta') || lower.includes('veggie')) {
        icon = 'fa-carrot';
        badgeClass = 'bg-success-subtle text-success border border-success';
      } else if (lower.includes('gluten')) {
        icon = 'fa-wheat-awn';
        badgeClass = 'bg-warning-subtle text-amber-900 border border-warning';
      } else if (lower.includes('lactose')) {
        icon = 'fa-cow';
        badgeClass = 'bg-info-subtle text-primary border border-info';
      } else if (lower.includes('halal')) {
        icon = 'fa-moon';
        badgeClass = 'bg-primary-subtle text-primary border border-primary';
      } else if (lower.includes('arachide') || lower.includes('cacahuète') || lower.includes('noix')) {
        icon = 'fa-ban';
        badgeClass = 'bg-danger-subtle text-danger border border-danger';
      } else if (lower.includes('fruit') || lower.includes('mer') || lower.includes('poisson')) {
        icon = 'fa-fish-fins';
        badgeClass = 'bg-info-subtle text-info border border-info';
      } else if (lower.includes('sucre') || lower.includes('diab')) {
        icon = 'fa-cubes-stacked';
        badgeClass = 'bg-secondary-subtle text-secondary border border-secondary';
      } else if (lower.includes('allerg') || lower.includes('intolér')) {
        icon = 'fa-triangle-exclamation';
        badgeClass = 'bg-danger-subtle text-danger border border-danger';
      }

      return {
        label: tag,
        icon,
        badgeClass
      };
    });

    const activeChannels = this.getGuestChannels(guest);

    const rawStep = localStorage.getItem('guest_rsvp_current_step') || localStorage.getItem(`guest_${gid}_rsvp_step`);
    const lastRsvpStep = rawStep ? parseInt(rawStep, 10) : 0;
    const isDietViewed = isConfirmed || (dietaryList.length > 0) || (isMenuViewed && lastRsvpStep >= 4);

    // Compute active step index (1-based, 1 to 5)
    let currentStepNum = 1;
    if (hasResponded) currentStepNum = 5;
    else if (isDietViewed) currentStepNum = 4;
    else if (isMenuViewed) currentStepNum = 3;
    else if (isOpened) currentStepNum = 2;
    else if (isSent) currentStepNum = 2;

    const sampleBuffetDishes: SampleDish[] = [
      {
        name: 'Pastilla Royale aux Fruits de Mer',
        category: 'Buffet • Entrée Prestige',
        image: '/assets/images/menu_starter.png'
      },
      {
        name: 'Tajine d\'Agneau M\'rouzia & Pruneaux',
        category: 'Buffet • Plat Signature',
        image: '/assets/images/menu_main.png'
      }
    ];

    const evTitle = this.event()?.invitationTitle || this.event()?.title || 'Notre Célébration';
    const evSubtitle = this.event()?.invitationSubtitle || 'Invitation Officielle';
    const rawEvDate = this.event()?.invitationDate || this.event()?.eventDate;
    let formattedDate = 'Date à confirmer';
    if (rawEvDate) {
      try {
        formattedDate = new Date(rawEvDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
      } catch (e) {
        formattedDate = String(rawEvDate);
      }
    }
    const evLocation = this.event()?.invitationLocation || this.event()?.location || 'Casablanca, Maroc';

    const guestFullName = guest.fullName || (guest as any).name || 'L\'invité(e)';
    const guestFirstName = guestFullName.split(' ')[0] || guestFullName;

    const isPaidEvent = this.event()?.isPaidEvent === true || !!this.event()?.ticketPrice;
    const ticketPrice = this.event()?.ticketPrice || 0;
    const currency = this.event()?.currency || 'DH';
    const isPaid = guest.paymentStatus === 'PAID' || (guest.paidAmount !== undefined && guest.paidAmount >= ticketPrice);

    const sentChs = guest.sentChannels || [];
    let primaryChannel: 'WHATSAPP' | 'EMAIL' | 'SMS' | 'PAPER' = 'WHATSAPP';
    if (sentChs.includes('E-mail') && !sentChs.includes('WhatsApp')) {
      primaryChannel = 'EMAIL';
    } else if (sentChs.includes('SMS') && !sentChs.includes('WhatsApp')) {
      primaryChannel = 'SMS';
    } else if (sentChs.includes('Papier') && sentChs.length === 1) {
      primaryChannel = 'PAPER';
    } else if (!guest.phone && guest.email) {
      primaryChannel = 'EMAIL';
    }

    const steps: JourneyStep[] = [
      {
        stepNumber: 1,
        title: "Écran 1 : Envoi & Notification",
        shortTitle: "1. Envoi Notification",
        subtitle: isSent ? `Notification reçue par ${guestFirstName}` : "En attente d'expédition",
        icon: "fa-paper-plane",
        screenType: 'SMS_MESSAGE' as const,
        isCompleted: isSent,
        isCurrent: !isSent,
        timestamp: sentAt,
        badgeLabel: isSent ? "Envoyé" : "En attente",
        badgeClass: isSent ? "bg-success text-white" : "bg-warning-light text-black border border-warning-light",
        details: isSent ? `Transmis par ${activeChannels.map(c => c.type).join(' & ') || 'Notification'}` : `En attente du clic d'envoi`,
        channels: activeChannels.map(c => ({ name: c.type, icon: c.icon, colorClass: c.colorClass })),
        guestFirstName: guestFirstName,
        primaryChannelType: primaryChannel,
        narrativeMessage: isSent 
          ? `Invitation transmise avec succès à ${guestFirstName} par ${activeChannels.map(c => c.type).join(' & ') || 'message'}` 
          : `En attente d'expédition de l'invitation à ${guestFirstName}`
      },
      {
        stepNumber: 2,
        title: "Écran 2 : Découverte de l'Invitation",
        shortTitle: "2. Carte d'Invitation",
        subtitle: isOpened ? `${guestFirstName} a ouvert la carte d'invitation` : (isSent ? "En attente de consultation" : "Non distribué"),
        icon: "fa-envelope-open-text",
        screenType: 'INVITATION_PAGE1' as const,
        isCompleted: isOpened,
        isCurrent: isSent && !isOpened,
        timestamp: openedAt,
        badgeLabel: isOpened ? "Consulté" : (isSent ? "En cours" : "En attente"),
        badgeClass: isOpened ? "bg-success text-white" : (isSent && !isOpened ? "bg-warning text-dark fw-bold" : "bg-body-dark text-muted"),
        details: isOpened ? `Programme, date & lieu consultés (${evLocation})` : `Invitation non encore consultée`,
        page1Title: evTitle,
        page1Subtitle: evSubtitle,
        page1GuestName: guestFullName,
        page1Date: formattedDate,
        page1Location: evLocation,
        guestFirstName: guestFirstName,
        narrativeMessage: isOpened ? `${guestFirstName} a ouvert l'invitation et découvert le programme & le lieu` : `En attente de découverte par ${guestFirstName}`
      },
      {
        stepNumber: 3,
        title: "Écran 3 : Sélection Menu & Formule",
        shortTitle: "3. Choix Menu",
        subtitle: isBuffetMode 
          ? `Formule Buffet : ${guestFirstName} a découvert le menu` 
          : (cleanDishName ? `${guestFirstName} a choisi : ${cleanDishName}` : (isMenuViewed ? "Plats en cours de découverte" : (isDeclined ? "Non requis" : "En attente"))),
        icon: "fa-utensils",
        screenType: 'MENU_CHOICE' as const,
        isCompleted: isMenuViewed || isConfirmed,
        isCurrent: isOpened && !isMenuViewed && !hasResponded,
        badgeLabel: isBuffetMode ? "Buffet" : (isMenuViewed ? (isConfirmed ? "Sélectionné" : "En consultation") : (isDeclined ? "Non requis" : "En attente")),
        badgeClass: (isBuffetMode || isMenuViewed) ? "bg-success text-white" : (isOpened && !hasResponded ? "bg-warning text-dark fw-bold" : "bg-body-dark text-muted"),
        details: isBuffetMode ? `Formule Buffet : Présentation des plats du chef` : (cleanDishName ? `${dishCategoryLabel} : ${cleanDishName}` : `En attente du choix de menu`),
        dishChoice: cleanDishName,
        dishCategory: dishCategoryLabel,
        dishCategoryKey: detectedCat,
        dishImage: dishImg,
        cateringFormula: cateringFormulaName,
        cateringTabs: cateringTabs,
        isBuffetMode: isBuffetMode,
        sampleBuffetDishes: sampleBuffetDishes,
        guestFirstName: guestFirstName,
        narrativeMessage: isBuffetMode 
          ? `${guestFirstName} a pris connaissance de la Formule Buffet Libre-Service` 
          : (cleanDishName ? `${guestFirstName} a sélectionné son plat : ${cleanDishName}` : (isMenuViewed ? `${guestFirstName} consulte actuellement le menu` : `En attente du choix de menu par ${guestFirstName}`))
      },
      {
        stepNumber: 4,
        title: "Écran 4 : Régimes & Allergies",
        shortTitle: "4. Régimes & Allergies",
        subtitle: dietaryTags.length > 0 ? `${guestFirstName} a déclaré ${dietaryTags.length} restriction(s)` : (isDietViewed ? "Aucune allergie (Menu standard)" : "En attente"),
        icon: "fa-leaf",
        screenType: 'DIETARY_CHOICE' as const,
        isCompleted: isDietViewed || isConfirmed,
        isCurrent: isMenuViewed && !isDietViewed && !hasResponded,
        badgeLabel: dietaryTags.length > 0 ? `${dietaryTags.length} régimes` : (isDietViewed ? (isConfirmed ? "Standard" : "Consulté") : "En attente"),
        badgeClass: isDietViewed ? "bg-success text-white" : (isMenuViewed && !hasResponded ? "bg-warning text-dark fw-bold" : "bg-body-dark text-muted"),
        details: dietaryTags.length > 0 ? `${dietaryList.join(', ')} • Fiche traiteur` : (isDietViewed ? 'Menu classique sans restriction' : 'Préférences alimentaires en attente'),
        dietaryTags: dietaryTags,
        hasDietaryRestrictions: dietaryTags.length > 0,
        dietarySummary: dietaryList.join(', ') || 'Aucune restriction particulière',
        guestFirstName: guestFirstName,
        narrativeMessage: dietaryTags.length > 0 
          ? `${guestFirstName} a déclaré : ${dietaryList.join(', ')}` 
          : (isDietViewed ? `${guestFirstName} n'a signalé aucune allergie ni restriction (Menu Standard)` : `En attente des préférences alimentaires de ${guestFirstName}`)
      },
      {
        stepNumber: 5,
        title: "Écran 5 : Décision Finale (RSVP)",
        shortTitle: "5. Décision RSVP",
        subtitle: isConfirmed ? `${guestFirstName} a confirmé sa présence` : (isDeclined ? `${guestFirstName} a décliné l'invitation` : "En attente"),
        icon: isConfirmed ? "fa-circle-check" : (isDeclined ? "fa-circle-xmark" : "fa-clock"),
        screenType: 'RSVP_DECISION' as const,
        isCompleted: hasResponded,
        isCurrent: isDietViewed && !hasResponded,
        badgeLabel: isConfirmed ? "Confirmé" : (isDeclined ? "Décliné" : "En attente"),
        badgeClass: isConfirmed ? "bg-success text-white" : (isDeclined ? "bg-danger text-white" : "bg-warning-light text-black border border-warning-light"),
        details: isConfirmed 
          ? (isPaidEvent ? `Présence confirmée • ${isPaid ? 'Billet VIP Réglé' : 'Paiement en attente'}` : `Place réservée (${(guest as any).tableNumber || 'Table d\'Honneur'})`)
          : (isDeclined ? `Absence notifiée` : `En attente de la réponse finale`),
        tableNumber: (guest as any).tableNumber || (guest as any).table?.name || 'Table d\'Honneur',
        guestStatus: guest.status || 'PENDING',
        guestFirstName: guestFirstName,
        isPaidEvent: isPaidEvent,
        ticketPrice: ticketPrice,
        currency: currency,
        isPaid: isPaid,
        narrativeMessage: isConfirmed
          ? (isPaidEvent ? `${guestFirstName} a confirmé sa présence et validé son pass VIP` : `${guestFirstName} a confirmé sa présence • Table & Place réservées`)
          : (isDeclined ? `${guestFirstName} a décliné l'invitation et ne pourra pas être présent(e)` : `En attente de la décision finale de ${guestFirstName}`)
      }
    ];

    let pct = 0;
    if (isConfirmed || isDeclined) pct = 100;
    else if (isDietViewed) pct = 80;
    else if (isMenuViewed) pct = 60;
    else if (isOpened) pct = 40;
    else if (isSent) pct = 20;

    let statusLabel = 'En attente d\'envoi';
    let statusBadge = 'bg-body-dark text-black border';
    if (isConfirmed) {
      statusLabel = 'Présence Confirmée';
      statusBadge = 'bg-success text-white shadow-sm';
    } else if (isDeclined) {
      statusLabel = 'Invitation Déclinée';
      statusBadge = 'bg-danger text-white shadow-sm';
    } else if (isDietViewed) {
      statusLabel = 'Régimes & Allergies consultés';
      statusBadge = 'bg-warning text-dark shadow-sm';
    } else if (isMenuViewed) {
      statusLabel = 'En cours de sélection du Menu';
      statusBadge = 'bg-warning text-dark shadow-sm';
    } else if (isOpened) {
      statusLabel = 'Invitation Ouverte';
      statusBadge = 'bg-info text-white shadow-sm';
    } else if (isSent) {
      statusLabel = 'Invitation Envoyée';
      statusBadge = 'bg-primary text-white shadow-sm';
    }

    return {
      guest,
      completionPercentage: pct,
      currentStatusLabel: statusLabel,
      currentStatusBadgeClass: statusBadge,
      currentActiveStepIndex: currentStepNum,
      steps
    };
  }

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

  public getTemplateCountForCategory(catId: string): number {
    const allTaxonomy = this.taxonomy();
    const mainCat = getCategoryTaxonomy(catId, allTaxonomy);
    if (!mainCat) return 0;
    return this.templates().filter(t => {
      const tMain = getCategoryTaxonomy(t.category, allTaxonomy);
      return tMain?.id === mainCat.id || t.category === mainCat.name;
    }).length;
  }

  public getMainCategoryBadgeClass(category: string): string {
    const tax = getCategoryTaxonomy(category, this.taxonomy());
    return tax ? tax.badgeClass : 'bg-secondary-subtle text-secondary';
  }

  public getMainCategoryIcon(category: string): string {
    const tax = getCategoryTaxonomy(category, this.taxonomy());
    return tax ? tax.icon : 'fa-tag';
  }

  public getSubCategoryIcon(category: string, subCategory?: string): string {
    if (!subCategory) return 'fa-folder';
    const tax = getCategoryTaxonomy(category, this.taxonomy());
    const sub = tax?.subCategories.find(s => s.name.toLowerCase() === subCategory.toLowerCase());
    return sub ? sub.icon : 'fa-star';
  }

  private loadData(eventId: number): void {
    this.isLoading.set(true);

    forkJoin({
      templateList: this.templateService.getTemplates(),
      guestList: this.guestService.getGuestsByEvent(eventId),
      evt: this.eventService.getEventById(eventId)
    }).subscribe({
      next: ({ templateList, guestList, evt }) => {
        // 1. Process templates
        const modifiedList = (templateList || []).map(t => {
          if (t.id === 2 || t.title === 'Or & Velours') {
            return {
              ...t,
              imageUrl: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=400&q=75'
            };
          }
          return t;
        });
        this.templates.set(modifiedList);

        // 2. Process guests
        const updatedList = (guestList || []).map(g => {
          if (!g.id) return g;
          const localSent = localStorage.getItem(`guest_${g.id}_isSent`);
          const rawChannels = localStorage.getItem(`guest_${g.id}_sentChannels`);
          let sentChannels: string[] | undefined = undefined;
          if (rawChannels) {
            try {
              sentChannels = JSON.parse(rawChannels);
            } catch (e) {}
          }
          if (localSent === 'true') {
            return { ...g, isSent: true, invitationStatus: 'SENT', sentChannels: sentChannels || g.sentChannels };
          }
          return { ...g, sentChannels: sentChannels || g.sentChannels };
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

        // 3. Process event details
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
          const selected = modifiedList.find(t => t.id === evt.digitalTemplateId);
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
        console.error('Erreur chargement données:', err);
        this.errorMessage.set('Impossible de charger les données de l\'événement.');
        this.isLoading.set(false);
      }
    });
  }

  protected selectTemplate(template: DigitalTemplate): void {
    if (this.isSubscriptionExpired()) {
      this.errorMessage.set("Abonnement expiré — Mode consultation uniquement. La modification du modèle est restreinte. Veuillez renouveler votre abonnement.");
      return;
    }
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

  protected formatPreviewDate(): string {
    if (!this.invitationDateStr) return 'Date de la réception';
    try {
      const d = new Date(this.invitationDateStr + 'T00:00:00');
      return d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    } catch {
      return this.invitationDateStr;
    }
  }

  protected getTemplateAccentColor(template?: DigitalTemplate | null): string {
    if (!template) return '#4f46e5';
    if (template.accentColor) return template.accentColor;
    const tax = getCategoryTaxonomy(template.category, this.taxonomy());
    return tax?.colorAccent || '#4f46e5';
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

  protected selectOnlyUnsent(): void {
    const selection: Record<number, boolean> = {};
    this.guests().forEach(g => {
      if (g.id) {
        selection[g.id] = !(g.isSent === true || g.invitationStatus === 'SENT');
      }
    });
    this.selectedGuestIds.set(selection);
  }

  protected selectAll(): void {
    const selection: Record<number, boolean> = {};
    this.guests().forEach(g => {
      if (g.id) {
        selection[g.id] = true;
      }
    });
    this.selectedGuestIds.set(selection);
  }

  protected openBatchPaperModal(): void {
    window.print();
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

  protected getGuestRsvpBadge(guest: Guest): { label: string; icon: string; cssClass: string } {
    const gid = guest.id;
    const localStatus = gid ? localStorage.getItem(`guest_${gid}_status`) : null;
    const status = localStatus || guest.status;

    if (status === 'CONFIRMED') {
      return {
        label: 'Confirmé',
        icon: 'fa-circle-check',
        cssClass: 'bg-success-subtle text-success border border-success-subtle'
      };
    } else if (status === 'DECLINED') {
      return {
        label: 'Absent',
        icon: 'fa-circle-xmark',
        cssClass: 'bg-danger-subtle text-danger border border-danger-subtle'
      };
    }
    return {
      label: 'En attente',
      icon: 'fa-clock',
      cssClass: 'bg-warning-subtle text-warning border border-warning-subtle'
    };
  }

  protected getGuestChannels(g: Guest): { type: string; icon: string; colorClass: string; title: string }[] {
    const channels: { type: string; icon: string; colorClass: string; title: string }[] = [];
    
    // If guest has recorded sent channels, display ONLY those sent channels
    if (g.sentChannels && g.sentChannels.length > 0) {
      if (g.sentChannels.includes('WhatsApp')) {
        channels.push({ type: 'WhatsApp', icon: 'fab fa-whatsapp', colorClass: 'text-success', title: `Envoyé via WhatsApp: ${g.phone || ''}` });
      }
      if (g.sentChannels.includes('SMS')) {
        channels.push({ type: 'SMS', icon: 'fa fa-comment-sms', colorClass: 'text-warning', title: `Envoyé via SMS: ${g.phone || ''}` });
      }
      if (g.sentChannels.includes('E-mail')) {
        channels.push({ type: 'E-mail', icon: 'fa fa-envelope', colorClass: 'text-primary', title: `Envoyé via E-mail: ${g.email || ''}` });
      }
      if (g.sentChannels.includes('Papier')) {
        channels.push({ type: 'Papier', icon: 'fa fa-envelope-open-text', colorClass: 'text-secondary', title: 'Format Papier / En main propre' });
      }
      return channels;
    }

    // Otherwise (pending / not sent yet), show available channels based on provided contact details
    if (g.phone && g.phone.trim().length > 0) {
      channels.push({ type: 'WhatsApp', icon: 'fab fa-whatsapp', colorClass: 'text-success', title: `WhatsApp: ${g.phone}` });
      channels.push({ type: 'SMS', icon: 'fa fa-comment-sms', colorClass: 'text-warning', title: `SMS: ${g.phone}` });
    }
    if (g.email && g.email.trim().length > 0) {
      channels.push({ type: 'E-mail', icon: 'fa fa-envelope', colorClass: 'text-primary', title: `E-mail: ${g.email}` });
    }

    return channels;
  }

  protected sendInvitations(): void {
    if (this.isSubscriptionExpired()) {
      this.errorMessage.set("Abonnement expiré — Mode consultation uniquement. L'envoi d'invitations est restreint. Veuillez renouveler votre abonnement.");
      setTimeout(() => this.errorMessage.set(''), 4000);
      return;
    }
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
        const tokenOrId = (guest as any).invitationToken ? (guest as any).invitationToken : guest.id;
        const guestLink = `${window.location.origin}/rsvp/${tokenOrId}`;
        console.log(`Envoi à: ${guest.fullName} | Lien unique: ${guestLink} | Canaux: ${activeChannels.join(', ')}`);
        localStorage.setItem(`guest_${guest.id}_isSent`, 'true');
        localStorage.setItem(`guest_${guest.id}_sentChannels`, JSON.stringify(activeChannels));
        return { ...guest, isSent: true, invitationStatus: 'SENT', sentChannels: activeChannels };
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
