import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { EventService } from '../events/services/event.service';
import { Event } from '../events/models/event.model';
import { CatererService } from '../../core/services/caterer.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.html'
})
export class Dashboard implements OnInit {
  private readonly eventService = inject(EventService);
  private readonly catererService = inject(CatererService);
  private readonly router = inject(Router);

  protected readonly eventCount = signal<number>(0);
  protected readonly guestCount = signal<number>(0);
  protected readonly messageCount = signal<number>(0);
  protected readonly accountStatus = signal<string>('ACTIF');
  protected readonly isLoading = signal<boolean>(true);

  protected readonly isSubscriptionExpired = signal<boolean>(false);

  public ngOnInit(): void {
    const cachedProfile = this.catererService.currentProfile();
    if (cachedProfile) {
      if (cachedProfile.role === 'SUPER_ADMIN') {
        this.router.navigate(['/admin/dashboard']);
        return;
      }
      this.isSubscriptionExpired.set(!!cachedProfile.isExpired || !!cachedProfile.expired);
      this.loadMetrics();
    } else {
      this.catererService.getCurrentProfile().subscribe({
        next: (profile) => {
          if (profile && profile.role === 'SUPER_ADMIN') {
            this.router.navigate(['/admin/dashboard']);
          } else {
            this.isSubscriptionExpired.set(!!profile.isExpired || !!profile.expired);
            this.loadMetrics();
          }
        },
        error: () => {
          this.loadMetrics();
        }
      });
    }
  }

  private loadMetrics(): void {
    this.isLoading.set(true);
    this.eventService.getAllEvents().subscribe({
      next: (events: Event[]) => {
        this.eventCount.set(events.length);
        const totalGuests = events.reduce((sum, e) => sum + (e.guestCount || 0), 0);
        this.guestCount.set(totalGuests);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Erreur chargement métriques dashboard', err);
        this.isLoading.set(false);
      }
    });
  }
}
