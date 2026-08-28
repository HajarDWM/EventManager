import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AdminService } from '../../../core/services/admin.service';
import { CurrencyService } from '../../../core/services/currency.service';

export interface Transaction {
  id: string;
  catererId: number;
  businessName: string;
  subscriptionPlan: string;
  amountPaid: number;
  vatRate: number;
  paymentDate: string;
  paymentStatus: string;
  amountHt: number;
}

export interface ConsolidatedOrganizerTransaction {
  catererId: number;
  businessName: string;
  latestPlan: string;
  transactionCount: number;
  latestPaymentDate: string;
  paymentStatus: string;
  transactions: Transaction[];
}

export interface Expense {
  id?: number;
  description: string;
  amount: number;
  expenseDate: string;
  category: string;
}

@Component({
  selector: 'app-admin-transactions',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './admin-transactions.html'
})
export class AdminTransactions implements OnInit {
  private readonly adminService = inject(AdminService);
  protected readonly currencyService = inject(CurrencyService);

  protected readonly currencySymbol = computed(() => this.currencyService.activeSymbol());

  protected convert(amountInEUR: number | undefined | null): number {
    return this.currencyService.convertFromEUR(amountInEUR);
  }

  protected convertTransactionHt(t: any): number {
    return this.currencyService.convertTransactionAmountHt(t);
  }

  protected onCurrencySelect(code: string): void {
    this.currencyService.setManualCurrency(code);
  }

  // States
  protected readonly transactions = signal<Transaction[]>([]);
  protected readonly allTransactions = signal<Transaction[]>([]);
  protected readonly expandedCaterers = signal<Set<string | number>>(new Set());
  protected readonly isLoading = signal(true);
  protected readonly isExporting = signal(false);
  protected readonly errorMessage = signal('');

  // Dynamic KPI Metrics computed signal
  protected readonly kpiStats = computed(() => {
    const activeCurr = this.currencyService.activeCurrency();
    const rev = this.getTotalRevenuesHt();
    const totalExpMAD = this.getTotalExpenses();
    const expConverted = this.currencyService.convertFromMAD(totalExpMAD, activeCurr);
    const netProfit = rev - expConverted;

    return {
      selectedPeriodRevenue: rev,
      selectedPeriodExpenses: expConverted,
      netProfitSelectedPeriod: netProfit
    };
  });

  // Grouped consolidated organizers computed signal
  protected readonly consolidatedOrganizers = computed(() => {
    const list = this.transactions();
    if (!list || list.length === 0) return [];

    const query = this.searchInput().toLowerCase().trim();

    const map = new Map<string | number, ConsolidatedOrganizerTransaction>();

    for (const t of list) {
      const key = t.catererId || t.businessName;
      if (!map.has(key)) {
        map.set(key, {
          catererId: t.catererId,
          businessName: t.businessName,
          latestPlan: t.subscriptionPlan,
          transactionCount: 1,
          latestPaymentDate: t.paymentDate,
          paymentStatus: t.paymentStatus,
          transactions: [t]
        });
      } else {
        const item = map.get(key)!;
        item.transactionCount += 1;
        item.transactions.push(t);
        if (new Date(t.paymentDate) > new Date(item.latestPaymentDate)) {
          item.latestPaymentDate = t.paymentDate;
          item.latestPlan = t.subscriptionPlan;
          item.paymentStatus = t.paymentStatus;
        }
      }
    }

    const items = Array.from(map.values());

    if (!query) return items;

    return items.filter(org =>
      org.businessName && org.businessName.toLowerCase().includes(query)
    );
  });

  protected getOrganizerTotalHt(org: ConsolidatedOrganizerTransaction): number {
    let sum = 0;
    for (const t of org.transactions) {
      sum += this.currencyService.convertTransactionAmountHt(t);
    }
    return sum;
  }

  protected getTotalRevenuesHt(): number {
    let sum = 0;
    for (const org of this.consolidatedOrganizers()) {
      sum += this.getOrganizerTotalHt(org);
    }
    return sum;
  }

