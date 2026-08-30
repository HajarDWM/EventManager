import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BillingService, QuoteDTO, QuoteItemDTO, InvoiceDTO, PaymentDTO, EventExpenseDTO } from '../../../../core/services/billing.service';
import { CurrencyService } from '../../../../core/services/currency.service';

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
  protected readonly currencyService = inject(CurrencyService);
  private readonly http = inject(HttpClient);

  protected readonly currencySymbol = computed(() => this.currencyService.activeSymbol());

  protected convert(amountInEUR: number | undefined | null): number {
    return this.currencyService.convertFromEUR(amountInEUR);
  }

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

  // Expense signals
  protected readonly expensesList = signal<EventExpenseDTO[]>([]);
  protected readonly totalExpensesAmount = computed(() => {
    return this.expensesList().reduce((sum, exp) => sum + (exp.amount || 0), 0);
  });
  protected readonly netProfitAmount = computed(() => {
    return this.eventTotalPrice() - this.totalExpensesAmount();
  });

  // Input bindings
  protected editTotalPrice = 0;
  protected paymentAmountInput = 0;
  protected paymentMethodInput = 'BANK_TRANSFER';
  protected paymentReferenceInput = '';
  protected paymentLabelInput = 'AVANCE';

  // Modal controls
  protected readonly isRecordingPaymentModal = signal<boolean>(false);
  protected readonly editingPaymentId = signal<number | null>(null);

  // Expense Modal controls & fields
  protected readonly isRecordingExpenseModal = signal<boolean>(false);
  protected readonly editingExpenseId = signal<number | null>(null);
  protected expenseCategoryInput = 'LOCATION';
  protected expenseDescriptionInput = '';
  protected expenseAmountInput = 0;
  protected expenseProviderInput = '';

  public ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.eventId.set(Number(idParam));
      this.loadEventDetails();
      this.loadBillingData();
      this.loadExpenses();
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
      alert(`Veuillez entrer un montant total valide supérieur à 0 ${this.currencySymbol()}.`);
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
      alert(`Le montant du règlement doit être supérieur à 0 ${this.currencySymbol()}.`);
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

  // --- EXPENSES MANAGEMENT ---
  protected loadExpenses(): void {
    this.billingService.getEventExpenses(this.eventId()).subscribe({
      next: (expenses) => {
        this.expensesList.set(expenses);
      },
      error: (err) => {
        console.error('Erreur chargement dépenses', err);
      }
    });
  }

  protected openExpenseModal(): void {
    this.editingExpenseId.set(null);
    this.expenseCategoryInput = 'LOCATION';
    this.expenseDescriptionInput = '';
    this.expenseAmountInput = 0;
    this.expenseProviderInput = '';
    this.isRecordingExpenseModal.set(true);
  }

  protected openEditExpenseModal(exp: EventExpenseDTO): void {
    if (!exp.id) return;
    this.editingExpenseId.set(exp.id);
    this.expenseCategoryInput = exp.category;
    this.expenseDescriptionInput = exp.description;
    this.expenseAmountInput = exp.amount;
    this.expenseProviderInput = exp.providerName || '';
    this.isRecordingExpenseModal.set(true);
  }

  protected recordExpense(): void {
    if (this.expenseAmountInput <= 0) {
      alert(`Le montant de la dépense doit être supérieur à 0 ${this.currencySymbol()}.`);
      return;
    }
    if (!this.expenseDescriptionInput.trim()) {
      alert('Veuillez saisir une description pour la dépense.');
      return;
    }

    this.isLoading.set(true);
    this.isRecordingExpenseModal.set(false);

    const expenseDTO: EventExpenseDTO = {
      category: this.expenseCategoryInput,
      description: this.expenseDescriptionInput,
      amount: this.expenseAmountInput,
      providerName: this.expenseProviderInput || undefined
    };

    const expenseId = this.editingExpenseId();
    if (expenseId) {
      this.billingService.updateEventExpense(this.eventId(), expenseId, expenseDTO).subscribe({
        next: () => {
          this.successMessage.set('Dépense modifiée avec succès.');
          this.loadExpenses();
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error(err);
          this.errorMessage.set('Erreur lors de la modification de la dépense.');
          this.isLoading.set(false);
        }
      });
    } else {
      this.billingService.createEventExpense(this.eventId(), expenseDTO).subscribe({
        next: () => {
          this.successMessage.set('Dépense enregistrée avec succès.');
          this.loadExpenses();
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error(err);
          this.errorMessage.set('Erreur lors de l\'enregistrement de la dépense.');
          this.isLoading.set(false);
        }
      });
    }
  }

  protected deleteExpense(expenseId: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette dépense ?')) {
      this.isLoading.set(true);
      this.billingService.deleteEventExpense(this.eventId(), expenseId).subscribe({
        next: () => {
          this.successMessage.set('Dépense supprimée avec succès.');
          this.loadExpenses();
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error(err);
          this.errorMessage.set('Erreur lors de la suppression de la dépense.');
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

  protected getExpenseCategoryLabel(category?: string): string {
    switch (category) {
      case 'LOCATION': return 'Location de salle';
      case 'CATERING': return 'Traiteur / Approvisionnement';
      case 'STAFF': return 'Personnel / Sécurité';
      case 'DECORATION': return 'Décoration / Fleuriste';
      case 'LOGISTICS': return 'Logistique / Transport';
      default: return category ? category.replace('_', ' ') : 'Autre dépense';
    }
  }

  protected getExpenseCategoryBadgeClass(category?: string): string {
    switch (category) {
      case 'LOCATION': return 'bg-flat-light text-flat border border-flat-light';
      case 'CATERING': return 'bg-warning-light text-warning border border-warning-light';
      case 'STAFF': return 'bg-danger-light text-danger border border-danger-light';
      case 'DECORATION': return 'bg-info-light text-info border border-info-light';
      case 'LOGISTICS': return 'bg-city-light text-city border border-city-light';
      default: return 'bg-body-light text-muted border border-light';
    }
  }

  protected printPaymentReceipt(pay: PaymentDTO): void {
    const eventName = this.eventTitle() || 'Événement';
    
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) {
      alert('Veuillez autoriser les fenêtres pop-up pour imprimer le reçu.');
      return;
    }

    const dateStr = pay.paymentDate ? new Date(pay.paymentDate).toLocaleDateString('fr-FR', {
      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    }) : '-';

    const labelText = this.getPaymentLabelText(pay.label);
    const methodText = this.getPaymentMethodLabel(pay.paymentMethod);

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Reçu de Règlement - ${eventName}</title>
        <style>
          body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            color: #333;
            margin: 40px;
            line-height: 1.6;
          }
          .receipt-container {
            border: 1px solid #e0e0e0;
            padding: 30px;
            border-radius: 8px;
            max-width: 600px;
            margin: 0 auto;
            box-shadow: 0 4px 6px rgba(0,0,0,0.05);
          }
          .header {
            text-align: center;
            border-bottom: 2px solid #2c3e50;
            padding-bottom: 15px;
            margin-bottom: 25px;
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
            color: #2c3e50;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          .header p {
            margin: 5px 0 0;
            font-size: 14px;
            color: #7f8c8d;
          }
          .meta-info {
            display: flex;
            justify-content: space-between;
            margin-bottom: 25px;
            font-size: 13px;
            color: #555;
            background-color: #f9f9f9;
            padding: 10px 15px;
            border-radius: 4px;
          }
          .details-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
          }
          .details-table th, .details-table td {
            padding: 12px 15px;
            text-align: left;
            border-bottom: 1px solid #eee;
          }
          .details-table th {
            background-color: #f8f9fa;
            color: #2c3e50;
            font-weight: bold;
            font-size: 13px;
            text-transform: uppercase;
          }
          .details-table td {
            font-size: 14px;
          }
          .amount-row {
            background-color: #f1f9f1;
            font-weight: bold;
          }
          .amount-value {
            font-size: 18px;
            color: #27ae60;
          }
          .footer {
            text-align: center;
            margin-top: 40px;
            font-size: 11px;
            color: #bdc3c7;
            border-top: 1px solid #eee;
            padding-top: 15px;
          }
          @media print {
            body { margin: 0; }
            .receipt-container {
              box-shadow: none;
              border: none;
              padding: 0;
              max-width: 100%;
            }
          }
        </style>
      </head>
      <body>
        <div class="receipt-container">
          <div class="header">
            <h1>Reçu de Paiement</h1>
            <p>EventManager - Gestion Financière</p>
          </div>
          <div class="meta-info">
            <div>
              <strong>Événement :</strong> ${eventName}<br>
              <strong>Date d'impression :</strong> ${new Date().toLocaleDateString('fr-FR')}
            </div>
            <div style="text-align: right;">
              <strong>Règlement ID :</strong> ${pay.id || 'N/A'}<br>
              <strong>Référence :</strong> ${pay.reference || '-'}
            </div>
          </div>
          <table class="details-table">
            <thead>
              <tr>
                <th style="width: 50%;">Description</th>
                <th style="width: 50%;">Détails</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Type de règlement</strong></td>
                <td>${labelText}</td>
              </tr>
              <tr>
                <td><strong>Moyen de paiement</strong></td>
                <td>${methodText}</td>
              </tr>
              <tr>
                <td><strong>Date du versement</strong></td>
                <td>${dateStr}</td>
              </tr>
              <tr>
                <td><strong>Référence de transaction</strong></td>
                <td>${pay.reference || '-'}</td>
              </tr>
              <tr class="amount-row">
                <td><strong>Montant Total Reçu</strong></td>
                <td class="amount-value">${this.currencyService.convertAndFormat(pay.amount)}</td>
              </tr>
            </tbody>
          </table>
          <div class="footer">
            <p>Document officiel généré par EventManager. Merci de votre confiance.</p>
          </div>
        </div>
        <script>
          window.onload = function() {
            window.print();
            setTimeout(function() { window.close(); }, 500);
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  }

  protected printExpenseReceipt(exp: EventExpenseDTO): void {
    const eventName = this.eventTitle() || 'Événement';
    
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) {
      alert('Veuillez autoriser les fenêtres pop-up pour imprimer le bon de dépense.');
      return;
    }

    const dateStr = exp.expenseDate ? new Date(exp.expenseDate).toLocaleDateString('fr-FR', {
      year: 'numeric', month: 'long', day: 'numeric'
    }) : '-';

    const categoryText = this.getExpenseCategoryLabel(exp.category);

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Bon de Dépense - ${eventName}</title>
        <style>
          body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            color: #333;
            margin: 40px;
            line-height: 1.6;
          }
          .receipt-container {
            border: 1px solid #e0e0e0;
            padding: 30px;
            border-radius: 8px;
            max-width: 600px;
            margin: 0 auto;
            box-shadow: 0 4px 6px rgba(0,0,0,0.05);
          }
          .header {
            text-align: center;
            border-bottom: 2px solid #c0392b;
            padding-bottom: 15px;
            margin-bottom: 25px;
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
            color: #c0392b;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          .header p {
            margin: 5px 0 0;
            font-size: 14px;
            color: #7f8c8d;
          }
          .meta-info {
            display: flex;
            justify-content: space-between;
            margin-bottom: 25px;
            font-size: 13px;
            color: #555;
            background-color: #f9f9f9;
            padding: 10px 15px;
            border-radius: 4px;
          }
          .details-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
          }
          .details-table th, .details-table td {
            padding: 12px 15px;
            text-align: left;
            border-bottom: 1px solid #eee;
          }
          .details-table th {
            background-color: #f8f9fa;
            color: #c0392b;
            font-weight: bold;
            font-size: 13px;
            text-transform: uppercase;
          }
          .details-table td {
            font-size: 14px;
          }
          .amount-row {
            background-color: #fdf2f2;
            font-weight: bold;
          }
          .amount-value {
            font-size: 18px;
            color: #c0392b;
          }
          .footer {
            text-align: center;
            margin-top: 40px;
            font-size: 11px;
            color: #bdc3c7;
            border-top: 1px solid #eee;
            padding-top: 15px;
          }
          @media print {
            body { margin: 0; }
            .receipt-container {
              box-shadow: none;
              border: none;
              padding: 0;
              max-width: 100%;
            }
          }
        </style>
      </head>
      <body>
        <div class="receipt-container">
          <div class="header">
            <h1>Bon de Dépense</h1>
            <p>EventManager - Suivi des Frais</p>
          </div>
          <div class="meta-info">
            <div>
              <strong>Événement :</strong> ${eventName}<br>
              <strong>Date d'impression :</strong> ${new Date().toLocaleDateString('fr-FR')}
            </div>
            <div style="text-align: right;">
              <strong>Dépense ID :</strong> ${exp.id || 'N/A'}<br>
              <strong>Date de la dépense :</strong> ${dateStr}
            </div>
          </div>
          <table class="details-table">
            <thead>
              <tr>
                <th style="width: 50%;">Description de la Charge</th>
                <th style="width: 50%;">Détails</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Catégorie</strong></td>
                <td>${categoryText}</td>
              </tr>
              <tr>
                <td><strong>Description / Intitulé</strong></td>
                <td>${exp.description}</td>
              </tr>
              <tr>
                <td><strong>Fournisseur / Prestataire</strong></td>
                <td>${exp.providerName || '-'}</td>
              </tr>
              <tr>
                <td><strong>Date d'enregistrement</strong></td>
                <td>${dateStr}</td>
              </tr>
              <tr class="amount-row">
                <td><strong>Montant Total Payé (TTC)</strong></td>
                <td class="amount-value">${this.currencyService.convertAndFormat(exp.amount)}</td>
              </tr>
            </tbody>
          </table>
          <div class="footer">
            <p>Justificatif de dépense interne généré par EventManager.</p>
          </div>
        </div>
        <script>
          window.onload = function() {
            window.print();
            setTimeout(function() { window.close(); }, 500);
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  }
}
