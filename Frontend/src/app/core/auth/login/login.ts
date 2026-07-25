import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { CatererService } from '../../services/caterer.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html'
})
export class Login {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly catererService = inject(CatererService);

  protected readonly email = signal('');
  protected readonly password = signal('');
  protected readonly errorMessage = signal('');
  protected readonly isLoading = signal(false);

  protected onSubmit(): void {
    if (!this.email() || !this.password()) {
      this.errorMessage.set('Veuillez remplir tous les champs.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    this.authService.login({
      email: this.email(),
      password: this.password()
    }).subscribe({
      next: () => {
        this.catererService.getCurrentProfile().subscribe({
          next: (profile) => {
            this.isLoading.set(false);
            if (profile && profile.role === 'SUPER_ADMIN') {
              this.router.navigate(['/admin/caterers']);
            } else {
              this.router.navigate(['/events']);
            }
          },
          error: (err) => {
            this.isLoading.set(false);
            this.router.navigate(['/events']);
          }
        });
      },
      error: (err) => {
        this.isLoading.set(false);
        if (err.status === 403 && err.error?.error === 'ACCOUNT_PENDING_APPROVAL') {
          this.router.navigate(['/pending-approval']);
        } else if (err.status === 403 && err.error?.error === 'ACCOUNT_SUSPENDED') {
          this.errorMessage.set('Votre compte a été suspendu par l\'administrateur. Veuillez contacter le support.');
        } else {
          this.errorMessage.set(
            err.error?.message || err.error?.error || 'Email ou mot de passe incorrect.'
          );
        }
      }
    });
  }
}