  protected getTotalExpenses(): number {
    let sum = 0;
    for (const exp of this.expenses()) {
      sum += exp.amount || 0;
    }
    return sum;
  }

  protected toggleExpand(catererKey: string | number, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    const current = new Set(this.expandedCaterers());
    if (current.has(catererKey)) {
      current.delete(catererKey);
    } else {
      current.add(catererKey);
    }
    this.expandedCaterers.set(current);
  }

  protected isExpanded(catererKey: string | number): boolean {
    return this.expandedCaterers().has(catererKey);
  }

  // Pagination & Search States
  protected readonly searchInput = signal('');
  protected readonly currentPage = signal(0);
  protected readonly totalElements = signal(0);
  protected readonly totalPages = signal(0);
  protected readonly pageSize = 10;

  // Filter & Expense States
  protected readonly selectedPeriod = signal<string>('1_MONTH');
  protected readonly stats = signal<any>(null);
  protected readonly expenses = signal<Expense[]>([]);
  protected readonly showExpenseModal = signal<boolean>(false);
  protected readonly isAddingExpense = signal<boolean>(false);
  protected readonly isEditingExpense = signal<boolean>(false);
  protected readonly editingExpenseId = signal<number | null>(null);

  // Expense Form Properties
  protected newExpenseDescription = '';
  protected newExpenseAmount: number | null = null;
  protected newExpenseCurrency = 'MAD';
  protected newExpenseCategory = 'SERVER';
  protected newExpenseDate = '';

  public ngOnInit(): void {
    this.loadTransactions();
    this.loadExpenses();
    this.loadFinancialStats();
  }

  protected loadTransactions(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.adminService.getTransactions(this.searchInput(), this.selectedPeriod(), this.currentPage(), this.pageSize).subscribe({
      next: (res) => {
        if (res) {
          this.transactions.set(res.content || []);
          this.totalElements.set(res.totalElements || 0);
          this.totalPages.set(res.totalPages || 0);
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set("Impossible de charger les transactions financières.");
        console.error(err);
      }
    });

    this.adminService.getAllTransactionsList().subscribe({
      next: (list) => {
        this.allTransactions.set(list || []);
      },
      error: (err) => console.error('Error fetching all transactions for KPIs', err)
    });
  }

  protected onSearchInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    const value = target ? target.value : '';
    this.searchInput.set(value);
    this.currentPage.set(0);
    this.loadTransactions();
  }

  protected clearSearch(): void {
    this.searchInput.set('');
    this.currentPage.set(0);
    this.loadTransactions();
  }

  protected onSearch(): void {
    this.currentPage.set(0);
    this.loadTransactions();
  }

  protected changePage(pageIndex: number): void {
    if (pageIndex >= 0 && pageIndex < this.totalPages()) {
      this.currentPage.set(pageIndex);
      this.loadTransactions();
    }
  }

