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

  // Form states
  protected readonly status = signal<string>('PENDING'); // CONFIRMED, DECLINED
  protected readonly mealChoice = signal<string>(''); // Viande, Poisson, Végétarien
  protected readonly hasVegetarien = signal(false);
  protected readonly hasGlutenFree = signal(false);
  protected readonly hasNutFree = signal(false);
  protected readonly hasLactoseFree = signal(false);
  protected readonly otherAllergies = signal('');

  public ngOnInit(): void {
    const guestId = this.route.snapshot.paramMap.get('id');
    if (!guestId) {
      this.errorMessage.set('Lien d\'invitation invalide.');
      this.isLoading.set(false);
      return;
    }

    this.http.get<PublicRsvpDetail>(`/api/public/rsvp/${guestId}`).subscribe({
      next: (data) => {
        this.guest.set(data);
        this.status.set(data.guestStatus || 'PENDING');
        
        // Parse dietary requirements if any
        if (data.dietaryRequirements) {
          const diets = data.dietaryRequirements.split(',').map(d => d.trim().toLowerCase());
          
          if (diets.includes('végétarien') || diets.includes('vegetarien')) this.hasVegetarien.set(true);
          if (diets.includes('sans gluten') || diets.includes('gluten-free')) this.hasGlutenFree.set(true);
          if (diets.includes('sans noix') || diets.includes('noix') || diets.includes('nut-free')) this.hasNutFree.set(true);
          if (diets.includes('sans lactose') || diets.includes('lactose-free')) this.hasLactoseFree.set(true);
          
          // Check for meal choice in the text
          const choiceViande = diets.find(d => d.includes('menu: viande'));
          const choicePoisson = diets.find(d => d.includes('menu: poisson'));
          const choiceVeg = diets.find(d => d.includes('menu: végétarien') || d.includes('menu: vegetarien'));
          
          if (choiceViande) this.mealChoice.set('Viande');
          else if (choicePoisson) this.mealChoice.set('Poisson');
          else if (choiceVeg) this.mealChoice.set('Végétarien');
          
          // Reconstruct other allergies
          const standard = ['végétarien', 'vegetarien', 'sans gluten', 'gluten-free', 'sans noix', 'noix', 'nut-free', 'sans lactose', 'lactose-free', 'menu: viande', 'menu: poisson', 'menu: végétarien', 'menu: vegetarien'];
          const remaining = diets.filter(d => !standard.some(s => d.includes(s)));
          if (remaining.length > 0) {
            this.otherAllergies.set(remaining.join(', '));
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

  protected selectStatus(newStatus: string): void {
    this.status.set(newStatus);
  }

  protected submitResponse(): void {
    const currentGuest = this.guest();
    if (!currentGuest) return;

    this.isSubmitting.set(true);
    this.errorMessage.set('');

    // Reconstruct dietaryRequirements field
    const activeDiets: string[] = [];
    
    if (this.mealChoice()) {
      activeDiets.push(`Menu: ${this.mealChoice()}`);
    }
    if (this.hasVegetarien()) activeDiets.push('Végétarien');
    if (this.hasGlutenFree()) activeDiets.push('Sans gluten');
    if (this.hasNutFree()) activeDiets.push('Sans noix');
    if (this.hasLactoseFree()) activeDiets.push('Sans lactose');
    
    if (this.otherAllergies().trim()) {
      activeDiets.push(this.otherAllergies().trim());
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
        this.errorMessage.set('Une erreur est survenue lors de l\'enregistrement. Veuillez réessayer.');
        this.isSubmitting.set(false);
      }
    });
  }
}
