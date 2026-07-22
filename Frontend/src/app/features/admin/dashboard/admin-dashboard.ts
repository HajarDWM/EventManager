import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdminService, AdminStats } from '../../../core/services/admin.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-dashboard.html'
})
export class AdminDashboard implements OnInit {
  private readonly adminService = inject(AdminService);

  // States
  protected readonly stats = signal<AdminStats | null>(null);
  protected readonly isLoading = signal(true);
  protected readonly errorMessage = signal('');

  public ngOnInit(): void {
    this.loadStats();
  }

  protected loadStats(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.adminService.getGlobalStats().subscribe({
      next: (res) => {
        this.stats.set(res);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set('Erreur lors du chargement des statistiques de la plateforme.');
        console.error(err);
      }
    });
  }

  // Helpers to calculate percentages for distributions
  protected getPercentage(value: number, total: number): number {
    if (!total) return 0;
    return Math.round((value / total) * 100);
  }

  protected getKeys(obj: Record<string, number> | undefined): string[] {
    return obj ? Object.keys(obj) : [];
  }
}
