import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CatererService, CatererProfile } from '../../core/services/caterer.service';
import { CurrencyService } from '../../core/services/currency.service';

import { TranslatePipe } from '../../core/pipes/translate.pipe';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './profile.html'
})
export class Profile implements OnInit {
  private readonly catererService = inject(CatererService);
  protected readonly currencyService = inject(CurrencyService);

  // Profile Data
  protected readonly businessName = signal('');
  protected readonly email = signal('');
  protected readonly accountStatus = signal('ACTIVE');

  // Currency Preferences
  protected readonly selectedCurrency = signal('EUR');

  // Password Form Data
  protected readonly currentPassword = signal('');
  protected readonly newPassword = signal('');
  protected readonly confirmNewPassword = signal('');

  // Status & Feedback
  protected readonly isLoading = signal(false);
  protected readonly isSavingProfile = signal(false);
  protected readonly isSavingPassword = signal(false);

  protected readonly profileSuccessMessage = signal('');
  protected readonly profileErrorMessage = signal('');

  protected readonly passwordSuccessMessage = signal('');
  protected readonly passwordErrorMessage = signal('');

  public ngOnInit(): void {
    this.loadProfile();
    this.selectedCurrency.set(this.currencyService.activeCurrency());
  }

  protected loadProfile(): void {
    this.isLoading.set(true);
    this.catererService.getCurrentProfile().subscribe({
      next: (profile: CatererProfile) => {
        this.businessName.set(profile.businessName || '');
        this.email.set(profile.email || '');
        this.accountStatus.set(profile.accountStatus || 'ACTIVE');
        this.isLoading.set(false);
      },
      error: (err: any) => {
        this.isLoading.set(false);
        this.profileErrorMessage.set('Impossible de charger les informations du profil.');
        console.error(err);
      }
    });
  }

  protected onUpdateProfile(): void {
    if (!this.businessName().trim()) {
      this.profileErrorMessage.set('Le nom de l\'entreprise est obligatoire.');
      return;
    }

    this.isSavingProfile.set(true);
    this.profileSuccessMessage.set('');
    this.profileErrorMessage.set('');

    this.catererService.updateProfile({ businessName: this.businessName() }).subscribe({
      next: (updatedProfile: CatererProfile) => {
        this.isSavingProfile.set(false);
        this.businessName.set(updatedProfile.businessName);
        this.profileSuccessMessage.set('Profil mis à jour avec succès !');

        // Mettre à jour les informations du localStorage
        const catererData = localStorage.getItem('caterer');
        if (catererData) {
          try {
            const parsed = JSON.parse(catererData);
            parsed.businessName = updatedProfile.businessName;
            localStorage.setItem('caterer', JSON.stringify(parsed));
          } catch (e) {
            console.error(e);
          }
        }
      },
      error: (err: any) => {
        this.isSavingProfile.set(false);
        this.profileErrorMessage.set(err.error?.error || 'Une erreur est survenue lors de la mise à jour.');
        console.error(err);
      }
    });
  }

  protected onChangePassword(): void {
    if (!this.currentPassword() || !this.newPassword() || !this.confirmNewPassword()) {
      this.passwordErrorMessage.set('Veuillez remplir tous les champs de mot de passe.');
      return;
    }

    if (this.newPassword().length < 6) {
      this.passwordErrorMessage.set('Le nouveau mot de passe doit contenir au moins 6 caractères.');
      return;
    }

    if (this.newPassword() !== this.confirmNewPassword()) {
      this.passwordErrorMessage.set('Le nouveau mot de passe et sa confirmation ne correspondent pas.');
      return;
    }

    this.isSavingPassword.set(true);
    this.passwordSuccessMessage.set('');
    this.passwordErrorMessage.set('');

    this.catererService.changePassword({
      currentPassword: this.currentPassword(),
      newPassword: this.newPassword()
    }).subscribe({
      next: () => {
        this.isSavingPassword.set(false);
        this.passwordSuccessMessage.set('Mot de passe changé avec succès !');
        this.currentPassword.set('');
        this.newPassword.set('');
        this.confirmNewPassword.set('');
      },
      error: (err: any) => {
        this.isSavingPassword.set(false);
        this.passwordErrorMessage.set(
          err.error?.message || err.error?.error || 'L\'ancien mot de passe est incorrect.'
        );
        console.error(err);
      }
    });
  }

  protected onCurrencyChange(code: string): void {
    this.selectedCurrency.set(code);
    this.currencyService.setManualCurrency(code);
    this.profileSuccessMessage.set(`Devise préférée mise à jour vers ${code}.`);
  }

  protected async onResetAutoDetection(): Promise<void> {
    this.currencyService.resetToAutoDetection();
    const detected = await this.currencyService.initCurrency();
    this.selectedCurrency.set(detected);
    this.profileSuccessMessage.set(`Détection automatique de la devise réactivée (${detected}).`);
  }
}
