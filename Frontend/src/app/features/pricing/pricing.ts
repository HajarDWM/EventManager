import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CatererService } from '../../core/services/caterer.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-pricing',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pricing.html'
})
export class Pricing implements OnInit {
  private readonly catererService = inject(CatererService);
  private readonly router = inject(Router);
  private readonly http = inject(HttpClient);

  protected readonly currentPlan = signal('FREE');
  protected readonly isLoading = signal(false);
  protected readonly successMessage = signal('');
  protected readonly errorMessage = signal('');

  // Payment simulation state
  protected readonly showPaymentModal = signal(false);
  protected readonly selectedPlan = signal('');
  protected readonly selectedPlanLabel = signal('');
  protected readonly selectedPlanPrice = signal(0);
  protected readonly isProcessingPayment = signal(false);

  // Profile data for Webhook simulation
  private catererId: number | undefined = undefined;

  public ngOnInit(): void {
    this.loadProfile();
  }

  private loadProfile(): void {
    this.catererService.getCurrentProfile().subscribe({
      next: (profile) => {
        this.currentPlan.set(profile.subscriptionPlan || 'FREE');
        this.catererId = profile.id;
      },
      error: (err) => console.error(err)
    });
  }

  protected selectPlan(plan: string): void {
    if (plan === this.currentPlan()) {
      return;
    }

    if (plan === 'FREE') {
      // Direct downgrade simulation (no payment needed)
      this.isLoading.set(true);
      this.http.put<any>(`/api/caterers/subscription?plan=FREE`, {}).subscribe({
        next: () => {
          this.isLoading.set(false);
          this.successMessage.set('Votre forfait a été modifié vers Gratuit.');
          this.currentPlan.set('FREE');
          setTimeout(() => this.router.navigate(['/events']), 2000);
        },
        error: (err) => {
          this.isLoading.set(false);
          this.errorMessage.set('Erreur lors du changement de forfait.');
        }
      });
      return;
    }

    // Set billing details for selected plan
    this.selectedPlan.set(plan);
    if (plan === 'STANDARD') {
      this.selectedPlanLabel.set('Pack Standard Pro');
      this.selectedPlanPrice.set(29.90);
    } else if (plan === 'PREMIUM') {
      this.selectedPlanLabel.set('Pack Premium VIP');
      this.selectedPlanPrice.set(59.90);
    }

    this.isLoading.set(true);
    // 1. Call checkout API to prepare simulation session
    this.http.post<any>(`/api/subscriptions/checkout?plan=${plan}`, {}).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        // Open simulated payment modal
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

    // 2. Simulate Stripe Webhook POST call to /api/webhooks/stripe
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
        
        // Refresh profile & redirect
        this.catererService.getCurrentProfile().subscribe({
          next: (profile) => {
            this.successMessage.set(`Félicitations ! Votre paiement a été confirmé par Stripe. Votre compte est maintenant activé sous le ${this.selectedPlanLabel()} avec accès immédiat.`);
            this.currentPlan.set(this.selectedPlan());
            setTimeout(() => {
              this.router.navigate(['/events']);
            }, 3500);
          }
        });
      },
      error: (err) => {
        this.isProcessingPayment.set(false);
        this.errorMessage.set('La validation du paiement a échoué. Veuillez réessayer.');
        console.error(err);
      }
    });
  }
}
