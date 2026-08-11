import { Component, OnInit, OnDestroy, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';

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
  digitalTemplateId?: number;
  invitationTitle?: string;
  invitationDate?: string;
  invitationLocation?: string;
  mealType?: string; // BUFFET or PLATS_FIXES
  templateCategory?: string; // Mariage, Corporate, etc.
  templateId?: string;
  templateTitle?: string;
  decorativeFrame?: string; // floral-frame, gold-border, geometric-frame, minimal-edge
  accentColor?: string;
  backgroundColor?: string;
  templateBackgroundImageUrl?: string;
  menuItems?: any[];
}

@Component({
  selector: 'app-guest-rsvp',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './guest-rsvp.html',
  styleUrls: ['./guest-rsvp.scss']
})
export class GuestRsvp implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly http = inject(HttpClient);

  protected readonly guest = signal<PublicRsvpDetail | null>(null);
  protected readonly isLoading = signal(true);
  protected readonly isSubmitting = signal(false);
  protected readonly isSuccess = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly isFullMenuModalOpen = signal(false);
  protected readonly isMenuRsvpOpen = signal(false);
  protected readonly activeCarouselIndex = signal<number>(0);
  private touchStartX = 0;

  protected openMenuAndRsvp(): void {
    this.isMenuRsvpOpen.set(true);
  }

  protected closeMenuAndRsvp(): void {
    this.isMenuRsvpOpen.set(false);
  }

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
        image: img
      };
    });
  });

  // Service configuration
  protected readonly mealType = signal<string>('PLATS_FIXES');

  protected hasFormat(format: string): boolean {
    const current = this.mealType() || '';
    return current.split(',').map(s => s.trim()).includes(format);
  }

  protected readonly isMix = computed(() => this.hasFormat('BUFFET_ENTREES') && this.hasFormat('PLATS_FIXES'));
  protected readonly isBuffet = computed(() => !this.hasFormat('PLATS_FIXES'));
  protected readonly isPlated = computed(() => this.hasFormat('PLATS_FIXES') && !this.hasFormat('BUFFET_ENTREES'));

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
    const tId = this.guest()?.templateId;
    if (tId === 'fleurs-de-coton' || tId === 'wedding-botanical') {
      return 'fleurs-de-coton';
    }
    if (tId === 'or-et-velours' || tId === 'corporate-gold') {
      return 'or-et-velours';
    }
    if (tId === 'seminaire-imperial' || tId === 'corporate-professional' || tId === 'launch-party') {
      return 'corporate-professional';
    }
    if (tId === 'luxury-minimal') {
      return 'luxury-minimal';
    }
    if (tId === 'boheme-chic') {
      return 'boheme-chic';
    }
    return this.guest()?.templateCategory === 'Mariage' ? 'or-et-velours' : 'corporate-professional';
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
    return this.guest()?.backgroundColor || (this.resolvedTemplateId === 'or-et-velours' ? '#0b0b0b' : '#faf6ee');
  }

  public get resolvedBackgroundImage(): string | null {
    return this.guest()?.templateBackgroundImageUrl || null;
  }

  public ngOnInit(): void {
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

        // Initialize attendanceStatus for natural exploration
        this.attendanceStatus = true;

        if (data.mealType) {
          this.mealType.set(data.mealType);
        } else {
          this.mealType.set('PLATS_FIXES');
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

        this.isLoading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.errorMessage.set('Impossible de charger les détails de l\'invitation. Veuillez réessayer plus tard.');
        this.isLoading.set(false);
      }
    });
  }

  protected readonly currentRsvpStep = signal<number>(0);

  protected goToNextStep(): void {
    const step = this.currentRsvpStep();
    if (step < 3) {
      this.currentRsvpStep.set(step + 1);
    }
  }

  protected goToPrevStep(): void {
    const step = this.currentRsvpStep();
    if (step > 0) {
      this.currentRsvpStep.set(step - 1);
    }
  }

  protected readonly selectedAttendanceChoice = signal<'CONFIRMED' | 'DECLINED' | null>(null);

  protected selectAttendanceChoice(choice: 'CONFIRMED' | 'DECLINED'): void {
    this.selectedAttendanceChoice.set(choice);
  }

  protected confirmRsvpSubmission(): void {
    const choice = this.selectedAttendanceChoice();
    if (!choice) return;
    this.status.set(choice);
    this.attendanceStatus = (choice === 'CONFIRMED');
    this.submitResponse();
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

  protected submitResponse(): void {
    const currentGuest = this.guest();
    if (!currentGuest) return;

    this.isSubmitting.set(true);
    this.errorMessage.set('');

    // Reconstruct dietaryRequirements field
    const activeDiets: string[] = [];

    // Add specific dish selections only if CONFIRMED and PLATS_FIXES is selected
    if (this.attendanceStatus === true && this.hasFormat('PLATS_FIXES')) {
      if (this.starterChoice) {
        activeDiets.push(`Entrée: ${this.starterChoice}`);
      }
      if (this.mealChoice) {
        activeDiets.push(`Plat: ${this.mealChoice}`);
      }
      if (this.dessertChoice) {
        activeDiets.push(`Dessert: ${this.dessertChoice}`);
      }
      if (this.beverageChoice) {
        activeDiets.push(`Boisson: ${this.beverageChoice}`);
      }
    }

    // Add dietary options only if CONFIRMED
    if (this.attendanceStatus === true) {
      if (this.hasFormat('PLATS_FIXES') || this.hasDietsChoice === true) {
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
    }

    const payload = {
      ...currentGuest,
      guestStatus: this.status(),
      dietaryRequirements: activeDiets.join(', ')
    };

    this.http.post<PublicRsvpDetail>(`/api/public/rsvp/${currentGuest.guestId}`, payload).subscribe({
      next: (updated) => {
        this.guest.set(updated);
        this.isSubmitting.set(false);
        this.isSuccess.set(true);
      },
      error: (err) => {
        console.error(err);
        this.errorMessage.set('Une erreur est survenue lors de l\'enregistrement de votre réponse.');
        this.isSubmitting.set(false);
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

  // Royalty-free romantic acoustic background track
  private readonly defaultMusicUrl = 'https://cdn.pixabay.com/download/audio/2022/05/16/audio_db6591201e.mp3';

  private initAudio(): void {
    if (!this.audioElement && typeof Audio !== 'undefined') {
      this.audioElement = new Audio();
      this.audioElement.src = this.defaultMusicUrl;
      this.audioElement.loop = true;
      this.audioElement.volume = 0.4;

      this.audioElement.addEventListener('ended', () => {
        if (this.isMusicPlaying()) {
          this.audioElement?.play();
        }
      });

      this.audioElement.addEventListener('error', () => {
        console.warn('Network audio stream unavailable, switching to harmonic ambient chords.');
        if (this.isMusicPlaying()) {
          this.playHarmonicChords();
        }
      });
    }
  }

  protected toggleMusic(): void {
    this.initAudio();

    if (this.isMusicPlaying()) {
      this.stopAllAudio();
      this.isMusicPlaying.set(false);
    } else {
      if (this.audioElement) {
        this.audioElement.play()
          .then(() => {
            this.isMusicPlaying.set(true);
          })
          .catch(err => {
            console.warn('Direct audio stream failed, activating harmonic synthesis:', err);
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
      const chords = [
        [261.63, 329.63, 392.00, 493.88], // Cmaj7
        [220.00, 261.63, 329.63, 392.00], // Amin7
        [174.61, 220.00, 261.63, 329.63], // Fmaj7
        [196.00, 246.94, 293.66, 392.00]  // G6
      ];

      let chordIndex = 0;
      const playNextChord = () => {
        if (!this.isSynthesizing || !this.webAudioCtx) return;
        const currentChord = chords[chordIndex % chords.length];
        chordIndex++;

        const now = this.webAudioCtx.currentTime;
        const duration = 4.0;

        currentChord.forEach(freq => {
          const osc = this.webAudioCtx.createOscillator();
          const gain = this.webAudioCtx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now);

          gain.gain.setValueAtTime(0.001, now);
          gain.gain.linearRampToValueAtTime(0.025, now + 1.2);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

          osc.connect(gain);
          gain.connect(this.webAudioCtx.destination);

          osc.start(now);
          osc.stop(now + duration);
          this.webAudioOscillators.push(osc);
        });

        if (this.isSynthesizing) {
          setTimeout(() => playNextChord(), 3500);
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
    this.stopAllAudio();
  }
}