  protected exportCsv(): void {
    this.isExporting.set(true);
    this.errorMessage.set('');

    this.adminService.downloadTransactionsCsv().subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `rapport_transactions_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
        this.isExporting.set(false);
      },
      error: (err) => {
        this.isExporting.set(false);
        this.errorMessage.set("Erreur lors de l'exportation du fichier CSV.");
        console.error(err);
      }
    });
  }

  protected getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'SUCCESS':
        return 'badge-custom-approved'; // Soft green with black text
      case 'PENDING':
        return 'badge-custom-pending'; // Soft orange/yellow with black text
      case 'FAILED':
      default:
        return 'badge-custom-suspended'; // Soft red/pink with black text
    }
  }

  protected getStatusLabel(status: string): string {
    switch (status) {
      case 'SUCCESS':
        return 'Réussite';
      case 'PENDING':
        return 'En attente';
      case 'FAILED':
        return 'Échec';
      default:
        return status;
    }
  }

  protected getPlanBadgeClass(plan: string): string {
    switch (plan) {
      case 'PREMIUM':
        return 'badge-custom-premium';
      case 'STANDARD':
        return 'badge-custom-standard';
      case 'FREE':
      default:
        return 'badge-custom-free';
    }
  }

  protected loadExpenses(): void {
    this.adminService.getAllExpenses().subscribe({
      next: (res) => {
        this.expenses.set(res || []);
      },
      error: (err) => console.error('Error loading expenses', err)
    });
  }

  protected loadFinancialStats(): void {
    this.adminService.getFinancialStats(this.selectedPeriod()).subscribe({
      next: (res) => {
        this.stats.set(res);
      },
      error: (err) => console.error('Error loading stats', err)
    });
  }

  protected changePeriod(period: string): void {
    this.selectedPeriod.set(period);
    this.currentPage.set(0);
    this.loadTransactions();
    this.loadFinancialStats();
  }

  protected openExpenseModal(): void {
    this.newExpenseDescription = '';
    this.newExpenseAmount = null;
    this.newExpenseCurrency = 'MAD';
    this.newExpenseCategory = 'SERVER';
    this.newExpenseDate = new Date().toISOString().substring(0, 16);
    this.isEditingExpense.set(false);
    this.editingExpenseId.set(null);
    this.showExpenseModal.set(true);
  }

  protected openEditExpenseModal(expense: Expense): void {
    this.newExpenseDescription = expense.description;
    this.newExpenseAmount = expense.amount;
    this.newExpenseCurrency = 'MAD';
    this.newExpenseCategory = expense.category;
    if (expense.expenseDate) {
      // Format to local date time-local format (YYYY-MM-DDTHH:mm) adjusting for local timezone offset
      const d = new Date(expense.expenseDate);
      const tzOffset = d.getTimezoneOffset() * 60000; // offset in milliseconds
      const localISOTime = (new Date(d.getTime() - tzOffset)).toISOString().slice(0, 16);
      this.newExpenseDate = localISOTime;
    } else {
      this.newExpenseDate = new Date().toISOString().substring(0, 16);
    }
    this.isEditingExpense.set(true);
    this.editingExpenseId.set(expense.id || null);
    this.showExpenseModal.set(true);
  }

  protected addExpense(): void {
    if (!this.newExpenseDescription.trim() || !this.newExpenseAmount || this.newExpenseAmount <= 0) {
      return;
    }
    this.isAddingExpense.set(true);

    const amountInMAD = this.currencyService.convertToMAD(this.newExpenseAmount, this.newExpenseCurrency);

    const expenseData: Expense = {
      description: this.newExpenseDescription,
      amount: amountInMAD,
      expenseDate: this.newExpenseDate ? new Date(this.newExpenseDate).toISOString() : new Date().toISOString(),
      category: this.newExpenseCategory
    };

    if (this.isEditingExpense()) {
      this.adminService.updateExpense(this.editingExpenseId()!, expenseData).subscribe({
        next: () => {
          this.isAddingExpense.set(false);
          this.showExpenseModal.set(false);
          this.loadExpenses();
          this.loadFinancialStats();
        },
        error: (err) => {
          this.isAddingExpense.set(false);
          console.error('Error updating expense', err);
        }
      });
    } else {
      this.adminService.createExpense(expenseData).subscribe({
        next: () => {
          this.isAddingExpense.set(false);
          this.showExpenseModal.set(false);
          this.loadExpenses();
          this.loadFinancialStats();
        },
        error: (err) => {
          this.isAddingExpense.set(false);
          console.error('Error creating expense', err);
        }
      });
    }
  }

  protected deleteExpense(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette dépense ?')) {
      this.adminService.deleteExpense(id).subscribe({
        next: () => {
          this.loadExpenses();
          this.loadFinancialStats();
        },
        error: (err) => console.error('Error deleting expense', err)
      });
    }
  }

  protected getCategoryLabel(category: string): string {
    switch (category) {
      case 'SERVER': return 'Serveur / Cloud';
      case 'TOOL': return 'Outil / Licence';
      case 'MARKETING': return 'Marketing';
      case 'OTHER':
      default:
        return 'Autre';
    }
  }
}
