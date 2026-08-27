import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CatererService } from '../../core/services/caterer.service';
import { CurrencyService } from '../../core/services/currency.service';
import { EventService } from '../events/services/event.service';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-subscription',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './subscription.html'
})
export class SubscriptionComponent implements OnInit {
  private readonly catererService = inject(CatererService);
  protected readonly currencyService = inject(CurrencyService);
  private readonly eventService = inject(EventService);
  private readonly router = inject(Router);
  private readonly http = inject(HttpClient);

  protected readonly currentPlan = signal('FREE');
  protected readonly subscriptionStatus = signal('INACTIF');
  protected readonly subscriptionEndDate = signal<string | null>(null);
  protected readonly isSubscriptionExpired = signal<boolean>(false);
  protected readonly inGracePeriod = signal<boolean>(false);
  protected readonly gracePeriodDaysRemaining = signal<number>(0);
  protected readonly isLoading = signal(false);
  protected readonly successMessage = signal('');
  protected readonly errorMessage = signal('');

  // Dynamic Currency & Pricing via CurrencyService
  protected readonly currencySymbol = computed(() => this.currencyService.activeSymbol());
  protected readonly standardPrice = computed(() => this.currencyService.activePrices().standard);
  protected readonly premiumPrice = computed(() => this.currencyService.activePrices().premium);

  // Usage statistics
  protected readonly eventsUsed = signal(0);
  protected readonly eventsLimit = signal(2);
  protected readonly usagePercentage = signal(0);

  // Payment simulation state
  protected readonly showPaymentModal = signal(false);
  protected readonly selectedPlan = signal('');
  protected readonly selectedPlanLabel = signal('');
  protected readonly selectedPlanPrice = signal(0);
  protected readonly isProcessingPayment = signal(false);

  private catererId: number | undefined = undefined;

  public ngOnInit(): void {
    this.loadProfileAndStats();
  }

  private loadProfileAndStats(): void {
    this.isLoading.set(true);
    this.catererService.getCurrentProfile().subscribe({
      next: (profile) => {
        this.currentPlan.set(profile.subscriptionPlan || 'FREE');
        this.subscriptionStatus.set(profile.subscriptionStatus || 'INACTIF');
        this.subscriptionEndDate.set(profile.subscriptionEndDate || null);
        this.isSubscriptionExpired.set(!!profile.isExpired || !!profile.expired);
        this.inGracePeriod.set(!!profile.inGracePeriod);
        this.gracePeriodDaysRemaining.set(profile.gracePeriodDaysRemaining || 0);
        this.catererId = profile.id;
        
        const limit = profile.eventLimit || 2;
        const count = profile.eventCount || 0;
        
        this.eventsLimit.set(limit);
        this.eventsUsed.set(count);
        
        const percentage = Math.min(100, Math.round((count / limit) * 100));
        this.usagePercentage.set(percentage);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error fetching profile', err);
        this.isLoading.set(false);
      }
    });
  }

  protected selectPlan(plan: string): void {
    if (plan === this.currentPlan() && plan === 'FREE') {
      return;
    }

    if (plan === 'FREE') {
      this.isLoading.set(true);
      this.http.put<any>(`/api/caterers/subscription?plan=FREE`, {}).subscribe({
        next: () => {
          this.successMessage.set('Votre forfait a été modifié vers Gratuit.');
          this.currentPlan.set('FREE');
          this.loadProfileAndStats();
          setTimeout(() => this.successMessage.set(''), 3000);
        },
        error: (err) => {
          this.isLoading.set(false);
          this.errorMessage.set('Erreur lors du changement de forfait.');
        }
      });
      return;
    }

    this.selectedPlan.set(plan);
    if (plan === 'STANDARD') {
      this.selectedPlanLabel.set('Pack Standard Pro');
      this.selectedPlanPrice.set(this.standardPrice());
    } else if (plan === 'PREMIUM') {
      this.selectedPlanLabel.set('Pack Premium VIP');
      this.selectedPlanPrice.set(this.premiumPrice());
    }

    this.isLoading.set(true);
    this.http.post<any>(`/api/subscriptions/checkout?plan=${plan}`, {}).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        this.showPaymentModal.set(true);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set('Une erreur est survenue lors de l\'initiation de la commande.');
        console.error(err);
      }
    });
  }

  protected confirmPayment(): void {
    this.isProcessingPayment.set(true);
    this.errorMessage.set('');

    const mockStripeEvent = {
      type: 'checkout.session.completed',
      data: {
        object: {
          metadata: {
            catererId: this.catererId?.toString(),
            plan: this.selectedPlan()
          }
        }
      }
    };

    this.http.post<any>('/api/webhooks/stripe', mockStripeEvent).subscribe({
      next: () => {
        this.isProcessingPayment.set(false);
        this.showPaymentModal.set(false);
        
        // Visual indicator transition
        this.currentPlan.set(this.selectedPlan());
        this.successMessage.set(`Félicitations ! Votre forfait a été activé sous le ${this.selectedPlanLabel()} avec accès immédiat. Redirection...`);

        // Load profile stats in background
        this.loadProfileAndStats();

        setTimeout(() => {
          this.router.navigate(['/events/create']);
        }, 1200);
      },
      error: (err) => {
        this.isProcessingPayment.set(false);
        this.errorMessage.set('La validation du paiement a échoué.');
      }
    });
  }

  protected confirmPaymentTest(): void {
    this.isProcessingPayment.set(true);
    this.errorMessage.set('');

    this.http.post<any>(`/api/subscriptions/simulate-payment?plan=${this.selectedPlan()}`, {}).subscribe({
      next: (res) => {
        this.isProcessingPayment.set(false);
        this.showPaymentModal.set(false);
        
        // Visual indicator transition
        this.currentPlan.set(this.selectedPlan());
        this.successMessage.set(`Mode Test : Votre forfait a été activé gratuitement pour le ${this.selectedPlanLabel()}. Redirection...`);

        // Load profile stats in background
        this.loadProfileAndStats();

        setTimeout(() => {
          this.router.navigate(['/events/create']);
        }, 1200);
      },
      error: (err) => {
        this.isProcessingPayment.set(false);
        this.errorMessage.set('Une erreur est survenue lors de l\'activation en Mode Test.');
      }
    });
  }

  protected onCurrencySelect(code: string): void {
    this.currencyService.setManualCurrency(code);
  }
}
