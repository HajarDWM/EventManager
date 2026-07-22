import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';

@Component({
  selector: 'app-admin-caterer-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-caterer-list.html'
})
export class AdminCatererList implements OnInit {
  private readonly adminService = inject(AdminService);

  // States
  protected readonly caterers = signal<any[]>([]);
  protected readonly isLoading = signal(true);
  protected readonly successMessage = signal('');
  protected readonly errorMessage = signal('');

  // Selected Caterer for Edit Subscription Modal
  protected selectedCaterer = signal<any | null>(null);
  protected editPlan = signal('FREE');
  protected editSubStatus = signal('ACTIVE');

  public ngOnInit(): void {
    this.loadCaterers();
  }

  protected loadCaterers(): void {
    this.isLoading.set(true);
    this.adminService.getAllCaterers().subscribe({
      next: (res) => {
        this.caterers.set(res);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set('Erreur lors du chargement des comptes traiteurs.');
        console.error(err);
      }
    });
  }

  protected toggleAccountStatus(caterer: any): void {
    const nextStatus = caterer.accountStatus === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED';
    this.isLoading.set(true);
    this.successMessage.set('');
    this.errorMessage.set('');

    this.adminService.updateCatererStatusAndSubscription(caterer.id, nextStatus).subscribe({
      next: (updated) => {
        this.loadCaterers();
        this.successMessage.set(`Le compte de ${caterer.businessName} a été ${nextStatus === 'SUSPENDED' ? 'suspendu' : 'activé'} avec succès.`);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set('Impossible de changer le statut du compte.');
        console.error(err);
      }
    });
  }

  protected openEditModal(caterer: any): void {
    this.selectedCaterer.set(caterer);
    this.editPlan.set(caterer.subscriptionPlan || 'FREE');
    this.editSubStatus.set(caterer.subscriptionStatus || 'ACTIVE');
  }

  protected closeEditModal(): void {
    this.selectedCaterer.set(null);
  }

  protected saveSubscription(): void {
    const caterer = this.selectedCaterer();
    if (!caterer) return;

    this.isLoading.set(true);
    this.successMessage.set('');
    this.errorMessage.set('');

    this.adminService.updateCatererStatusAndSubscription(
      caterer.id, 
      undefined, 
      this.editPlan(), 
      this.editSubStatus()
    ).subscribe({
      next: (updated) => {
        this.loadCaterers();
        this.closeEditModal();
        this.successMessage.set(`Abonnement de ${caterer.businessName} mis à jour avec succès.`);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set('Impossible de mettre à jour l\'abonnement.');
        console.error(err);
      }
    });
  }
}
