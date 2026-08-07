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

  protected readonly paymentProgressPercentage = computed(() => {
    const total = this.eventTotalPrice();
    if (total <= 0) return 0;
    const paid = this.totalPaidAmount();
    const pct = Math.round((paid / total) * 100);
    return pct > 100 ? 100 : pct;
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
  protected paymentLabelInput = 'AVANCE';

  // Modal controls
  protected readonly isRecordingPaymentModal = signal<boolean>(false);
  protected readonly editingPaymentId = signal<number | null>(null);

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
      this.loadBillingData();
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
    this.editingPaymentId.set(null);
    this.paymentAmountInput = this.remainingBalanceDue();
    this.paymentMethodInput = 'BANK_TRANSFER';
    this.paymentReferenceInput = '';
    
    if (this.paymentsList().length === 0) {
      this.paymentLabelInput = 'AVANCE';
    } else {
      this.paymentLabelInput = `VERSEMENT_${this.paymentsList().length + 1}`;
    }
    
    this.isRecordingPaymentModal.set(true);
  }

  protected openEditPaymentModal(pay: PaymentDTO): void {
    if (!pay.id) return;
    this.editingPaymentId.set(pay.id);
    this.paymentAmountInput = pay.amount;
    this.paymentMethodInput = pay.paymentMethod;
    this.paymentReferenceInput = pay.reference || '';
    this.paymentLabelInput = pay.label || 'AVANCE';
    this.isRecordingPaymentModal.set(true);
  }

  protected recordPayment(): void {
    if (this.paymentAmountInput <= 0) {
      alert('Le montant du règlement doit être supérieur à 0 €.');
      return;
    }

    this.isLoading.set(true);
    this.isRecordingPaymentModal.set(false);

    const paymentId = this.editingPaymentId();
    if (paymentId) {
      const payment: PaymentDTO = {
        invoiceId: this.activeInvoice!.id!,
        amount: this.paymentAmountInput,
        paymentMethod: this.paymentMethodInput,
        reference: this.paymentReferenceInput,
        label: this.paymentLabelInput
      };
      this.billingService.updatePayment(this.eventId(), this.activeInvoice!.id!, paymentId, payment).subscribe({
        next: () => {
          this.successMessage.set('Règlement modifié avec succès.');
          this.loadBillingData();
        },
        error: (err) => {
          console.error(err);
          this.errorMessage.set('Erreur lors de la modification du règlement.');
          this.isLoading.set(false);
        }
      });
      return;
    }

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
      reference: this.paymentReferenceInput,
      label: this.paymentLabelInput
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

  // --- DELETE PAYMENT ---
  protected deletePayment(paymentId: number): void {
    if (!this.activeInvoice || !this.activeInvoice.id) return;

    if (confirm('Êtes-vous sûr de vouloir supprimer ce règlement ?')) {
      this.isLoading.set(true);
      this.billingService.deletePayment(this.eventId(), this.activeInvoice.id, paymentId).subscribe({
        next: () => {
          this.successMessage.set('Règlement supprimé avec succès.');
          this.loadBillingData();
        },
        error: (err) => {
          console.error(err);
          this.errorMessage.set('Erreur lors de la suppression du règlement.');
          this.isLoading.set(false);
        }
      });
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

  protected getPaymentLabelText(label?: string): string {
    switch (label) {
      case 'AVANCE': return 'Acompte / Avance';
      case 'VERSEMENT_2': return '2ème versement';
      case 'VERSEMENT_3': return '3ème versement';
      case 'SOLDE': return 'Solde final';
      default: return label ? label.replace('_', ' ') : 'Règlement';
    }
  }

  protected getPaymentLabelBadgeClass(label?: string): string {
    switch (label) {
      case 'AVANCE': return 'bg-info-light text-info border border-info-light';
      case 'VERSEMENT_2':
      case 'VERSEMENT_3': return 'bg-warning-light text-warning border border-warning-light';
      case 'SOLDE': return 'bg-success-light text-success border border-success-light';
      default: return 'bg-body-light text-muted border border-light';
    }
  }
}
