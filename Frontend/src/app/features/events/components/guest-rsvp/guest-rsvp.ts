import { Component, OnInit, OnDestroy, OnChanges, SimpleChanges, signal, inject, computed, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { loadGoogleFont } from '../../../../core/utils/font-loader';

export interface PublicRsvpDetail {
  guestId: number;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  guestStatus: string;
  tableNumber: string;
  dietaryRequirements: string;
  eventId: number;
  eventTitle: string;
  eventDate: string;
  eventLocation: string;
  locationMapUrl?: string;
  digitalTemplateId?: number;
  invitationTitle?: string;
  invitationSubtitle?: string;
  invitationDate?: string;
  invitationLocation?: string;
  parkingLocation?: string;
  mealType?: string; // BUFFET or PLATS_FIXES
  templateCategory?: string; // Mariage, Corporate, etc.
  templateSubCategory?: string;
  templateId?: string;
  templateTitle?: string;
  decorativeFrame?: string; // floral-frame, gold-border, geometric-frame, minimal-edge
  accentColor?: string;
  backgroundColor?: string;
  templateBackgroundImageUrl?: string;
  templateBackgroundImageDesktopUrl?: string;
  primaryFont?: string;
  primaryFontSize?: string;
  primaryFontWeight?: string;
  primaryLetterSpacing?: string;
  secondaryFont?: string;
  secondaryFontSize?: string;
  secondaryFontWeight?: string;
  secondaryLetterSpacing?: string;
  secondaryFontColor?: string;
  templateMusicUrl?: string;
  openingAnimation?: string | null;
  visualParticles?: string | null;
  backgroundMotion?: string | null;
  contentEntrance?: string | null;
  showCountdown?: boolean | null;
  showCalendarButton?: boolean | null;
  showMapRoute?: boolean | null;
  menuItems?: any[];
  isPaidEvent?: boolean;
  ticketPrice?: number;
  currency?: string;
  paymentStatus?: string;
  paidAmount?: number;
  paymentReference?: string;
  paymentDate?: string;
}

@Component({
  selector: 'app-guest-rsvp',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './guest-rsvp.html',
  styleUrls: ['./guest-rsvp.scss']
})
export class GuestRsvp implements OnInit, OnDestroy, OnChanges {
  private readonly route = inject(ActivatedRoute);
  private readonly http = inject(HttpClient);

  @Input() previewMode: boolean = false;
  @Input() cardOnlyMode: boolean = false;
  @Input() previewData?: PublicRsvpDetail | null;

  protected readonly guest = signal<PublicRsvpDetail | null>(null);
  protected readonly isLoading = signal(true);
  protected readonly isSubmitting = signal(false);
  protected readonly isSuccess = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly isFullMenuModalOpen = signal(false);
  protected readonly isMenuRsvpOpen = signal(false);
  public readonly currentRsvpStep = signal<number>(0);
  protected readonly isDeclineModalOpen = signal(false);
  public declineMessage = '';
  protected readonly isPaymentModalOpen = signal(false);
  protected readonly isProcessingPayment = signal(false);
  protected readonly paymentMethod = signal<'CARD' | 'TRANSFER'>('CARD');
  protected readonly cardNumber = signal('•••• •••• •••• 4242');
  protected readonly cardExpiry = signal('12/28');
  protected readonly cardCvc = signal('•••');
  protected readonly cardHolder = signal('');
  protected readonly activeCarouselIndex = signal<number>(0);
  private touchStartX = 0;

  // Invitation Opening Cinematic State (Envelope, Curtains, Ribbon, Doors, etc.)
  public readonly isInvitationOpened = signal<boolean>(false);
  public readonly isOpeningTransitioning = signal<boolean>(false);
  public readonly isInitialEntranceCompleted = signal<boolean>(false);

  public isInteractiveAnimation(): boolean {
    const anim = this.guest()?.openingAnimation;
    return !!anim && ['envelope-wax', 'ribbon-cut', 'curtain-unveil', 'sliding-doors', 'vip-badge'].includes(anim);
  }

  public isEntranceActive(): boolean {
    if (this.isInteractiveAnimation()) {
      return this.isOpeningTransitioning() || this.isInvitationOpened();
    }
    return this.isInvitationOpened();
  }

  public shouldHideWallpaperBeforeOpening(): boolean {
    return this.isInteractiveAnimation() && !this.isInvitationOpened() && !this.isOpeningTransitioning();
  }

  public openInvitationExperience(): void {
    if (this.isOpeningTransitioning() || this.isInvitationOpened()) return;
    this.isOpeningTransitioning.set(true);

    // If music is configured on the template and not yet playing, start it on guest's first interactive gesture!
    if (!this.isMusicPlaying() && this.guest()?.templateMusicUrl) {
      this.toggleMusic();
    }

    const anim = this.guest()?.openingAnimation;
    let duration = 800;
    if (anim === 'envelope-wax') {
      duration = 1440;
    } else if (anim === 'ribbon-cut') {
      duration = 1240;
    } else if (anim === 'curtain-unveil') {
      duration = 1640;
    } else if (anim === 'sliding-doors') {
      duration = 1540;
    } else if (anim === 'vip-badge') {
      duration = 940;
    }

    setTimeout(() => {
      this.isInvitationOpened.set(true);
      this.isOpeningTransitioning.set(false);
      setTimeout(() => {
        this.isInitialEntranceCompleted.set(true);
      }, 10000);
      const gid = this.guest()?.guestId;
      if (gid) {
        const now = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
        localStorage.setItem(`guest_${gid}_opened_at`, now);
        localStorage.setItem(`guest_${gid}_envelope_unsealed`, 'true');
      }
    }, duration);
  }

  public replayInvitationExperience(): void {
    this.isOpeningTransitioning.set(false);
    this.isInvitationOpened.set(false);
  }

  // =========================================================================
  // DYNAMIC VISUAL PARTICLES & SPECIAL EFFECTS (Configured in Admin Template)
  // =========================================================================
  public readonly goldDustParticles = Array.from({ length: 48 }, (_, i) => ({
    id: i,
    left: ((i * 19 + 7) % 96) + 2 + '%',
    top: ((i * 23 + 11) % 94) + 3 + '%',
    size: ((i % 4) + 2.5) + 'px',
    delay: ((i * 0.45) % 6) + 's',
    duration: ((i % 4) * 1.8 + 8.5) + 's'
  }));

  public readonly rosePetals = Array.from({ length: 28 }, (_, i) => ({
    id: i,
    left: ((i * 17 + 5) % 94) + 3 + '%',
    top: ((i * 29 + 13) % 92) + 4 + '%',
    size: ((i % 3) * 2 + 7.5) + 'px',
    delay: ((i * 0.6) % 8) + 's',
    duration: ((i % 4) * 2.5 + 12) + 's',
    rotation: ((i * 47) % 360) + 'deg'
  }));

  public readonly confettiPieces = Array.from({ length: 40 }, (_, i) => ({
    id: i,
    left: ((i * 13 + 3) % 96) + 2 + '%',
    delay: ((i * 0.4) % 6) + 's',
    duration: ((i % 4) * 2 + 9) + 's',
    color: ['#ffd700', '#f43f5e', '#3b82f6', '#10b981', '#a855f7', '#fbbf24', '#ec4899'][i % 7],
    width: ((i % 2) === 0 ? 4.5 : 6.5) + 'px',
    height: ((i % 2) === 0 ? 6.5 : 4.5) + 'px'
  }));

  public readonly sparklesStars = Array.from({ length: 32 }, (_, i) => ({
    id: i,
    left: ((i * 23 + 9) % 92) + 4 + '%',
    top: ((i * 17 + 13) % 90) + 5 + '%',
    delay: ((i * 0.5) % 5) + 's',
    duration: ((i % 3) * 1.5 + 5.5) + 's',
    size: ((i % 3) + 13) + 'px'
  }));

  public readonly bokehBubbles = Array.from({ length: 14 }, (_, i) => ({
    id: i,
    left: ((i * 29 + 11) % 86) + 7 + '%',
    top: ((i * 31 + 7) % 84) + 8 + '%',
    size: (55 + (i % 5) * 22) + 'px',
    delay: (i * 0.5) + 's',
    duration: (6 + (i % 3) * 2.5) + 's'
  }));

  public getVisualParticles(): string {
    const vp = this.guest()?.visualParticles;
    if (vp && vp.trim() !== '') {
      return vp.trim();
    }
    return 'gold-dust';
  }

  public getBackgroundMotion(): string {
    const bm = this.guest()?.backgroundMotion;
    if (bm && bm.trim() !== '') {
      return bm.trim();
    }
    return 'ken-burns';
  }

  public getContentEntrance(): string {
    const ce = this.guest()?.contentEntrance;
    if (ce && ce.trim() !== '') {
      return ce.trim();
    }
    return 'staggered-royal';
  }

  public saveCurrentRsvpProgress(): void {
    const gid = this.guest()?.guestId;
    if (!gid) return;
    localStorage.setItem(`guest_${gid}_is_rsvp_open`, 'true');
    localStorage.setItem(`guest_${gid}_envelope_unsealed`, 'true');
    localStorage.setItem(`guest_${gid}_last_rsvp_step`, String(this.currentRsvpStep()));
    if (this.starterChoice) localStorage.setItem(`guest_${gid}_starterChoice`, this.starterChoice);
    if (this.mealChoice) localStorage.setItem(`guest_${gid}_mealChoice`, this.mealChoice);
    if (this.dessertChoice) localStorage.setItem(`guest_${gid}_dessertChoice`, this.dessertChoice);
    if (this.beverageChoice) localStorage.setItem(`guest_${gid}_beverageChoice`, this.beverageChoice);
    this.syncDietaryToStorage();
  }

  protected openMenuAndRsvp(): void {
    this.isInitialEntranceCompleted.set(true);
    this.isMenuRsvpOpen.set(true);
    this.saveCurrentRsvpProgress();
  }

  protected closeMenuAndRsvp(): void {
    this.isInitialEntranceCompleted.set(true);
    const gid = this.guest()?.guestId;
    if (gid) {
      localStorage.setItem(`guest_${gid}_is_rsvp_open`, 'false');
    }
    this.isMenuRsvpOpen.set(false);
    this.isDiscoveryMode.set(false);
  }

  public openDeclineModal(): void {
    this.isDeclineModalOpen.set(true);
  }

  public closeDeclineModal(): void {
    this.isDeclineModalOpen.set(false);
  }

  public getEventHostLabel(): string {
    const cat = this.guest()?.templateCategory?.toLowerCase() || '';
    if (cat.includes('mariage') || cat.includes('wedding')) return 'aux mariés';
    if (cat.includes('corporate') || cat.includes('entreprise') || cat.includes('pro')) return 'aux organisateurs';
    if (cat.includes('anniversaire')) return 'à la personne célébrée';
    return 'aux hôtes';
  }

  public getSavedDeclineMessage(): string {
    if (this.declineMessage && this.declineMessage.trim()) {
      return this.declineMessage.trim();
    }
    const diets = this.guest()?.dietaryRequirements;
    if (diets && diets.includes('Message:')) {
      return diets.substring(diets.indexOf('Message:') + 8).trim();
    }
    return '';
  }

  public confirmDecline(): void {
    this.status.set('DECLINED');
    this.attendanceStatus = false;
    this.selectedAttendanceChoice.set('DECLINED');
    this.isDeclineModalOpen.set(false);
    if (this.previewMode) {
      this.isSuccess.set(true);
      return;
    }
    this.submitResponse(true);
  }

  public readonly isDiscoveryMode = signal<boolean>(false);

  private recordMenuStep(categoryOrDetail?: string, dishName?: string, imageUrl?: string): void {
    const gid = this.guest()?.guestId;
    if (!gid) return;
    const now = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    localStorage.setItem(`guest_${gid}_menu_viewed`, 'true');
    localStorage.setItem(`guest_${gid}_menu_viewed_at`, now);
    if (dishName) {
      localStorage.setItem(`guest_${gid}_last_selected_dish`, dishName);
    } else if (categoryOrDetail && !['STARTER', 'MAIN', 'DESSERT', 'BEVERAGE'].includes(categoryOrDetail)) {
      localStorage.setItem(`guest_${gid}_last_selected_dish`, categoryOrDetail);
    }
    if (categoryOrDetail && ['STARTER', 'MAIN', 'DESSERT', 'BEVERAGE'].includes(categoryOrDetail)) {
      localStorage.setItem(`guest_${gid}_last_selected_cat`, categoryOrDetail);
    }
    if (imageUrl) {
      localStorage.setItem(`guest_${gid}_last_selected_image`, imageUrl);
    }
  }

  public startDiscoveryWorkflow(): void {
    this.isDiscoveryMode.set(true);
    this.selectedAttendanceChoice.set(null);
    this.attendanceStatus = null;
    this.currentRsvpStep.set(0);
    this.isMenuRsvpOpen.set(true);
    this.recordMenuStep('Navigation vers le menu gastronomique');
    this.saveCurrentRsvpProgress();
  }

  public pivotFromDiscoveryToAccept(): void {
    this.isDiscoveryMode.set(false);
    this.attendanceStatus = true;
    this.status.set('CONFIRMED');
    this.selectedAttendanceChoice.set('CONFIRMED');
    this.currentRsvpStep.set(0);
    this.isMenuRsvpOpen.set(true);
    this.recordMenuStep('Validation présence & menu');
    this.saveCurrentRsvpProgress();
  }

  public startAcceptWorkflow(): void {
    this.isDiscoveryMode.set(false);
    this.attendanceStatus = true;
    this.status.set('CONFIRMED');
    this.selectedAttendanceChoice.set('CONFIRMED');
    this.hasConfirmedMenuChoice.set(!!(this.starterChoice || this.mealChoice || this.dessertChoice || this.beverageChoice));
    this.currentRsvpStep.set(0);
    this.isMenuRsvpOpen.set(true);
    this.recordMenuStep('Sélection des plats du menu');
    this.saveCurrentRsvpProgress();
  }

  public reopenRsvpToAccept(): void {
    this.isDiscoveryMode.set(false);
    this.isSuccess.set(false);
    this.status.set('CONFIRMED');
    this.attendanceStatus = true;
    this.selectedAttendanceChoice.set('CONFIRMED');
    this.currentRsvpStep.set(0);
    this.isMenuRsvpOpen.set(true);
    this.saveCurrentRsvpProgress();
  }

  // Course fallback defaults
  protected readonly defaultStarters = [
    { name: "Duo de Saint-Jacques dorées, émulsion d'agrumes", imageUrl: "/assets/images/menu_starter.png" },
    { name: "Velouté de potimarron & éclats de châtaignes", imageUrl: "/assets/images/menu_starter.png" },
    { name: "Carpaccio de bœuf mariné & copeaux de parmesan", imageUrl: "/assets/images/menu_starter.png" }
  ];

  protected readonly defaultMains = [
    { name: "Filet de bœuf rôti, purée fine truffée", imageUrl: "/assets/images/menu_main.png" },
    { name: "Pavé de saumon rôti & risotto aux asperges", imageUrl: "/assets/images/menu_main.png" },
    { name: "Suprême de volaille fermière aux morilles", imageUrl: "/assets/images/menu_main.png" }
  ];

  protected readonly defaultDesserts = [
    { name: "Dôme au chocolat intense & feuille d'or", imageUrl: "/assets/images/menu_dessert.png" },
    { name: "Mille-feuille croustillant à la vanille bourbon", imageUrl: "/assets/images/menu_dessert.png" },
    { name: "Tartelette sablée aux fruits rouges de saison", imageUrl: "/assets/images/menu_dessert.png" }
  ];

  protected readonly defaultBeverages = [
    { name: "Sélection de Vins Fins & Champagne", imageUrl: "/assets/images/menu_starter.png" },
    { name: "Cocktail Signature aux notes d'agrumes", imageUrl: "/assets/images/menu_starter.png" },
    { name: "Mocktail Fraîcheur Citron & Menthe", imageUrl: "/assets/images/menu_starter.png" },
    { name: "Eaux minérales plates et gazeuses", imageUrl: "/assets/images/menu_starter.png" }
  ];

  public readonly availableStarters = computed<any[]>(() => {
    const list = this.starters();
    return (list && list.length > 0)
      ? list.map(item => ({ ...item, imageUrl: item.imageUrl || '/assets/images/menu_starter.png' }))
      : this.defaultStarters;
  });

  public readonly availableMains = computed<any[]>(() => {
    const list = this.mainDishes();
    return (list && list.length > 0)
      ? list.map(item => ({ ...item, imageUrl: item.imageUrl || '/assets/images/menu_main.png' }))
      : this.defaultMains;
  });

  public readonly availableDesserts = computed<any[]>(() => {
    const list = this.desserts();
    return (list && list.length > 0)
      ? list.map(item => ({ ...item, imageUrl: item.imageUrl || '/assets/images/menu_dessert.png' }))
      : this.defaultDesserts;
  });

  public readonly availableBeverages = computed<any[]>(() => {
    const list = this.beverages();
    return (list && list.length > 0)
      ? list.map(item => ({ ...item, imageUrl: item.imageUrl || '/assets/images/menu_starter.png' }))
      : this.defaultBeverages;
  });

  public readonly hasManyDishesInCurrentStep = computed<boolean>(() => {
    const mode = this.cateringMode();
    const step = this.currentRsvpStep();
    if (mode === 'BUFFET' && step === 0) return this.allBuffetItems().length > 3;
    if (mode === 'MIX' && step === 2) return (this.availableDesserts().length + this.availableBeverages().length) > 3;
    if (step === 0) return this.availableStarters().length > 3;
    if (step === 1) return this.availableMains().length > 3;
    if (step === 2) return this.availableDesserts().length > 3;
    if (step === 3) return this.availableBeverages().length > 3;
    return false;
  });

  protected readonly carouselItems = computed<any[]>(() => {
    const data = this.guest();
    if (!data || !data.menuItems || data.menuItems.length === 0) {
      return [
        {
          name: "Duo de Saint-Jacques dorées, émulsion d'agrumes",
          categoryLabel: "Entrée",
          image: "/assets/images/menu_starter.png"
        },
        {
          name: "Filet de bœuf rôti, purée fine truffée",
          categoryLabel: "Plat Principal",
          image: "/assets/images/menu_main.png"
        },
        {
          name: "Dôme au chocolat intense, éclat de feuille d'or",
          categoryLabel: "Dessert",
          image: "/assets/images/menu_dessert.png"
        }
      ];
    }

    const starters = data.menuItems.filter(item => item.category === 'STARTER' || item.category === 'BUFFET_STARTER').slice(0, 3);
    const mains = data.menuItems.filter(item => item.category === 'MAIN' || item.category === 'BUFFET_MAIN').slice(0, 3);
    const desserts = data.menuItems.filter(item => item.category === 'DESSERT' || item.category === 'BUFFET_DESSERT').slice(0, 3);
    const beverages = data.menuItems.filter(item => item.category === 'BEVERAGE').slice(0, 3);

    const orderedItems = [...starters, ...mains, ...desserts, ...beverages];

    return orderedItems.map(item => {
      let catLabel = 'Plat';
      let img = item.imageUrl || '/assets/images/menu_main.png';

      const cat = item.category || '';
      if (cat.includes('STARTER')) {
        catLabel = 'Entrée';
        img = item.imageUrl || '/assets/images/menu_starter.png';
      } else if (cat.includes('MAIN')) {
        catLabel = 'Plat Principal';
        img = item.imageUrl || '/assets/images/menu_main.png';
      } else if (cat.includes('DESSERT')) {
        catLabel = 'Dessert';
        img = item.imageUrl || '/assets/images/menu_dessert.png';
      } else if (cat.includes('BEVERAGE')) {
        catLabel = 'Boisson';
        img = item.imageUrl || '/assets/images/menu_starter.png';
      }

      return {
        name: item.name,
        categoryLabel: catLabel,
        description: item.description,
        image: img
      };
    });
  });

  private hasFormat(format: string): boolean {
    const m = this.guest()?.mealType;
    return !!m && m.toUpperCase().includes(format.toUpperCase());
  }

  public readonly cateringMode = computed<'BUFFET' | 'PLATS_FIXES' | 'MIX'>(() => {
    const m = (this.guest()?.mealType || 'PLATS_FIXES').toUpperCase();
    if (m.includes('MIX') || (m.includes('BUFFET_ENTREES') && m.includes('PLATS_FIXES'))) {
      return 'MIX';
    }
    if (m.includes('BUFFET') && !m.includes('PLATS_FIXES')) {
      return 'BUFFET';
    }
    return 'PLATS_FIXES';
  });

  public readonly isBuffetMode = computed(() => this.cateringMode() === 'BUFFET');
  public readonly isMixMode = computed(() => this.cateringMode() === 'MIX');
  public readonly isPlatedMode = computed(() => this.cateringMode() === 'PLATS_FIXES');

  protected readonly isMix = this.isMixMode;
  protected readonly isBuffet = this.isBuffetMode;
  protected readonly isPlated = this.isPlatedMode;

  public readonly allBuffetItems = computed<any[]>(() => {
    const data = this.guest();
    if (data?.menuItems && data.menuItems.length > 0) {
      return data.menuItems.map(item => ({
        ...item,
        imageUrl: item.imageUrl || '/assets/images/menu_starter.png',
        categoryLabel: (item.category || '').toUpperCase().includes('STARTER') ? 'Entrée / Salé'
          : (item.category || '').toUpperCase().includes('MAIN') ? 'Plat Chaud'
          : (item.category || '').toUpperCase().includes('DESSERT') ? 'Douceur'
          : 'Boisson'
      }));
    }
    const starters = this.availableStarters().map(d => ({ ...d, categoryLabel: 'Entrée / Salé' }));
    const mains = this.availableMains().map(d => ({ ...d, categoryLabel: 'Plat Chaud' }));
    const desserts = this.availableDesserts().map(d => ({ ...d, categoryLabel: 'Douceur' }));
    const beverages = this.availableBeverages().map(d => ({ ...d, categoryLabel: 'Boisson' }));
    return [...starters, ...mains, ...desserts, ...beverages];
  });

  public getInvitationSubtitle(): string {
    const subtitle = this.guest()?.invitationSubtitle;
    if (subtitle && subtitle.trim()) {
      return subtitle.trim();
    }
    const cat = (this.guest()?.templateCategory || '').toLowerCase();
    const subCat = (this.guest()?.templateSubCategory || '').toLowerCase();
    if (subCat.includes('mariage') || cat.includes('mariage')) {
      return 'Le Mariage de';
    }
    if (subCat.includes('fiançailles') || subCat.includes('fiancailles')) {
      return 'Les Fiançailles de';
    }
    if (cat.includes('corporate') || subCat.includes('séminaire') || subCat.includes('conférence')) {
      return 'Événement d\'Entreprise';
    }
    return 'Invitation d\'Exception';
  }

  public getDisplayTitle(): string {
    const invTitle = this.guest()?.invitationTitle?.trim();
    const evTitle = this.guest()?.eventTitle?.trim();
    const sub = this.getInvitationSubtitle()?.trim();
    const rawTitle = invTitle || evTitle || 'Artila Web';

    if (sub && rawTitle.toLowerCase().startsWith(sub.toLowerCase())) {
      const clean = rawTitle.substring(sub.length).trim().replace(/^de\s+/i, '').trim();
      if (clean) return clean;
    }

    if (invTitle && sub && invTitle.toLowerCase() === sub.toLowerCase()) {
      if (evTitle && evTitle.toLowerCase() !== sub.toLowerCase()) {
        return evTitle;
      }
      return 'Artila Web';
    }

    return rawTitle;
  }

  public getPrimaryFont(): string {
    const f = this.guest()?.primaryFont;
    if (f && f.trim()) {
      loadGoogleFont(f.trim());
      return `'${f.trim()}', cursive, serif`;
    }
    const cat = this.guest()?.templateCategory;
    if (cat === 'Corporate') return "'Montserrat', sans-serif";
    if (cat === 'Anniversaire') return "'Great Vibes', cursive";
    return "'Alex Brush', 'Great Vibes', cursive";
  }

  public getPrimaryFontSize(): string {
    const s = this.guest()?.primaryFontSize;
    if (s && s.trim()) return s.trim();
    return '36px';
  }

  public getPrimaryFontWeight(): string {
    const w = this.guest()?.primaryFontWeight;
    if (w && w.trim()) return w.trim();
    return '700';
  }

  public getPrimaryLetterSpacing(): string {
    const ls = this.guest()?.primaryLetterSpacing;
    if (ls && ls.trim()) return ls.trim();
    return 'normal';
  }

  public getSecondaryFont(): string {
    const f = this.guest()?.secondaryFont;
    if (f && f.trim()) {
      loadGoogleFont(f.trim());
      return `'${f.trim()}', sans-serif, serif`;
    }
    const cat = this.guest()?.templateCategory;
    if (cat === 'Corporate') return "'Playfair Display', serif";
    if (cat === 'Anniversaire') return "'Cormorant Garamond', serif";
    return "'Cinzel', 'Playfair Display', serif";
  }

  public getSecondaryFontSize(): string {
    const s = this.guest()?.secondaryFontSize;
    if (s && s.trim()) return s.trim();
    return '16px';
  }

  public getSecondaryFontWeight(): string {
    const w = this.guest()?.secondaryFontWeight;
    if (w && w.trim()) return w.trim();
    return '400';
  }

  public getSecondaryLetterSpacing(): string {
    const ls = this.guest()?.secondaryLetterSpacing;
    if (ls && ls.trim()) return ls.trim();
    return 'normal';
  }

  public getPrimaryColor(): string {
    if (this.guest()?.accentColor && this.guest()!.accentColor!.trim()) {
      return this.guest()!.accentColor!.trim();
    }
    return '#d4af37';
  }

  public getDirectionsUrl(destination?: string, exactUrl?: string): string {
    if (exactUrl && exactUrl.trim()) {
      return exactUrl.trim();
    }
    if (!destination || !destination.trim()) {
      return 'https://maps.google.com';
    }
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination.trim())}`;
  }

  public getEventMapUrl(): string {
    const directUrl = this.guest()?.locationMapUrl;
    if (directUrl && directUrl.trim()) {
      return directUrl.trim();
    }
    const loc = this.guest()?.invitationLocation || this.guest()?.eventLocation;
    return this.getDirectionsUrl(loc);
  }

  public getParkingMapUrl(): string {
    const parking = this.guest()?.parkingLocation?.trim();
    const loc = this.guest()?.invitationLocation || this.guest()?.eventLocation || '';
    if (parking) {
      if (parking.startsWith('http://') || parking.startsWith('https://')) {
        return parking;
      }
      return this.getDirectionsUrl(`${parking} ${loc}`);
    }
    return loc ? `https://www.google.com/maps/search/Parking+${encodeURIComponent(loc)}` : 'https://maps.google.com';
  }

  public getParkingLabel(): string {
    const p = this.guest()?.parkingLocation?.trim();
    if (!p) return 'Accès Parking';
    if (p.startsWith('http://') || p.startsWith('https://')) return 'Accès Parking';
    if (p.length > 20) return 'Accès Parking';
    return p;
  }

  public getDiscoverButtonBgColor(): string {
    return this.getPrimaryColor();
  }

  public getDiscoverButtonTextColor(): string {
    const bg = this.getDiscoverButtonBgColor();
    if (this.isDarkBg(bg)) {
      return '#ffffff';
    }
    return '#0f172a';
  }

  public getSecondaryFontColor(): string {
    if (this.guest()?.secondaryFontColor && this.guest()!.secondaryFontColor!.trim()) {
      return this.guest()!.secondaryFontColor!.trim();
    }
    return this.isDarkBg(this.customBgColor) ? '#f8fafc' : '#1e293b';
  }

  public isDarkBg(color?: string): boolean {
    if (!color) return false;
    if (color.startsWith('#') && color.length >= 7) {
      const r = parseInt(color.substring(1, 3), 16);
      const g = parseInt(color.substring(3, 5), 16);
      const b = parseInt(color.substring(5, 7), 16);
      return (r * 0.299 + g * 0.587 + b * 0.114) < 128;
    }
    return false;
  }

  public isDarkTheme(): boolean {
    const secColor = this.getSecondaryFontColor();
    if (!this.isDarkBg(secColor)) {
      return true;
    }
    if (this.customBgColor && this.isDarkBg(this.customBgColor)) {
      return true;
    }
    return false;
  }

  public getDishCardBg(isSelected: boolean = false): string {
    if (this.isDarkTheme()) {
      return isSelected 
        ? (this.getPrimaryColor() ? (this.getPrimaryColor() + '2e') : 'rgba(212, 175, 55, 0.25)') 
        : 'rgba(0, 0, 0, 0.45)';
    }
    return isSelected 
      ? (this.getPrimaryColor() ? (this.getPrimaryColor() + '18') : 'rgba(212, 175, 55, 0.12)') 
      : '#ffffff';
  }

  public getDishCardBorder(isSelected: boolean = false): string {
    if (isSelected) {
      return this.getPrimaryColor() || '#d4af37';
    }
    if (this.isDarkTheme()) {
      return this.getPrimaryColor() ? (this.getPrimaryColor() + '45') : 'rgba(212, 175, 55, 0.35)';
    }
    return this.getPrimaryColor() ? (this.getPrimaryColor() + '28') : 'rgba(0, 0, 0, 0.12)';
  }

  public getDishTitleColor(isSelected: boolean = false): string {
    if (isSelected) {
      return this.isDarkTheme() ? '#ffffff' : (this.getPrimaryColor() || '#d4af37');
    }
    if (this.isDarkTheme()) {
      return '#ffffff';
    }
    return '#1e293b';
  }

  public getStepperTabBg(isActive: boolean, hasSelection: boolean = false): string {
    if (isActive) {
      return this.getPrimaryColor() || '#d4af37';
    }
    if (this.isDarkTheme()) {
      return hasSelection
        ? (this.getPrimaryColor() ? (this.getPrimaryColor() + '28') : 'rgba(212, 175, 55, 0.22)')
        : 'rgba(0, 0, 0, 0.45)';
    }
    return hasSelection
      ? (this.getPrimaryColor() ? (this.getPrimaryColor() + '18') : 'rgba(212, 175, 55, 0.12)')
      : 'rgba(255, 255, 255, 0.92)';
  }

  public getSummaryCardBg(): string {
    if (this.isDarkTheme()) {
      return 'rgba(14, 16, 22, 0.90)';
    }
    return 'rgba(255, 255, 255, 0.98)';
  }

  public getSummaryCardBorder(): string {
    if (this.isDarkTheme()) {
      return this.getPrimaryColor() ? (this.getPrimaryColor() + '55') : 'rgba(212, 175, 55, 0.45)';
    }
    return this.getPrimaryColor() ? (this.getPrimaryColor() + '35') : 'rgba(0, 0, 0, 0.14)';
  }

  public getSummaryCourseColor(): string {
    if (this.isDarkTheme()) {
      return '#f3d375';
    }
    return this.getPrimaryColor() || '#b45309';
  }

  public getSummaryLabelColor(): string {
    if (this.isDarkTheme()) {
      return 'rgba(255, 255, 255, 0.82)';
    }
    return '#64748b';
  }

  public getSummaryValueColor(): string {
    if (this.isDarkTheme()) {
      return '#ffffff';
    }
    return '#0f172a';
  }

  public getStepperTabTextColor(isActive: boolean): string {
    if (isActive) {
      return this.isDarkBg(this.getPrimaryColor()) ? '#ffffff' : '#0c0c0c';
    }
    if (this.isDarkTheme()) {
      return '#f1f5f9';
    }
    return '#1e293b';
  }

  public getStepperTabBorder(isActive: boolean, hasSelection: boolean = false): string {
    if (isActive) {
      return (this.getPrimaryColor() || '#d4af37') + 'ff';
    }
    if (this.isDarkTheme()) {
      return hasSelection
        ? (this.getPrimaryColor() || '#d4af37') + '99'
        : (this.getPrimaryColor() ? (this.getPrimaryColor() + '55') : 'rgba(212, 175, 55, 0.35)');
    }
    return hasSelection
      ? (this.getPrimaryColor() || '#d4af37') + '80'
      : (this.getPrimaryColor() ? (this.getPrimaryColor() + '45') : 'rgba(0, 0, 0, 0.15)');
  }

  public getMenuMutedTextColor(): string {
    return this.isDarkTheme() ? 'rgba(255, 255, 255, 0.78)' : '#64748b';
  }

  public getMusicWidgetBtnBg(): string {
    if (this.isDarkTheme()) {
      return this.isMusicPlaying()
        ? (this.getPrimaryColor() ? (this.getPrimaryColor() + '38') : 'rgba(212, 175, 55, 0.35)')
        : 'rgba(255, 255, 255, 0.12)';
    }
    return this.isMusicPlaying()
      ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(255, 255, 255, 0.92) 100%)'
      : 'rgba(255, 255, 255, 0.95)';
  }

  public getMusicWidgetBtnColor(): string {
    if (this.isDarkTheme()) {
      return this.getPrimaryColor() || '#d4af37';
    }
    return this.isMusicPlaying()
      ? (this.getPrimaryColor() || '#78350f')
      : '#92400e';
  }

  public getMusicWidgetBtnBorder(): string {
    return this.getPrimaryColor()
      ? (this.getPrimaryColor() + '90')
      : 'rgba(212, 175, 55, 0.6)';
  }

  public getMusicWidgetLabelBg(): string {
    if (this.isDarkTheme()) {
      return 'rgba(255, 255, 255, 0.12)';
    }
    return 'rgba(255, 255, 255, 0.95)';
  }

  public getMusicWidgetLabelTextColor(): string {
    if (this.isDarkTheme()) {
      return this.getSecondaryFontColor() || '#ffffff';
    }
    return '#1e293b';
  }

  public getMusicWidgetLabelBorder(): string {
    return this.getPrimaryColor()
      ? (this.getPrimaryColor() + '75')
      : 'rgba(212, 175, 55, 0.45)';
  }

  public getCountdownBoxBg(): string {
    if (this.isDarkTheme()) {
      return 'rgba(255, 255, 255, 0.12)';
    }
    return 'rgba(255, 255, 255, 0.94)';
  }

  public getCountdownNumColor(): string {
    if (this.isDarkTheme()) {
      return this.getSecondaryFontColor() || '#ffffff';
    }
    return '#1e293b';
  }

  public getCountdownLblColor(): string {
    if (this.isDarkTheme()) {
      return 'rgba(255, 255, 255, 0.72)';
    }
    return '#64748b';
  }

  public getCountdownBoxBorder(): string {
    return this.getPrimaryColor()
      ? (this.getPrimaryColor() + '40')
      : 'rgba(212, 175, 55, 0.35)';
  }

  protected getStep1PreviewImage(): string {
    const items = this.carouselItems();
    if (items.length > 1) return items[1]?.image || items[0]?.image;
    return '/assets/images/menu_main.png';
  }

  protected getStep1PreviewCategory(): string {
    const items = this.carouselItems();
    if (items.length > 1) return items[1]?.categoryLabel || 'Plat Principal';
    return 'Plat Principal';
  }

  protected getStep1PreviewName(): string {
    if (this.mealChoice) return this.mealChoice;
    const items = this.carouselItems();
    if (items.length > 1) return items[1]?.name || 'Plat Signature';
    return 'Plat Signature';
  }

  protected getStep2PreviewImage(): string {
    const items = this.carouselItems();
    if (items.length > 2) return items[2]?.image || items[0]?.image;
    return '/assets/images/menu_dessert.png';
  }

  protected getStep2PreviewName(): string {
    const items = this.carouselItems();
    if (items.length > 2) return items[2]?.name || 'Mille-feuille & Douceurs';
    return 'Mille-feuille & Douceurs';
  }

  // Categorized menu items
  protected readonly starters = signal<any[]>([]);
  protected readonly mainDishes = signal<any[]>([]);
  protected readonly desserts = signal<any[]>([]);
  protected readonly beverages = signal<any[]>([]);

  // Form states
  protected readonly status = signal<string>('PENDING'); // CONFIRMED, DECLINED, PENDING

  // Explicit boolean visibility state requested by user
  public attendanceStatus: boolean | null = null;

  // Specific category selections for PLATS_FIXES (Regular properties for ngModel)
  public starterChoice = '';
  public mealChoice = '';
  public dessertChoice = '';
  public beverageChoice = '';
  public hasConfirmedMenuChoice = signal<boolean>(false);

  // Dietary options (comprehensive list as regular properties)
  public hasVegetarien = false;
  public hasVegan = false;
  public hasGlutenFree = false;
  public hasLactoseFree = false;
  public hasArachidesFree = false;
  public hasHalal = false;
  public hasFruitsDeMerFree = false;
  public hasSucreFree = false;

  public otherAllergies = '';
  public hasDietsChoice: boolean | null = null;

  // 300ms 1-Click visual feedback & auto-advance state
  public readonly selectedItemTransition = signal<{ category: string; dishName: string } | null>(null);
  public readonly isAdvancing = signal<boolean>(false);
  private advanceTimeout: any = null;

  public isDishSelected(category: string, dishName: string): boolean {
    if (this.selectedItemTransition()?.category === category && this.selectedItemTransition()?.dishName === dishName) {
      return true;
    }
    if (category === 'STARTER') return this.starterChoice === dishName;
    if (category === 'MAIN') return this.mealChoice === dishName;
    if (category === 'DESSERT') return this.dessertChoice === dishName;
    if (category === 'BEVERAGE') return this.beverageChoice === dishName;
    return false;
  }

  public selectCourseAndAdvance(category: 'STARTER' | 'MAIN' | 'DESSERT' | 'BEVERAGE', dishName: string): void {
    if (this.isDiscoveryMode()) {
      // In discovery/catalog preview mode: purely informative, no auto-advance or definitive choice registration
      return;
    }

    if (this.isAdvancing()) return;

    if (category === 'STARTER') {
      this.starterChoice = dishName;
    } else if (category === 'MAIN') {
      this.mealChoice = dishName;
    } else if (category === 'DESSERT') {
      this.dessertChoice = dishName;
    } else if (category === 'BEVERAGE') {
      this.beverageChoice = dishName;
    }

    // Clean dish name without prefix
    this.recordMenuStep(category, dishName);
    this.hasConfirmedMenuChoice.set(true);
    this.selectedItemTransition.set({ category, dishName });
    this.isAdvancing.set(true);
    this.saveCurrentRsvpProgress();

    if (this.advanceTimeout) {
      clearTimeout(this.advanceTimeout);
    }

    this.advanceTimeout = setTimeout(() => {
      this.selectedItemTransition.set(null);
      this.isAdvancing.set(false);
      this.goToNextStep();
    }, 300);
  }

  public setDiscoveryCategory(stepIndex: number): void {
    if (stepIndex >= 0 && stepIndex <= 3) {
      this.currentRsvpStep.set(stepIndex);
      this.saveCurrentRsvpProgress();
    }
  }

  public autoSelectSingleChoices(): void {
    if (!this.isPlatedMode()) return;
    if (this.availableStarters().length === 1 && !this.starterChoice) {
      this.starterChoice = this.availableStarters()[0].name;
    }
    if (this.availableMains().length === 1 && !this.mealChoice) {
      this.mealChoice = this.availableMains()[0].name;
    }
    if (this.availableDesserts().length === 1 && !this.dessertChoice) {
      this.dessertChoice = this.availableDesserts()[0].name;
    }
    if (this.availableBeverages().length === 1 && !this.beverageChoice) {
      this.beverageChoice = this.availableBeverages()[0].name;
    }
  }

  public skipCurrentCourse(): void {
    if (this.isAdvancing() || this.isDiscoveryMode()) return;

    const step = this.currentRsvpStep();
    if (step === 0) {
      if (this.isPlatedMode() && this.availableStarters().length > 0) {
        return;
      }
      this.starterChoice = '';
    } else if (step === 1) {
      // Plat principal / Plat chaud is mandatory in MIX and PLATS_FIXES
      if ((this.isMixMode() || this.isPlatedMode()) && this.availableMains().length > 0) {
        return;
      }
      this.mealChoice = '';
    } else if (step === 2) {
      if (this.isPlatedMode() && this.availableDesserts().length > 0) {
        return;
      }
      this.dessertChoice = '';
    } else if (step === 3) {
      this.beverageChoice = '';
    }

    this.saveCurrentRsvpProgress();
    this.goToNextStep();
  }

  public goToStep(stepIndex: number): void {
    if (this.advanceTimeout) {
      clearTimeout(this.advanceTimeout);
    }
    this.selectedItemTransition.set(null);
    this.isAdvancing.set(false);

    // If attempting to jump ahead without selecting mandatory courses in PLATS_FIXES mode
    if (!this.isDiscoveryMode()) {
      if (this.isPlatedMode()) {
        if (stepIndex > 0 && this.availableStarters().length > 0 && !this.starterChoice) {
          this.currentRsvpStep.set(0);
          this.saveCurrentRsvpProgress();
          return;
        }
        if (stepIndex > 1 && this.availableMains().length > 0 && !this.mealChoice) {
          this.currentRsvpStep.set(1);
          this.saveCurrentRsvpProgress();
          return;
        }
        if (stepIndex > 2 && this.availableDesserts().length > 0 && !this.dessertChoice) {
          this.currentRsvpStep.set(2);
          this.saveCurrentRsvpProgress();
          return;
        }
      } else if (this.isMixMode()) {
        if (stepIndex > 1 && this.availableMains().length > 0 && !this.mealChoice) {
          this.currentRsvpStep.set(1);
          this.saveCurrentRsvpProgress();
          return;
        }
      }
    }

    this.currentRsvpStep.set(stepIndex);
    const catMap: ('STARTER' | 'MAIN' | 'DESSERT' | 'BEVERAGE')[] = ['STARTER', 'MAIN', 'DESSERT', 'BEVERAGE'];
    if (catMap[stepIndex]) {
      this.recordMenuStep(catMap[stepIndex]);
    }
    this.saveCurrentRsvpProgress();
  }

  public selectDishFromModal(category: 'STARTER' | 'MAIN' | 'DESSERT' | 'BEVERAGE', dishName: string): void {
    if (category === 'STARTER') {
      this.starterChoice = this.starterChoice === dishName ? '' : dishName;
    } else if (category === 'MAIN') {
      this.mealChoice = this.mealChoice === dishName ? '' : dishName;
    } else if (category === 'DESSERT') {
      this.dessertChoice = this.dessertChoice === dishName ? '' : dishName;
    } else if (category === 'BEVERAGE') {
      this.beverageChoice = this.beverageChoice === dishName ? '' : dishName;
    }
  }

  public confirmMenuModal(): void {
    this.hasConfirmedMenuChoice.set(true);
    this.isFullMenuModalOpen.set(false);
  }

  public resetDietSelections(): void {
    this.hasVegetarien = false;
    this.hasVegan = false;
    this.hasGlutenFree = false;
    this.hasLactoseFree = false;
    this.hasArachidesFree = false;
    this.hasHalal = false;
    this.hasFruitsDeMerFree = false;
    this.hasSucreFree = false;
    this.otherAllergies = '';
  }

  public get eventDayName(): string {
    const dateStr = this.guest()?.invitationDate || this.guest()?.eventDate;
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', { weekday: 'long' });
  }

  public get eventDayNum(): string {
    const dateStr = this.guest()?.invitationDate || this.guest()?.eventDate;
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', { day: 'numeric' });
  }

  public get eventMonth(): string {
    const dateStr = this.guest()?.invitationDate || this.guest()?.eventDate;
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', { month: 'long' });
  }

  public get eventYear(): string {
    const dateStr = this.guest()?.invitationDate || this.guest()?.eventDate;
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', { year: 'numeric' });
  }

  public get eventTime(): string {
    const dateStr = this.guest()?.invitationDate || this.guest()?.eventDate;
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }).replace(':', 'h');
  }

  public get resolvedTemplateId(): string {
    const tId = (this.guest()?.templateId || '').toLowerCase().trim();
    if (tId === 'fleurs-de-coton' || tId === 'wedding-botanical' || tId === 'tahara-emeraude') {
      return 'fleurs-de-coton';
    }
    if (
      tId === 'or-et-velours' ||
      tId === 'corporate-gold' ||
      tId === 'royal-black-gold' ||
      tId === 'fiancailles-royales' ||
      tId.includes('royal') ||
      tId.includes('velours') ||
      tId.includes('mariage')
    ) {
      return 'or-et-velours';
    }
    if (tId === 'luxury-minimal') {
      return 'luxury-minimal';
    }
    if (tId === 'boheme-chic' || tId === 'douceur-pastel') {
      return 'boheme-chic';
    }
    if (
      tId === 'seminaire-imperial' ||
      tId === 'corporate-professional' ||
      tId === 'launch-party' ||
      tId === 'prestige-diplome' ||
      tId === 'lancement-innovation' ||
      tId === 'gala-reveillon' ||
      tId === 'gala-bienfaisance'
    ) {
      return 'corporate-professional';
    }

    const cat = (this.guest()?.templateCategory || '').toLowerCase();
    const subCat = (this.guest()?.templateSubCategory || '').toLowerCase();
    const isTraditionalOrWedding =
      subCat.includes('mariage') ||
      subCat.includes('fiançailles') ||
      subCat.includes('fiancailles') ||
      cat.includes('mariage') ||
      cat.includes('tradition') ||
      cat.includes('célébration') ||
      cat.includes('celebration');

    return isTraditionalOrWedding ? 'or-et-velours' : 'corporate-professional';
  }

  public get resolvedDecorativeFrame(): string {
    if (this.guest()?.decorativeFrame) {
      return this.guest()!.decorativeFrame!;
    }
    const theme = this.resolvedTemplateId;
    if (theme === 'fleurs-de-coton' || theme === 'boheme-chic') {
      return 'floral-frame';
    }
    if (theme === 'or-et-velours') {
      return 'gold-border';
    }
    if (theme === 'corporate-professional') {
      return 'geometric-frame';
    }
    if (theme === 'luxury-minimal') {
      return 'minimal-edge';
    }
    return 'none';
  }

  public get customAccentColor(): string {
    return this.guest()?.accentColor || '#d4af37';
  }

  public get customBgColor(): string {
    return this.guest()?.backgroundColor || '#faf6ee';
  }

  public getWrapperBgColor(): string {
    const bg = this.customBgColor;
    if (this.isDarkBg(bg)) {
      return '#080808';
    }
    return '#f4efe6';
  }

  public getCardMobileBgColor(): string {
    const bg = this.customBgColor;
    if (this.isDarkBg(bg)) {
      return 'rgba(10, 10, 15, 0.15)';
    }
    return 'rgba(255, 255, 255, 0.08)';
  }

  public get resolvedBackgroundImage(): string | null {
    return this.guest()?.templateBackgroundImageUrl || null;
  }

  public get resolvedBackgroundImageDesktop(): string | null {
    return this.guest()?.templateBackgroundImageDesktopUrl || this.resolvedBackgroundImage;
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['previewData'] && this.previewMode && this.previewData) {
      this.guest.set(this.previewData);
      this.status.set(this.previewData.guestStatus || 'PENDING');
      this.attendanceStatus = this.previewData.guestStatus !== 'DECLINED';
      this.isInvitationOpened.set(true);

      if (this.previewData.guestStatus === 'DECLINED') {
        this.selectedAttendanceChoice.set('DECLINED');
        this.isSuccess.set(true);
      } else if (this.previewData.guestStatus === 'CONFIRMED') {
        this.selectedAttendanceChoice.set('CONFIRMED');
        this.isSuccess.set(true);
      }
      
      if (this.previewData.menuItems) {
        this.starters.set(this.previewData.menuItems.filter(item => item.category === 'STARTER' || item.category === 'BUFFET_STARTER'));
        this.mainDishes.set(this.previewData.menuItems.filter(item => item.category === 'MAIN' || item.category === 'BUFFET_MAIN'));
        this.beverages.set(this.previewData.menuItems.filter(item => item.category === 'BEVERAGE'));
        this.desserts.set(this.previewData.menuItems.filter(item => item.category === 'DESSERT' || item.category === 'BUFFET_DESSERT'));
      }
      
      this.isLoading.set(false);
    }
  }

  public ngOnInit(): void {
    if (this.previewMode && this.previewData) {
      console.log('Running in Preview Mode', this.previewData);
      this.guest.set(this.previewData);
      this.status.set(this.previewData.guestStatus || 'PENDING');
      this.attendanceStatus = this.previewData.guestStatus !== 'DECLINED';
      this.isInvitationOpened.set(true);

      if (this.previewData.guestStatus === 'DECLINED') {
        this.selectedAttendanceChoice.set('DECLINED');
        this.isSuccess.set(true);
      } else if (this.previewData.guestStatus === 'CONFIRMED') {
        this.selectedAttendanceChoice.set('CONFIRMED');
        this.isSuccess.set(true);
      }
      
      if (this.previewData.menuItems) {
        this.starters.set(this.previewData.menuItems.filter(item => item.category === 'STARTER' || item.category === 'BUFFET_STARTER'));
        this.mainDishes.set(this.previewData.menuItems.filter(item => item.category === 'MAIN' || item.category === 'BUFFET_MAIN'));
        this.beverages.set(this.previewData.menuItems.filter(item => item.category === 'BEVERAGE'));
        this.desserts.set(this.previewData.menuItems.filter(item => item.category === 'DESSERT' || item.category === 'BUFFET_DESSERT'));
      }
      
      this.isLoading.set(false);
      return;
    }

    const guestId = this.route.snapshot.paramMap.get('id');
    if (!guestId) {
      this.errorMessage.set('Lien d\'invitation invalide.');
      this.isLoading.set(false);
      return;
    }

    this.http.get<PublicRsvpDetail>(`/api/public/rsvp/${guestId}`).subscribe({
      next: (data) => {
        console.log('Public RSVP data loaded:', data);
        this.guest.set(data);
        this.status.set(data.guestStatus || 'PENDING');

        const anim = data.openingAnimation;
        const isInteractive = !!anim && ['envelope-wax', 'ribbon-cut', 'curtain-unveil', 'sliding-doors', 'vip-badge'].includes(anim);
        this.isInvitationOpened.set(!isInteractive);

        // Track live progression for organizer
        if (data.guestId) {
          const now = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
          localStorage.setItem(`guest_${data.guestId}_link_clicked_at`, now);

          // Only mark as opened if there is NO interactive animation (direct view), or if already answered previously
          if (!isInteractive || data.guestStatus === 'CONFIRMED' || data.guestStatus === 'DECLINED') {
            localStorage.setItem(`guest_${data.guestId}_opened_at`, now);
          }
          localStorage.setItem(`guest_${data.guestId}_viewed_details_at`, now);
        }


        // Restore previous response state if guest already answered
        if (data.guestStatus === 'DECLINED') {
          this.attendanceStatus = false;
          this.selectedAttendanceChoice.set('DECLINED');
          this.isSuccess.set(true);
        } else if (data.guestStatus === 'CONFIRMED') {
          this.attendanceStatus = true;
          this.selectedAttendanceChoice.set('CONFIRMED');
          this.isSuccess.set(true);
        } else {
          // Initialize attendanceStatus for natural exploration
          this.attendanceStatus = true;
        }

        // Categorize menu items
        if (data.menuItems) {
          this.starters.set(data.menuItems.filter(item => item.category === 'STARTER' || item.category === 'BUFFET_STARTER'));
          this.mainDishes.set(data.menuItems.filter(item => item.category === 'MAIN' || item.category === 'BUFFET_MAIN'));
          this.beverages.set(data.menuItems.filter(item => item.category === 'BEVERAGE'));
          this.desserts.set(data.menuItems.filter(item => item.category === 'DESSERT' || item.category === 'BUFFET_DESSERT'));
        }

        // Parse dietary requirements if any
        if (data.dietaryRequirements) {
          const diets = data.dietaryRequirements.split(',').map(d => d.trim());
          const lowerDiets = diets.map(d => d.toLowerCase());

          if (lowerDiets.includes('végétarien') || lowerDiets.includes('vegetarien')) this.hasVegetarien = true;
          if (lowerDiets.includes('végétalien') || lowerDiets.includes('vegan') || lowerDiets.includes('végétalienne')) this.hasVegan = true;
          if (lowerDiets.includes('sans gluten') || lowerDiets.includes('gluten-free')) this.hasGlutenFree = true;
          if (lowerDiets.includes('sans lactose') || lowerDiets.includes('lactose-free')) this.hasLactoseFree = true;
          if (lowerDiets.includes('sans arachides') || lowerDiets.includes('arachides-free') || lowerDiets.includes('sans arachide')) this.hasArachidesFree = true;
          if (lowerDiets.includes('halal')) this.hasHalal = true;
          if (lowerDiets.includes('sans fruits de mer') || lowerDiets.includes('fruits-de-mer-free')) this.hasFruitsDeMerFree = true;
          if (lowerDiets.includes('sans sucre') || lowerDiets.includes('sucre-free')) this.hasSucreFree = true;

          // Reconstruct selected starters, mains, beverages if present (only if PLATS_FIXES is selected)
          if (this.hasFormat('PLATS_FIXES')) {
            const starterPrefix = diets.find(d => d.startsWith('Entrée: '));
            if (starterPrefix) {
              this.starterChoice = starterPrefix.replace('Entrée: ', '');
            }

            const mealPrefix = diets.find(d => d.startsWith('Plat: '));
            if (mealPrefix) {
              this.mealChoice = mealPrefix.replace('Plat: ', '');
            }

            const dessertPrefix = diets.find(d => d.startsWith('Dessert: '));
            if (dessertPrefix) {
              this.dessertChoice = dessertPrefix.replace('Dessert: ', '');
            }

            const beveragePrefix = diets.find(d => d.startsWith('Boisson: '));
            if (beveragePrefix) {
              this.beverageChoice = beveragePrefix.replace('Boisson: ', '');
            }

            if (this.starterChoice || this.mealChoice || this.dessertChoice || this.beverageChoice) {
              this.hasConfirmedMenuChoice.set(true);
            }
          }

          // Read other customized allergies
          const standard = [
            'végétarien', 'vegetarien', 'végétalien', 'vegan', 'végétalienne',
            'sans gluten', 'gluten-free', 'sans lactose', 'lactose-free',
            'sans arachides', 'sans arachide', 'arachides-free', 'halal',
            'sans fruits de mer', 'fruits-de-mer-free', 'sans sucre', 'sucre-free',
            'entrée: ', 'plat: ', 'dessert: ', 'menu: ', 'boisson: '
          ];
          const remaining = diets.filter(d => !standard.some(s => d.toLowerCase().includes(s)));
          if (remaining.length > 0) {
            this.otherAllergies = remaining.join(', ');
          }
        }

        // Smart Resume Logic:
        // If the guest already opened the envelope or was browsing the menu,
        // bypass seal animation and resume directly into the menu / step where they left off!
        if (data.guestId && data.guestStatus !== 'CONFIRMED' && data.guestStatus !== 'DECLINED') {
          const gid = data.guestId;
          const hasUnsealed = localStorage.getItem(`guest_${gid}_envelope_unsealed`) === 'true' || !!localStorage.getItem(`guest_${gid}_opened_at`);
          const wasRsvpOpen = localStorage.getItem(`guest_${gid}_is_rsvp_open`) === 'true' || localStorage.getItem(`guest_${gid}_menu_viewed`) === 'true';

          if (hasUnsealed) {
            this.isInvitationOpened.set(true);
          }

          // Restore saved course selections from localStorage
          const savedStarter = localStorage.getItem(`guest_${gid}_starterChoice`);
          const savedMeal = localStorage.getItem(`guest_${gid}_mealChoice`);
          const savedDessert = localStorage.getItem(`guest_${gid}_dessertChoice`);
          const savedBeverage = localStorage.getItem(`guest_${gid}_beverageChoice`);
          if (savedStarter && !this.starterChoice) this.starterChoice = savedStarter;
          if (savedMeal && !this.mealChoice) this.mealChoice = savedMeal;
          if (savedDessert && !this.dessertChoice) this.dessertChoice = savedDessert;
          if (savedBeverage && !this.beverageChoice) this.beverageChoice = savedBeverage;

          if (this.starterChoice || this.mealChoice || this.dessertChoice || this.beverageChoice) {
            this.hasConfirmedMenuChoice.set(true);
          }

          // Restore saved allergies from localStorage if available
          const rawLocalAllergies = localStorage.getItem(`guest_${gid}_allergies`);
          if (rawLocalAllergies) {
            try {
              const localAllergiesList: string[] = JSON.parse(rawLocalAllergies);
              localAllergiesList.forEach(item => {
                const lower = item.toLowerCase();
                if (lower.includes('végétarien') || lower.includes('vegetarien')) this.hasVegetarien = true;
                if (lower.includes('végétalien') || lower.includes('vegan') || lower.includes('végétalienne')) this.hasVegan = true;
                if (lower.includes('gluten')) this.hasGlutenFree = true;
                if (lower.includes('lactose')) this.hasLactoseFree = true;
                if (lower.includes('arachide')) this.hasArachidesFree = true;
                if (lower.includes('halal')) this.hasHalal = true;
                if (lower.includes('fruits de mer') || lower.includes('mer')) this.hasFruitsDeMerFree = true;
                if (lower.includes('sucre')) this.hasSucreFree = true;
              });
            } catch (e) {}
          }

          // Directly resume into the RSVP workflow if they were in the middle of it
          if (wasRsvpOpen) {
            this.attendanceStatus = true;
            this.status.set('CONFIRMED');
            this.selectedAttendanceChoice.set('CONFIRMED');
            this.isMenuRsvpOpen.set(true);

            const savedStepStr = localStorage.getItem(`guest_${gid}_last_rsvp_step`);
            if (savedStepStr !== null) {
              const savedStep = parseInt(savedStepStr, 10);
              if (!isNaN(savedStep) && savedStep >= 0 && savedStep <= 5) {
                this.currentRsvpStep.set(savedStep);
              }
            }
          }

          // Check query param for explicit step resume from Organizer Reminder Link:
          const stepQuery = this.route.snapshot.queryParamMap.get('step');
          if (stepQuery && data.guestStatus !== 'CONFIRMED' && data.guestStatus !== 'DECLINED') {
            if (stepQuery !== 'envelope') {
              this.isInvitationOpened.set(true);
            }
            if (stepQuery === 'menu') {
              this.attendanceStatus = true;
              this.status.set('CONFIRMED');
              this.selectedAttendanceChoice.set('CONFIRMED');
              this.isMenuRsvpOpen.set(true);
              this.currentRsvpStep.set(0);
            } else if (stepQuery === 'dietary') {
              this.attendanceStatus = true;
              this.status.set('CONFIRMED');
              this.selectedAttendanceChoice.set('CONFIRMED');
              this.isMenuRsvpOpen.set(true);
              this.currentRsvpStep.set(this.isPlatedMode() ? 3 : 2);
            } else if (stepQuery === 'rsvp') {
              this.attendanceStatus = true;
              this.status.set('CONFIRMED');
              this.selectedAttendanceChoice.set('CONFIRMED');
              this.isMenuRsvpOpen.set(true);
              this.currentRsvpStep.set(this.isPlatedMode() ? 4 : 3);
            }
          }
        }

        // Auto-select single choices if only 1 item is available in a category
        this.autoSelectSingleChoices();

        this.isLoading.set(false);
      },
      error: (err) => {
        console.error(err);
        const msg = err.error?.message || (typeof err.error === 'string' ? err.error : 'Lien d\'invitation expiré ou invalide.');
        this.errorMessage.set(msg);
        this.isLoading.set(false);
      }
    });
  }

  public goToNextStep(): void {
    const mode = this.cateringMode();
    const step = this.currentRsvpStep();

    // Guard: Step 0 requires an Entrée choice in PLATS_FIXES if starters exist
    if (step === 0 && this.isPlatedMode() && this.availableStarters().length > 0 && !this.starterChoice) {
      return;
    }

    // Guard: Step 1 requires a Main dish choice in MIX and PLATS_FIXES
    if (step === 1 && (mode === 'MIX' || mode === 'PLATS_FIXES') && this.availableMains().length > 0 && !this.mealChoice) {
      return;
    }

    // Guard: Step 2 requires a Dessert choice in PLATS_FIXES if desserts exist
    if (step === 2 && this.isPlatedMode() && this.availableDesserts().length > 0 && !this.dessertChoice) {
      return;
    }

    if (step === 4 || this.hasAnyDietOrAllergySelected()) {
      this.syncDietaryToStorage();
    }

    if (mode === 'BUFFET') {
      if (step === 0) {
        this.currentRsvpStep.set(4);
      } else if (step === 4) {
        this.currentRsvpStep.set(5);
      }
      this.saveCurrentRsvpProgress();
      return;
    }

    if (mode === 'MIX') {
      if (step === 0) {
        this.currentRsvpStep.set(1);
      } else if (step === 1) {
        this.currentRsvpStep.set(2);
      } else if (step === 2) {
        this.currentRsvpStep.set(4);
      } else if (step === 4) {
        this.currentRsvpStep.set(5);
      }
      this.saveCurrentRsvpProgress();
      return;
    }

    // Standard PLATS_FIXES: 0 -> 1 -> 2 -> 3 -> 4 -> 5
    if (step < 5) {
      this.currentRsvpStep.set(step + 1);
    }
    this.saveCurrentRsvpProgress();
  }

  public goToPrevStep(): void {
    if (this.advanceTimeout) {
      clearTimeout(this.advanceTimeout);
    }
    this.selectedItemTransition.set(null);
    this.isAdvancing.set(false);

    if (this.isDiscoveryMode()) {
      // Mode Aperçu (Preview) : Le clic sur Retour redirige immédiatement vers la page de démarrage (Page 1)
      this.closeMenuAndRsvp();
      return;
    }

    const mode = this.cateringMode();
    const step = this.currentRsvpStep();

    if (mode === 'BUFFET') {
      if (step === 5) {
        this.currentRsvpStep.set(4);
      } else if (step === 4) {
        this.currentRsvpStep.set(0);
      } else {
        this.closeMenuAndRsvp();
      }
      this.saveCurrentRsvpProgress();
      return;
    }

    if (mode === 'MIX') {
      if (step === 5) {
        this.currentRsvpStep.set(4);
      } else if (step === 4) {
        this.currentRsvpStep.set(2);
      } else if (step === 2) {
        this.currentRsvpStep.set(1);
      } else if (step === 1) {
        this.currentRsvpStep.set(0);
      } else {
        this.closeMenuAndRsvp();
      }
      this.saveCurrentRsvpProgress();
      return;
    }

    // Standard PLATS_FIXES
    if (step === 5) {
      this.currentRsvpStep.set(4);
    } else if (step === 4) {
      this.currentRsvpStep.set(3);
    } else if (step > 0) {
      this.currentRsvpStep.set(step - 1);
    } else {
      this.closeMenuAndRsvp();
    }
    this.saveCurrentRsvpProgress();
  }

  public handleTopNavPrev(): void {
    this.goToPrevStep();
  }

  protected readonly selectedAttendanceChoice = signal<'CONFIRMED' | 'DECLINED' | null>(null);

  protected selectAttendanceChoice(choice: 'CONFIRMED' | 'DECLINED'): void {
    this.selectedAttendanceChoice.set(choice);
  }

  public syncDietaryToStorage(): void {
    const gid = this.guest()?.guestId;
    if (!gid) return;
    const list = this.getSelectedDietaryList();
    localStorage.setItem(`guest_${gid}_allergies`, JSON.stringify(list));
    localStorage.setItem(`guest_${gid}_menu_viewed`, 'true');
  }

  public getSelectedDietaryList(): string[] {
    const list: string[] = [];
    if (this.hasVegetarien) list.push('Végétarien');
    if (this.hasVegan) list.push('Vegan');
    if (this.hasGlutenFree) list.push('Sans gluten');
    if (this.hasLactoseFree) list.push('Sans lactose');
    if (this.hasHalal) list.push('Halal');
    if (this.hasFruitsDeMerFree) list.push('Sans fruits de mer');
    if (this.hasSucreFree) list.push('Sans sucre');
    if (this.hasArachidesFree) list.push('Sans arachides');
    if (this.otherAllergies && this.otherAllergies.trim().length > 0) {
      list.push(this.otherAllergies.trim());
    }
    return list;
  }

  public hasAnyDietOrAllergySelected(): boolean {
    return !!(
      this.hasVegetarien ||
      this.hasVegan ||
      this.hasGlutenFree ||
      this.hasLactoseFree ||
      this.hasArachidesFree ||
      this.hasHalal ||
      this.hasFruitsDeMerFree ||
      this.hasSucreFree ||
      (this.otherAllergies && this.otherAllergies.trim().length > 0)
    );
  }

  public onDietaryKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.syncDietaryToStorage();
      this.goToNextStep();
    }
  }

  protected onDishesScroll(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target) return;
    const parent = target.parentElement;
    if (!parent) return;
    const thumb = parent.querySelector('.luxury-gold-scrollbar-thumb') as HTMLElement;
    if (!thumb) return;
    const maxScroll = target.scrollHeight - target.clientHeight;
    if (maxScroll <= 0) return;
    const progress = Math.min(1, Math.max(0, target.scrollTop / maxScroll));
    const track = thumb.parentElement as HTMLElement;
    const availableTravel = track.clientHeight - thumb.clientHeight;
    thumb.style.transform = `translateY(${progress * availableTravel}px)`;
  }

  protected onRailPointerDown(event: PointerEvent, container: HTMLElement): void {
    const rail = event.currentTarget as HTMLElement;
    try {
      rail.setPointerCapture(event.pointerId);
    } catch (_) {}
    this.handleRailPointer(event, rail, container);
  }

  protected onRailPointerMove(event: PointerEvent, container: HTMLElement): void {
    const rail = event.currentTarget as HTMLElement;
    if (rail.hasPointerCapture && rail.hasPointerCapture(event.pointerId)) {
      this.handleRailPointer(event, rail, container);
    }
  }

  protected onRailPointerUp(event: PointerEvent): void {
    const rail = event.currentTarget as HTMLElement;
    try {
      if (rail.hasPointerCapture && rail.hasPointerCapture(event.pointerId)) {
        rail.releasePointerCapture(event.pointerId);
      }
    } catch (_) {}
  }

  private handleRailPointer(event: PointerEvent, rail: HTMLElement, container: HTMLElement): void {
    const rect = rail.getBoundingClientRect();
    const clickY = event.clientY - rect.top;
    const ratio = Math.min(1, Math.max(0, clickY / rect.height));
    const maxScroll = container.scrollHeight - container.clientHeight;
    if (maxScroll > 0) {
      container.scrollTop = ratio * maxScroll;
    }
  }

  protected onRailClick(event: MouseEvent, container: HTMLElement): void {
    const rail = event.currentTarget as HTMLElement;
    const rect = rail.getBoundingClientRect();
    const clickY = event.clientY - rect.top;
    const ratio = Math.min(1, Math.max(0, clickY / rect.height));
    const maxScroll = container.scrollHeight - container.clientHeight;
    if (maxScroll > 0) {
      container.scrollTo({ top: ratio * maxScroll, behavior: 'smooth' });
    }
  }

  protected confirmRsvpSubmission(): void {
    const choice = this.selectedAttendanceChoice() || 'CONFIRMED';
    this.status.set(choice);
    this.attendanceStatus = (choice === 'CONFIRMED');

    // In PLATS_FIXES / MIX mode, ensure all required courses are chosen
    if (this.attendanceStatus) {
      if (this.isPlatedMode()) {
        if (this.availableStarters().length > 0 && !this.starterChoice) {
          this.currentRsvpStep.set(0);
          return;
        }
        if (this.availableMains().length > 0 && !this.mealChoice) {
          this.currentRsvpStep.set(1);
          return;
        }
        if (this.availableDesserts().length > 0 && !this.dessertChoice) {
          this.currentRsvpStep.set(2);
          return;
        }
      } else if (this.isMixMode()) {
        if (this.availableMains().length > 0 && !this.mealChoice) {
          this.currentRsvpStep.set(1);
          return;
        }
      }
    }

    const currentGuest = this.guest();
    if (choice === 'CONFIRMED' && currentGuest?.isPaidEvent && currentGuest?.paymentStatus !== 'PAID') {
      // Save preferences first, then open payment modal
      this.submitResponse(false);
      this.isPaymentModalOpen.set(true);
    } else {
      this.submitResponse(true);
    }
  }

  public getSelectedDietsSummary(): string {
    const list: string[] = [];
    if (this.hasVegetarien) list.push('Végétarien');
    if (this.hasVegan) list.push('Vegan');
    if (this.hasGlutenFree) list.push('Sans gluten');
    if (this.hasLactoseFree) list.push('Sans lactose');
    if (this.hasArachidesFree) list.push('Sans arachides');
    if (this.hasHalal) list.push('Halal');
    if (this.hasFruitsDeMerFree) list.push('Sans fruits de mer');
    if (this.hasSucreFree) list.push('Sans sucre');
    if (this.otherAllergies.trim()) list.push(this.otherAllergies.trim());

    return list.length > 0 ? list.join(', ') : 'Aucune restriction ou allergie';
  }

  public getSelectedDietsArray(): string[] {
    const list: string[] = [];
    if (this.hasVegetarien) list.push('Végétarien');
    if (this.hasVegan) list.push('Vegan');
    if (this.hasGlutenFree) list.push('Sans gluten');
    if (this.hasLactoseFree) list.push('Sans lactose');
    if (this.hasArachidesFree) list.push('Sans arachides');
    if (this.hasHalal) list.push('Halal');
    if (this.hasFruitsDeMerFree) list.push('Sans fruits de mer');
    if (this.hasSucreFree) list.push('Sans sucre');
    return list;
  }

  protected submitResponse(markSuccess: boolean = false): void {
    if (this.previewMode) {
      if (markSuccess) {
        this.isSuccess.set(true);
      }
      return;
    }
    const currentGuest = this.guest();
    if (!currentGuest) return;

    this.isSubmitting.set(true);
    this.errorMessage.set('');

    // Reconstruct dietaryRequirements field
    const activeDiets: string[] = [];

    // Add specific dish selections only if CONFIRMED and PLATS_FIXES is selected
    if (this.attendanceStatus === true && (this.hasFormat('PLATS_FIXES') || this.isMix())) {
      if (this.starterChoice && !this.isMix()) {
        activeDiets.push(`Entrée: ${this.starterChoice}`);
      }
      if (this.mealChoice) {
        activeDiets.push(`Plat: ${this.mealChoice}`);
      }
      if (this.dessertChoice && !this.isMix()) {
        activeDiets.push(`Dessert: ${this.dessertChoice}`);
      }
      if (this.beverageChoice && !this.isMix()) {
        activeDiets.push(`Boisson: ${this.beverageChoice}`);
      }
    }

    // Add dietary options only if CONFIRMED
    if (this.attendanceStatus === true) {
      if (this.hasFormat('PLATS_FIXES') || this.hasDietsChoice === true || this.isMix() || this.isBuffet()) {
        if (this.hasVegetarien) activeDiets.push('Végétarien');
        if (this.hasVegan) activeDiets.push('Vegan');
        if (this.hasGlutenFree) activeDiets.push('Sans gluten');
        if (this.hasLactoseFree) activeDiets.push('Sans lactose');
        if (this.hasArachidesFree) activeDiets.push('Sans arachides');
        if (this.hasHalal) activeDiets.push('Halal');
        if (this.hasFruitsDeMerFree) activeDiets.push('Sans fruits de mer');
        if (this.hasSucreFree) activeDiets.push('Sans sucre');

        if (this.otherAllergies.trim()) {
          activeDiets.push(this.otherAllergies.trim());
        }
      }
    } else if (this.status() === 'DECLINED' && this.declineMessage.trim()) {
      activeDiets.push(`Message: ${this.declineMessage.trim()}`);
    }

    const payload = {
      ...currentGuest,
      guestStatus: this.status(),
      dietaryRequirements: activeDiets.join(', ')
    };

    const token = this.route.snapshot.paramMap.get('id');
    this.http.post<PublicRsvpDetail>(`/api/public/rsvp/${token}`, payload).subscribe({
      next: (updated) => {
        this.guest.set(updated);
        if (updated.guestStatus) {
          this.status.set(updated.guestStatus);
        }
        const now = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
        localStorage.setItem(`guest_${currentGuest.guestId}_responded_at`, now);
        this.isSubmitting.set(false);
        if (markSuccess) {
          this.isSuccess.set(true);
        }
      },
      error: (err) => {
        console.error(err);
        this.errorMessage.set('Une erreur est survenue lors de l\'enregistrement de votre réponse.');
        this.isSubmitting.set(false);
      }
    });
  }

  protected openPaymentModal(): void {
    this.isPaymentModalOpen.set(true);
  }

  protected closePaymentModal(): void {
    this.isPaymentModalOpen.set(false);
  }

  protected processPayment(): void {
    const currentGuest = this.guest();
    if (!currentGuest) return;

    if (this.previewMode) {
      this.isProcessingPayment.set(true);
      setTimeout(() => {
        this.guest.set({
          ...currentGuest,
          paymentStatus: 'PAID',
          paidAmount: currentGuest.ticketPrice || 0
        });
        this.isProcessingPayment.set(false);
        this.isPaymentModalOpen.set(false);
        this.isSuccess.set(true);
      }, 500);
      return;
    }

    this.isProcessingPayment.set(true);
    this.errorMessage.set('');

    const payload = {
      amount: currentGuest.ticketPrice || 0,
      paymentMethod: this.paymentMethod(),
      reference: 'PAY-' + this.paymentMethod() + '-' + Date.now()
    };

    const token = this.route.snapshot.paramMap.get('id');
    this.http.post<PublicRsvpDetail>(`/api/public/rsvp/${token}/pay`, payload).subscribe({
      next: (updated) => {
        this.guest.set(updated);
        this.isProcessingPayment.set(false);
        this.isPaymentModalOpen.set(false);
        this.isSuccess.set(true);
      },
      error: (err) => {
        console.error('Erreur de paiement:', err);
        this.errorMessage.set('Une erreur est survenue lors du règlement. Veuillez réessayer.');
        this.isProcessingPayment.set(false);
      }
    });
  }

  protected prevCarouselItem(): void {
    const items = this.carouselItems();
    if (items.length <= 1) return;
    this.activeCarouselIndex.update(idx => (idx === 0 ? items.length - 1 : idx - 1));
  }

  protected nextCarouselItem(): void {
    const items = this.carouselItems();
    if (items.length <= 1) return;
    this.activeCarouselIndex.update(idx => (idx === items.length - 1 ? 0 : idx + 1));
  }

  protected onTouchStart(event: TouchEvent): void {
    this.touchStartX = event.changedTouches[0].screenX;
  }

  protected onTouchEnd(event: TouchEvent): void {
    const touchEndX = event.changedTouches[0].screenX;
    const diff = this.touchStartX - touchEndX;

    if (diff > 50) {
      this.nextCarouselItem();
    } else if (diff < -50) {
      this.prevCarouselItem();
    }
  }

  // ==========================================
  // Background Music Player & Audio Management
  // ==========================================
  protected readonly isMusicPlaying = signal<boolean>(false);
  private audioElement: HTMLAudioElement | null = null;
  private webAudioCtx: any = null;
  private webAudioOscillators: any[] = [];
  private isSynthesizing = false;

  // Calm Moroccan & Arab-Andalusian Oud Wedding Background Track
  private readonly defaultMusicUrl = 'https://cdn.pixabay.com/download/audio/2022/11/06/audio_c3c3933c06.mp3';
  private readonly musicVolume = 0.20; // Volume doux et discret pour une ambiance feutrée et élégante (20%)

  private initAudio(): void {
    const customMusic = this.guest()?.templateMusicUrl;
    const targetUrl = (customMusic && customMusic.trim()) ? customMusic.trim() : this.defaultMusicUrl;

    if (!this.audioElement && typeof Audio !== 'undefined') {
      this.audioElement = new Audio();
      this.audioElement.loop = true;
      this.audioElement.volume = this.musicVolume;

      this.audioElement.addEventListener('ended', () => {
        if (this.isMusicPlaying()) {
          this.audioElement?.play();
        }
      });

      this.audioElement.addEventListener('error', (e) => {
        console.warn('Network audio stream unavailable, switching to Moroccan Andalusian acoustic synthesis.', e);
        if (this.isMusicPlaying()) {
          this.playHarmonicChords();
        }
      });
    }

    if (this.audioElement) {
      this.audioElement.volume = this.musicVolume;
      if (this.audioElement.src !== targetUrl) {
        this.audioElement.src = targetUrl;
        this.audioElement.load();
      }
    }
  }

  protected toggleMusic(): void {
    this.initAudio();

    if (this.isMusicPlaying()) {
      this.stopAllAudio();
      this.isMusicPlaying.set(false);
    } else {
      if (this.audioElement) {
        this.audioElement.volume = this.musicVolume;
        this.audioElement.play()
          .then(() => {
            this.isMusicPlaying.set(true);
          })
          .catch(err => {
            console.warn('Direct audio stream failed, activating Andalusian acoustic synthesis:', err);
            this.playHarmonicChords();
            this.isMusicPlaying.set(true);
          });
      } else {
        this.playHarmonicChords();
        this.isMusicPlaying.set(true);
      }
    }
  }

  private stopAllAudio(): void {
    if (this.audioElement) {
      try {
        this.audioElement.pause();
      } catch (e) { }
    }
    this.stopHarmonicChords();
  }

  private playHarmonicChords(): void {
    try {
      const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      if (!this.webAudioCtx || this.webAudioCtx.state === 'closed') {
        this.webAudioCtx = new AudioContextClass();
      }
      if (this.webAudioCtx.state === 'suspended') {
        this.webAudioCtx.resume();
      }

      this.isSynthesizing = true;
      // Calm Moroccan Andalusian Mode / Maqam Hijaz & Bayati Inspired Chords
      const chords = [
        [146.83, 220.00, 293.66, 369.99], // D - A - D - F# (Calm Andalusian Hijaz root)
        [196.00, 246.94, 293.66, 392.00], // G - B - D - G (Subtle Warmth)
        [220.00, 277.18, 329.63, 440.00], // A - C# - E - A (Traditional Cadence)
        [174.61, 220.00, 261.63, 349.23]  // F - A - C - F (Lyrical Transition)
      ];

      let chordIndex = 0;
      const playNextChord = () => {
        if (!this.isSynthesizing || !this.webAudioCtx) return;
        const currentChord = chords[chordIndex % chords.length];
        chordIndex++;

        const now = this.webAudioCtx.currentTime;
        const duration = 4.5;

        currentChord.forEach(freq => {
          const osc = this.webAudioCtx.createOscillator();
          const gain = this.webAudioCtx.createGain();

          // Triangle + Sine blending for acoustic string / oud warmth
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now);

          gain.gain.setValueAtTime(0.0005, now);
          gain.gain.linearRampToValueAtTime(0.012, now + 0.8);
          gain.gain.exponentialRampToValueAtTime(0.00005, now + duration);

          osc.connect(gain);
          gain.connect(this.webAudioCtx.destination);

          osc.start(now);
          osc.stop(now + duration);
          this.webAudioOscillators.push(osc);
        });

        if (this.isSynthesizing) {
          setTimeout(() => playNextChord(), 3800);
        }
      };

      playNextChord();
    } catch (e) {
      console.warn('WebAudio harmonic generator error:', e);
    }
  }

  private stopHarmonicChords(): void {
    this.isSynthesizing = false;
    this.webAudioOscillators.forEach(osc => {
      try { osc.stop(); } catch (e) { }
    });
    this.webAudioOscillators = [];
    if (this.webAudioCtx && this.webAudioCtx.state === 'running') {
      try { this.webAudioCtx.suspend(); } catch (e) { }
    }
  }

  ngOnDestroy(): void {
    if (this.advanceTimeout) {
      clearTimeout(this.advanceTimeout);
    }
    this.stopAllAudio();
  }

  public getGoogleCalendarUrl(): string {
    const title = encodeURIComponent(this.guest()?.invitationTitle || this.guest()?.eventTitle || 'Invitation Événement');
    const location = encodeURIComponent(this.guest()?.eventLocation || this.guest()?.invitationLocation || '');
    const details = encodeURIComponent(this.guest()?.invitationSubtitle || 'Confirmation de présence');
    let datesParam = '';
    const dateStr = this.guest()?.invitationDate || this.guest()?.eventDate;
    if (dateStr) {
      try {
        const d = new Date(dateStr);
        const start = d.toISOString().replace(/-|:|\.\d\d\d/g, '');
        const endD = new Date(d.getTime() + 4 * 3600 * 1000);
        const end = endD.toISOString().replace(/-|:|\.\d\d\d/g, '');
        datesParam = `&dates=${start}/${end}`;
      } catch (e) {}
    }
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}${datesParam}`;
  }

  public getCountdownDays(): number {
    const dateStr = this.guest()?.invitationDate || this.guest()?.eventDate;
    if (!dateStr) return 0;
    const diff = new Date(dateStr).getTime() - Date.now();
    return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
  }

  public getCountdownHours(): number {
    const dateStr = this.guest()?.invitationDate || this.guest()?.eventDate;
    if (!dateStr) return 0;
    const diff = new Date(dateStr).getTime() - Date.now();
    return Math.max(0, Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)));
  }

  public getCountdownMinutes(): number {
    const dateStr = this.guest()?.invitationDate || this.guest()?.eventDate;
    if (!dateStr) return 0;
    const diff = new Date(dateStr).getTime() - Date.now();
    return Math.max(0, Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)));
  }
}
