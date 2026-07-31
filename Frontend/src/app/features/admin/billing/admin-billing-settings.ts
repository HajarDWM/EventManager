import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService, BillingSettings } from '../../../core/services/admin.service';

@Component({
  selector: 'app-admin-billing-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-billing-settings.html'
})
export class AdminBillingSettings implements OnInit {
  private readonly adminService = inject(AdminService);

  // States
  protected readonly isLoading = signal(true);
  protected readonly isSaving = signal(false);
  protected readonly successMessage = signal('');
  protected readonly errorMessage = signal('');

  // Form Fields
  protected vatRate = signal(20.0);
  protected currency = signal('EUR');
  protected subscriptionPriceStandard = signal(29.90);
  protected subscriptionPricePremium = signal(59.90);
  protected billingContactEmail = signal('billing@eventmanager.com');

  // Preview States & Computeds
  protected readonly previewPlan = signal<'standard' | 'premium'>('standard');

  protected readonly previewPlanPrice = computed(() => {
    return this.previewPlan() === 'standard'
      ? this.subscriptionPriceStandard()
      : this.subscriptionPricePremium();
  });

  protected readonly previewVatAmount = computed(() => {
    return (this.previewPlanPrice() * this.vatRate()) / 100;
  });

  protected readonly previewTotalAmount = computed(() => {
    return this.previewPlanPrice() + this.previewVatAmount();
  });

  protected readonly currencySymbol = computed(() => {
    const curr = this.currency();
    switch (curr) {
      case 'EUR': return '€';
      case 'USD': return '$';
      case 'GBP': return '£';
      case 'CAD': return '$';
      case 'MAD': return 'DH';
      case 'CHF': return 'CHF';
      default: return curr;
    }
  });

  protected formatPrice(value: number): string {
    const symbol = this.currencySymbol();
    const formattedVal = value.toFixed(2);
    
    if (this.currency() === 'MAD') {
      return `${formattedVal} DH`;
    } else if (this.currency() === 'CAD' || this.currency() === 'USD') {
      return `${formattedVal} $`;
    } else if (this.currency() === 'GBP') {
      return `£${formattedVal}`;
    } else if (this.currency() === 'EUR') {
      return `${formattedVal} €`;
    } else {
      return `${formattedVal} ${symbol}`;
    }
  }

  public ngOnInit(): void {
    this.loadBillingSettings();
  }

  protected loadBillingSettings(): void {
    this.isLoading.set(true);
    this.adminService.getBillingSettings().subscribe({
      next: (res) => {
        if (res) {
          this.vatRate.set(res.vatRate);
          this.currency.set(res.currency);
          this.subscriptionPriceStandard.set(res.subscriptionPriceStandard);
          this.subscriptionPricePremium.set(res.subscriptionPricePremium);
          this.billingContactEmail.set(res.billingContactEmail);
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set('Impossible de charger les paramètres de facturation.');
        console.error(err);
      }
    });
  }

  protected saveSettings(): void {
    if (this.vatRate() < 0 || this.subscriptionPriceStandard() < 0 || this.subscriptionPricePremium() < 0) {
      this.errorMessage.set('Les taux et tarifs ne peuvent pas être négatifs.');
      return;
    }

    if (!this.billingContactEmail().trim() || !this.billingContactEmail().includes('@')) {
      this.errorMessage.set('Veuillez renseigner une adresse email de facturation valide.');
      return;
    }

    const payload: BillingSettings = {
      vatRate: this.vatRate(),
      currency: this.currency(),
      subscriptionPriceStandard: this.subscriptionPriceStandard(),
      subscriptionPricePremium: this.subscriptionPricePremium(),
      billingContactEmail: this.billingContactEmail()
    };

    this.isSaving.set(true);
    this.successMessage.set('');
    this.errorMessage.set('');

    this.adminService.updateBillingSettings(payload).subscribe({
      next: (updated) => {
        this.isSaving.set(false);
        this.successMessage.set('Paramètres de facturation globale mis à jour avec succès.');
        if (updated) {
          this.vatRate.set(updated.vatRate);
          this.currency.set(updated.currency);
          this.subscriptionPriceStandard.set(updated.subscriptionPriceStandard);
          this.subscriptionPricePremium.set(updated.subscriptionPricePremium);
          this.billingContactEmail.set(updated.billingContactEmail);
        }
      },
      error: (err) => {
        this.isSaving.set(false);
        this.errorMessage.set('Erreur lors de la sauvegarde des paramètres.');
        console.error(err);
      }
    });
  }
}
