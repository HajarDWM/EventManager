import { Component, OnInit, signal, inject } from '@angular/core';
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
  menuItems?: any[];
}

@Component({
  selector: 'app-guest-rsvp',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './guest-rsvp.html',
  styleUrls: ['./guest-rsvp.scss']
})
export class GuestRsvp implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly http = inject(HttpClient);

  protected readonly guest = signal<PublicRsvpDetail | null>(null);
  protected readonly isLoading = signal(true);
  protected readonly isSubmitting = signal(false);
  protected readonly isSuccess = signal(false);
  protected readonly errorMessage = signal('');

  // Service configuration
  protected readonly mealType = signal<string>('PLATS_FIXES');

  protected hasFormat(format: string): boolean {
    const current = this.mealType() || '';
    return current.split(',').map(s => s.trim()).includes(format);
  }

  // Categorized menu items for PLATS_FIXES
  protected readonly starters = signal<any[]>([]);
  protected readonly mainDishes = signal<any[]>([]);
  protected readonly beverages = signal<any[]>([]);

  // Form states
  protected readonly status = signal<string>('PENDING'); // CONFIRMED, DECLINED, PENDING
  
  // Explicit boolean visibility state requested by user
  public attendanceStatus: boolean | null = null;

  // Specific category selections for PLATS_FIXES (Regular properties for ngModel)
  public starterChoice = '';
  public mealChoice = '';
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
    return this.guest()?.templateCategory === 'Mariage' ? 'or-et-velours' : 'corporate-professional';
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
        
        // Initialize attendanceStatus to null on page load
        this.attendanceStatus = null;
        
        if (data.mealType) {
          this.mealType.set(data.mealType);
        } else {
          this.mealType.set('PLATS_FIXES');
        }
        
        // Categorize menu items if PLATS_FIXES is selected
        if (this.hasFormat('PLATS_FIXES') && data.menuItems) {
          this.starters.set(data.menuItems.filter(item => item.category === 'STARTER'));
          this.mainDishes.set(data.menuItems.filter(item => item.category === 'MAIN'));
          this.beverages.set(data.menuItems.filter(item => item.category === 'BEVERAGE'));
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
            'entrée: ', 'plat: ', 'menu: ', 'boisson: '
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

  protected readonly currentRsvpStep = signal<number>(1);

  protected selectStatus(newStatus: string): void {
    this.status.set(newStatus);
    if (newStatus === 'CONFIRMED') {
      this.attendanceStatus = true;
      if (this.hasFormat('PLATS_FIXES')) {
        this.currentRsvpStep.set(2);
      } else {
        this.currentRsvpStep.set(3);
      }
    } else if (newStatus === 'DECLINED') {
      this.attendanceStatus = false;
      this.currentRsvpStep.set(1);
    } else {
      this.attendanceStatus = null;
      this.currentRsvpStep.set(1);
    }
  }

  protected nextStep(): void {
    if (this.currentRsvpStep() === 2) {
      this.currentRsvpStep.set(3);
    }
  }

  protected prevStep(): void {
    if (this.currentRsvpStep() === 3) {
      if (this.hasFormat('PLATS_FIXES')) {
        this.currentRsvpStep.set(2);
      } else {
        this.currentRsvpStep.set(1);
        this.attendanceStatus = null;
        this.status.set('PENDING');
      }
    } else if (this.currentRsvpStep() === 2) {
      this.currentRsvpStep.set(1);
      this.attendanceStatus = null;
      this.status.set('PENDING');
    }
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
}
