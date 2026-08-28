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

  protected readonly subscriptionHistory = signal<any[]>([]);

  private catererId: number | undefined = undefined;

  public ngOnInit(): void {
    this.loadProfileAndStats();
    this.loadSubscriptionHistory();
  }

  private loadSubscriptionHistory(): void {
    this.http.get<any[]>('/api/subscriptions/my-history').subscribe({
      next: (res) => {
        this.subscriptionHistory.set(res || []);
      },
      error: (err) => {
        console.error('Error loading subscription history', err);
      }
    });
  }

  protected convertTransactionHt(t: any): number {
    return this.currencyService.convertTransactionAmountHt(t);
  }

  protected convertTransactionTtc(t: any): number {
    return this.currencyService.convertTransactionAmountTtc(t);
  }

  protected getSubscriptionStartDate(t: any): Date | null {
    if (t.startDate) return new Date(t.startDate);
    if (t.paymentDate) return new Date(t.paymentDate);
    return null;
  }

  protected getSubscriptionEndDate(t: any): Date | null {
    if (t.endDate) return new Date(t.endDate);
    if (t.paymentDate) {
      const d = new Date(t.paymentDate);
      d.setDate(d.getDate() + 30);
      return d;
    }
    return null;
  }

  protected isSubscriptionActive(t: any): boolean {
    if (t.paymentStatus !== 'SUCCESS') return false;
    const end = this.getSubscriptionEndDate(t);
    if (!end) return false;
    return new Date() <= end;
  }

  protected getSubscriptionStatusBadgeClass(t: any): string {
    if (t.paymentStatus === 'FAILED') return 'bg-danger-light text-danger';
    if (t.paymentStatus === 'PENDING') return 'bg-warning-light text-warning';
    return this.isSubscriptionActive(t) ? 'bg-success-light text-success fw-bold' : 'bg-danger-light text-danger';
  }

  protected getSubscriptionStatusLabel(t: any): string {
    if (t.paymentStatus === 'FAILED') return 'Échec';
    if (t.paymentStatus === 'PENDING') return 'En attente';
    return this.isSubscriptionActive(t) ? 'Actif' : 'Expiré';
  }

  protected getPlanBadgeClass(plan: string): string {
    switch (plan) {
      case 'PREMIUM': return 'bg-success text-white';
      case 'STANDARD': return 'bg-primary text-white';
      case 'FREE':
      default: return 'bg-warning text-dark';
    }
  }

  protected downloadInvoice(t: any): void {
    const win = window.open('', '_blank');
    if (!win) {
      alert('Veuillez autoriser les fenêtres surgissantes (popups) pour télécharger la facture PDF.');
      return;
    }

    const businessName = t.businessName || 'Organisateur';
    const invoiceNum = `FAC-${t.id ? t.id.substring(0, 8).toUpperCase() : 'SUB'}`;
    const dateStr = t.paymentDate ? new Date(t.paymentDate).toLocaleDateString('fr-FR') : new Date().toLocaleDateString('fr-FR');
    const startDateStr = this.getSubscriptionStartDate(t)?.toLocaleDateString('fr-FR') || dateStr;
    const endDateStr = this.getSubscriptionEndDate(t)?.toLocaleDateString('fr-FR') || '';
    const amountHt = this.convertTransactionHt(t).toFixed(2);
    const vatRate = t.vatRate || 20;
    const vatAmount = (parseFloat(amountHt) * (vatRate / 100)).toFixed(2);
    const totalTtc = (parseFloat(amountHt) + parseFloat(vatAmount)).toFixed(2);
    const symbol = this.currencySymbol();

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Facture d'Abonnement - ${invoiceNum}</title>
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; margin: 40px; background: #fff; }
          .invoice-box { max-width: 800px; margin: auto; padding: 30px; border: 1px solid #eee; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.05); }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #0284c7; padding-bottom: 20px; margin-bottom: 30px; }
          .logo { font-size: 24px; font-weight: bold; color: #0284c7; text-transform: uppercase; letter-spacing: 1px; }
          .inv-title { font-size: 20px; font-weight: bold; color: #1e293b; text-align: right; }
          .inv-meta { font-size: 13px; color: #64748b; margin-top: 5px; text-align: right; }
          .billing-info { display: flex; justify-content: space-between; margin-bottom: 30px; font-size: 14px; line-height: 1.6; }
          .info-block { width: 48%; background: #f8fafc; padding: 15px; border-radius: 6px; border-left: 4px solid #0284c7; }
          .info-title { font-weight: bold; color: #1e293b; margin-bottom: 8px; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 30px; font-size: 14px; }
          th { background: #f1f5f9; color: #475569; text-align: left; padding: 12px; font-weight: 600; border-bottom: 2px solid #cbd5e1; }
          td { padding: 12px; border-bottom: 1px solid #e2e8f0; }
          .text-right { text-align: right; }
          .text-center { text-align: center; }
          .totals { width: 300px; margin-left: auto; font-size: 14px; line-height: 1.8; }
          .totals-row { display: flex; justify-content: space-between; padding: 6px 0; }
          .totals-row.final { border-top: 2px solid #0284c7; font-weight: bold; font-size: 16px; color: #0284c7; padding-top: 10px; margin-top: 5px; }
          .footer { text-align: center; margin-top: 50px; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 20px; }
          .status-stamp { display: inline-block; padding: 4px 12px; background: #dcfce7; color: #166534; border-radius: 20px; font-weight: bold; font-size: 12px; }
          @media print {
            body { margin: 0; }
            .invoice-box { border: none; box-shadow: none; padding: 0; }
          }
        </style>
      </head>
      <body>
        <div class="invoice-box">
          <div class="header">
            <div class="logo">EventManager</div>
            <div>
              <div class="inv-title">FACTURE N° ${invoiceNum}</div>
              <div class="inv-meta">Date d'émission : ${dateStr}</div>
            </div>
          </div>

          <div class="billing-info">
            <div class="info-block">
              <div class="info-title">Émetteur</div>
              <strong>EventManager SaaS Inc.</strong><br>
              Service Facturation Clients<br>
              Email : billing@eventmanager.com<br>
              TVA Intracommunautaire : FR893294829
            </div>
            <div class="info-block">
              <div class="info-title">Client / Facturé à</div>
              <strong>${businessName}</strong><br>
              Compte Organisateur N° ORG-${t.catererId || '001'}<br>
              Statut du compte : Approuvé & Vérifié<br>
              Paiement : Réglement en ligne (Stripe)
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Désignation de la prestation</th>
                <th class="text-center">Période de couverture</th>
                <th class="text-center">TVA</th>
                <th class="text-right">Montant HT</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <strong>Abonnement SaaS ${t.subscriptionPlan || 'STANDARD'}</strong><br>
                  <span style="font-size: 12px; color: #64748b;">Accès complet à la plateforme d'organisation d'événements</span>
                </td>
                <td class="text-center">${startDateStr} au ${endDateStr}</td>
                <td class="text-center">${vatRate}%</td>
                <td class="text-right">${amountHt} ${symbol}</td>
              </tr>
            </tbody>
          </table>

          <div class="totals">
            <div class="totals-row">
              <span>Sous-total HT :</span>
              <span>${amountHt} ${symbol}</span>
            </div>
            <div class="totals-row">
              <span>TVA (${vatRate}%) :</span>
              <span>${vatAmount} ${symbol}</span>
            </div>
            <div class="totals-row final">
              <span>Total TTC Payé :</span>
              <span>${totalTtc} ${symbol}</span>
            </div>
            <div style="text-align: right; margin-top: 15px;">
              <span class="status-stamp">✓ ACQUITTÉE / PAYÉE</span>
            </div>
          </div>

          <div class="footer">
            Merci pour votre confiance. Cette facture est générée électroniquement et fait office de reçu officiel.<br>
            EventManager Platform — Tous droits réservés.
          </div>
        </div>
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          };
        </script>
      </body>
      </html>
    `;

    win.document.open();
    win.document.write(htmlContent);
    win.document.close();
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
