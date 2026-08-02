import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BillingService, QuoteDTO, QuoteItemDTO, InvoiceDTO, PaymentDTO } from '../../../../core/services/billing.service';

@Component({
  selector: 'app-event-billing',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './event-billing.html'
})
export class EventBilling implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly billingService = inject(BillingService);
  private readonly http = inject(HttpClient);

  protected readonly eventId = signal<number>(0);
  protected readonly eventTitle = signal<string>('');
  protected readonly isLoading = signal<boolean>(true);
  protected readonly errorMessage = signal<string>('');
  protected readonly successMessage = signal<string>('');

  // Simplified High-Level State
  protected readonly eventTotalPrice = signal<number>(0);
  protected readonly totalPaidAmount = signal<number>(0);
  
  protected readonly remainingBalanceDue = computed(() => {
    const total = this.eventTotalPrice();
    const paid = this.totalPaidAmount();
    const balance = total - paid;
    return balance < 0 ? 0 : balance;
  });

  // Backend links cached
  protected activeQuote: QuoteDTO | null = null;
  protected activeInvoice: InvoiceDTO | null = null;
  protected paymentsList = signal<PaymentDTO[]>([]);

  // Input bindings
  protected editTotalPrice = 0;
  protected paymentAmountInput = 0;
  protected paymentMethodInput = 'BANK_TRANSFER';
  protected paymentReferenceInput = '';

  // Modal controls
  protected readonly isRecordingPaymentModal = signal<boolean>(false);

  public ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.eventId.set(Number(idParam));
      this.loadEventDetails();
      this.loadBillingData();
    } else {
      this.errorMessage.set('Identifiant de l\'événement manquant.');
      this.isLoading.set(false);
    }
  }

  private loadEventDetails(): void {
    this.http.get<any>(`/api/events/${this.eventId()}`).subscribe({
      next: (event) => {
        if (event) {
          this.eventTitle.set(event.title);
        }
      },
      error: (err) => {
        console.error('Erreur chargement événement', err);
      }
    });
  }

  protected loadBillingData(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    // Fetch quotes first
    this.billingService.getQuotes(this.eventId()).subscribe({
      next: (quotes) => {
        // Find if there is an active global quote
        const globalQuote = quotes.find(q => q.reference?.startsWith('QT-GLOBAL-') || q.status === 'ACCEPTED' || q.status === 'INVOICED') || quotes[0];
        
        if (globalQuote) {
          this.activeQuote = globalQuote;
          this.eventTotalPrice.set(globalQuote.totalTtc || 0);
          this.editTotalPrice = globalQuote.totalTtc || 0;
        } else {
          this.activeQuote = null;
          this.eventTotalPrice.set(0);
          this.editTotalPrice = 0;
        }

        // Fetch invoices
        this.billingService.getInvoices(this.eventId()).subscribe({
          next: (invoices) => {
            const globalInvoice = invoices[0]; // Get the active invoice
            if (globalInvoice) {
              this.activeInvoice = globalInvoice;
              this.totalPaidAmount.set(globalInvoice.totalPaid || 0);
              this.paymentsList.set(globalInvoice.payments || []);
            } else {
              this.activeInvoice = null;
              this.totalPaidAmount.set(0);
              this.paymentsList.set([]);
            }
            this.isLoading.set(false);
          },
          error: (err) => {
            console.error('Error loading invoices', err);
            this.errorMessage.set('Impossible de charger les factures.');
            this.isLoading.set(false);
          }
        });
      },
      error: (err) => {
        console.error('Error loading quotes', err);
        this.errorMessage.set('Impossible de charger les devis.');
        this.isLoading.set(false);
      }
    });
  }

  // --- SAVE/UPDATE TOTAL PRICE ---
  protected saveTotalPrice(): void {
    if (this.editTotalPrice <= 0) {
      alert('Veuillez entrer un montant total valide supérieur à 0 €.');
      return;
    }

    this.isLoading.set(true);

    if (this.activeQuote) {
      // Update existing quote
      const updatedQuote: QuoteDTO = {
        ...this.activeQuote,
        taxRate: 0.00, // Simplify: 0% tax for straightforward high-level tracking
        items: [
          {
            id: this.activeQuote.items[0]?.id,
            description: 'Prestation globale de l\'événement',
            quantity: 1,
            unitPrice: this.editTotalPrice,
            totalPrice: this.editTotalPrice
          }
        ]
      };

      this.billingService.updateQuote(this.eventId(), this.activeQuote.id!, updatedQuote).subscribe({
        next: (savedQuote) => {
          this.activeQuote = savedQuote;
          this.eventTotalPrice.set(savedQuote.totalTtc || 0);
          
          // Re-generate or adjust invoice total
          this.syncInvoiceWithQuote();
        },
        error: (err) => {
          console.error(err);
          this.errorMessage.set('Erreur lors de la mise à jour du prix total.');
          this.isLoading.set(false);
        }
      });
    } else {
      // Create a brand new global quote
      const newQuote: QuoteDTO = {
        eventId: this.eventId(),
        taxRate: 0.00,
        items: [
          {
            description: 'Prestation globale de l\'événement',
            quantity: 1,
            unitPrice: this.editTotalPrice,
            totalPrice: this.editTotalPrice
          }
        ]
      };

      this.billingService.createQuote(this.eventId(), newQuote).subscribe({
        next: (savedQuote) => {
          this.activeQuote = savedQuote;
          this.eventTotalPrice.set(savedQuote.totalTtc || 0);
          
          // Accept the quote automatically to make it billable
          this.billingService.acceptQuote(this.eventId(), savedQuote.id!).subscribe({
            next: (acceptedQuote) => {
              this.activeQuote = acceptedQuote;
              this.syncInvoiceWithQuote();
            },
            error: (err) => {
              console.error(err);
              this.errorMessage.set('Erreur lors de la validation du devis.');
              this.isLoading.set(false);
            }
          });
        },
        error: (err) => {
          console.error(err);
          this.errorMessage.set('Erreur lors de la création du devis global.');
          this.isLoading.set(false);
        }
      });
    }
  }

  private syncInvoiceWithQuote(): void {
    if (!this.activeQuote || !this.activeQuote.id) return;

    if (this.activeInvoice) {
      // If invoice exists, but payments are recorded, we need to delete the invoice and recreate it
      // or if no payments are recorded, we delete and recreate.
      if (this.activeInvoice.totalPaid && this.activeInvoice.totalPaid > 0) {
        // Payments already exist. To avoid deleting payments, we will just inform the user or recreate.
        // Actually, let's keep the existing payments: we can delete the invoice, which drops payments,
        // but it's simpler if we just recreate it when they reset. Let's delete the invoice and recreate
        // if no payments are made, otherwise warn the user.
        alert('Attention : Le montant total a été mis à jour. Veuillez réinitialiser les règlements si vous souhaitez ajuster la facture globale.');
        this.loadBillingData();
      } else {
        // No payments recorded yet, safe to delete invoice and recreate
        this.billingService.deleteInvoice(this.eventId(), this.activeInvoice.id!).subscribe({
          next: () => {
            this.generateGlobalInvoice();
          },
          error: (err) => {
            console.error(err);
            this.loadBillingData();
          }
        });
      }
    } else {
      // No invoice yet, create one
      this.generateGlobalInvoice();
    }
  }

  private generateGlobalInvoice(): void {
    if (!this.activeQuote || !this.activeQuote.id) return;

    this.billingService.generateInvoice(this.eventId(), this.activeQuote.id, 'GENERAL').subscribe({
      next: (invoice) => {
        this.activeInvoice = invoice;
        this.successMessage.set('Tarification globale mise à jour avec succès.');
        this.loadBillingData();
      },
      error: (err) => {
        console.error(err);
        this.errorMessage.set('Erreur lors de la génération de la facture globale.');
        this.isLoading.set(false);
      }
    });
  }

  // --- RECORD PAYMENT ---
  protected openPaymentModal(): void {
    if (!this.activeQuote) {
      alert('Veuillez d\'abord définir le montant total de l\'événement.');
      return;
    }
    this.paymentAmountInput = this.remainingBalanceDue();
    this.paymentMethodInput = 'BANK_TRANSFER';
    this.paymentReferenceInput = '';
    this.isRecordingPaymentModal.set(true);
  }

  protected recordPayment(): void {
    if (this.paymentAmountInput <= 0) {
      alert('Le montant du règlement doit être supérieur à 0 €.');
      return;
    }

    this.isLoading.set(true);
    this.isRecordingPaymentModal.set(false);

    // Ensure invoice exists before recording payment
    if (!this.activeInvoice) {
      this.billingService.generateInvoice(this.eventId(), this.activeQuote!.id!, 'GENERAL').subscribe({
        next: (invoice) => {
          this.activeInvoice = invoice;
          this.submitPaymentToInvoice(invoice.id!);
        },
        error: (err) => {
          console.error(err);
          this.errorMessage.set('Erreur de génération de facture.');
          this.isLoading.set(false);
        }
      });
    } else {
      this.submitPaymentToInvoice(this.activeInvoice.id!);
    }
  }

  private submitPaymentToInvoice(invoiceId: number): void {
    const payment: PaymentDTO = {
      invoiceId: invoiceId,
      amount: this.paymentAmountInput,
      paymentMethod: this.paymentMethodInput,
      reference: this.paymentReferenceInput
    };

    this.billingService.recordPayment(this.eventId(), invoiceId, payment).subscribe({
      next: () => {
        this.successMessage.set('Règlement enregistré avec succès.');
        this.loadBillingData();
      },
      error: (err) => {
        console.error(err);
        this.errorMessage.set('Erreur lors de l\'enregistrement du règlement.');
        this.isLoading.set(false);
      }
    });
  }

  // --- RESET ALL PAYMENTS ---
  protected resetBilling(): void {
    if (confirm('Êtes-vous sûr de vouloir réinitialiser la facturation ? Tous les paiements enregistrés seront effacés.')) {
      this.isLoading.set(true);
      
      if (this.activeInvoice) {
        this.billingService.deleteInvoice(this.eventId(), this.activeInvoice.id!).subscribe({
          next: () => {
            this.activeInvoice = null;
            this.successMessage.set('La facturation et les règlements ont été réinitialisés.');
            this.loadBillingData();
          },
          error: (err) => {
            console.error(err);
            this.errorMessage.set('Erreur lors de la suppression de la facture.');
            this.isLoading.set(false);
          }
        });
      } else {
        this.loadBillingData();
      }
    }
  }

  // --- HELPERS ---
  protected getPaymentMethodLabel(method?: string): string {
    switch (method) {
      case 'BANK_TRANSFER': return 'Virement';
      case 'CARD': return 'Carte bancaire';
      case 'CASH': return 'Espèces';
      case 'CHECK': return 'Chèque';
      default: return method || 'Autre';
    }
  }
}
