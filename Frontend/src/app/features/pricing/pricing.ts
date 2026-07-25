import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CatererService } from '../../core/services/caterer.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-pricing',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pricing.html'
})
export class Pricing implements OnInit {
  private readonly catererService = inject(CatererService);
  private readonly router = inject(Router);
  private readonly http = inject(HttpClient);

  protected readonly currentPlan = signal('FREE');
  protected readonly isLoading = signal(false);
  protected readonly successMessage = signal('');
  protected readonly errorMessage = signal('');

  public ngOnInit(): void {
    this.loadProfile();
  }

  private loadProfile(): void {
    this.catererService.getCurrentProfile().subscribe({
      next: (profile) => {
        this.currentPlan.set(profile.subscriptionPlan || 'FREE');
      },
      error: (err) => console.error(err)
    });
  }

  protected selectPlan(plan: string): void {
    if (plan === this.currentPlan()) {
      return;
    }

    this.isLoading.set(true);
    this.successMessage.set('');
    this.errorMessage.set('');

    this.http.put<any>(`/api/caterers/subscription?plan=${plan}`, {}).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        this.catererService.getCurrentProfile().subscribe({
          next: () => {
            this.successMessage.set(`Félicitations ! Votre forfait a été mis à niveau vers ${plan} avec succès.`);
            this.currentPlan.set(plan);
            setTimeout(() => {
              this.router.navigate(['/events']);
            }, 3000);
          }
        });
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set('Une erreur est survenue lors de la mise à niveau de l\'abonnement.');
        console.error(err);
      }
    });
  }
}
