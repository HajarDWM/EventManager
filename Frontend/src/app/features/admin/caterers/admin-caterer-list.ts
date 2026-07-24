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

  protected readonly selectedStatusFilter = signal<string>('');

  // Selected Caterer for Edit Subscription Modal
  protected selectedCaterer = signal<any | null>(null);
  protected editPlan = signal('FREE');
  protected editSubStatus = signal('ACTIVE');
  protected editStartDate = signal('');
  protected editEndDate = signal('');

  // Add Caterer Modal States
  protected isAddModalOpen = signal(false);
  protected newBusinessName = signal('');
  protected newEmail = signal('');
  protected newPassword = signal('');
  protected newPlan = signal('FREE');
  protected newStartDate = signal('');
  protected newEndDate = signal('');

  public ngOnInit(): void {
    this.loadCaterers();
  }

  protected loadCaterers(): void {
    this.isLoading.set(true);
    this.adminService.getAllCaterers(this.selectedStatusFilter()).subscribe({
      next: (res) => {
        this.caterers.set(res);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set('Erreur lors du chargement des comptes organisateurs.');
        console.error(err);
      }
    });
  }

  protected onStatusFilterChange(status: string): void {
    this.selectedStatusFilter.set(status);
    this.loadCaterers();
  }

  protected approveCaterer(caterer: any): void {
    this.updateStatus(caterer, 'APPROVED');
  }

  protected suspendCaterer(caterer: any): void {
    this.updateStatus(caterer, 'SUSPENDED');
  }

  private updateStatus(caterer: any, status: string): void {
    this.isLoading.set(true);
    this.successMessage.set('');
    this.errorMessage.set('');

    this.adminService.updateCatererStatusAndSubscription(caterer.id, status).subscribe({
      next: (updated) => {
        this.loadCaterers();
        const actionLabel = status === 'APPROVED' ? 'approuvé' : 'suspendu';
        this.successMessage.set(`Le compte de ${caterer.businessName} a été ${actionLabel} avec succès.`);
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
    this.editStartDate.set(caterer.subscriptionStartDate ? caterer.subscriptionStartDate.substring(0, 10) : '');
    this.editEndDate.set(caterer.subscriptionEndDate ? caterer.subscriptionEndDate.substring(0, 10) : '');
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

    const startIso = this.editStartDate() ? this.editStartDate() + 'T00:00:00' : undefined;
    const endIso = this.editEndDate() ? this.editEndDate() + 'T00:00:00' : undefined;

    this.adminService.updateCatererStatusAndSubscription(
      caterer.id, 
      undefined, 
      this.editPlan(), 
      this.editSubStatus(),
      startIso,
      endIso
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

  protected openAddModal(): void {
    const now = new Date();
    const nextMonth = new Date();
    nextMonth.setDate(now.getDate() + 30);

    const formatDate = (d: Date) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    this.newBusinessName.set('');
    this.newEmail.set('');
    this.newPassword.set('');
    this.newPlan.set('FREE');
    this.newStartDate.set(formatDate(now));
    this.newEndDate.set(formatDate(nextMonth));
    this.isAddModalOpen.set(true);
  }

  protected closeAddModal(): void {
    this.isAddModalOpen.set(false);
  }

  protected createCaterer(): void {
    if (!this.newBusinessName() || !this.newEmail() || !this.newPassword()) {
      this.errorMessage.set('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    this.isLoading.set(true);
    this.successMessage.set('');
    this.errorMessage.set('');

    const payload = {
      businessName: this.newBusinessName(),
      email: this.newEmail(),
      password: this.newPassword(),
      subscriptionPlan: this.newPlan(),
      subscriptionStartDate: this.newStartDate() ? this.newStartDate() + 'T00:00:00' : undefined,
      subscriptionEndDate: this.newEndDate() ? this.newEndDate() + 'T00:00:00' : undefined
    };

    this.adminService.createCaterer(payload).subscribe({
      next: (res) => {
        this.loadCaterers();
        this.closeAddModal();
        this.successMessage.set(`Compte organisateur "${res.businessName}" créé avec succès.`);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.error?.message || 'Erreur lors de la création du compte organisateur.');
        console.error(err);
      }
    });
  }
}
