import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AdminService } from '../../../core/services/admin.service';

export interface Transaction {
  id: string;
  catererId: number;
  businessName: string;
  subscriptionPlan: string;
  amountPaid: number;
  vatRate: number;
  paymentDate: string;
  paymentStatus: string;
}

@Component({
  selector: 'app-admin-transactions',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './admin-transactions.html'
})
export class AdminTransactions implements OnInit {
  private readonly adminService = inject(AdminService);

  // States
  protected readonly transactions = signal<Transaction[]>([]);
  protected readonly isLoading = signal(true);
  protected readonly isExporting = signal(false);
  protected readonly errorMessage = signal('');

  // Pagination & Search States
  protected readonly searchInput = signal('');
  protected readonly currentPage = signal(0);
  protected readonly totalElements = signal(0);
  protected readonly totalPages = signal(0);
  protected readonly pageSize = 10;

  public ngOnInit(): void {
    this.loadTransactions();
  }

  protected loadTransactions(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.adminService.getTransactions(this.searchInput(), this.currentPage(), this.pageSize).subscribe({
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
}
