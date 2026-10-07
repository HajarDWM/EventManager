import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../auth/services/auth.service';
import { CatererService, CatererProfile } from '../services/caterer.service';
import { LanguageSwitcher } from '../../shared/components/language-switcher/language-switcher';
import { TranslatePipe } from '../pipes/translate.pipe';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, LanguageSwitcher, TranslatePipe],
  templateUrl: './layout.html',
  styleUrl: './layout.scss'
})
export class Layout implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly catererService = inject(CatererService);

  // Signaux réactifs pour contrôler le layout
  protected readonly isSidebarOpen = signal(true);
  protected readonly isSidebarMobileOpen = signal(false);
  protected readonly isSidebarMini = signal(false);
  protected readonly isUserDropdownOpen = signal(false);

  // Informations utilisateur réelles du traiteur connecté
  protected readonly userBusinessName = signal('Chargement...');
  protected readonly userEmail = signal('');
  protected readonly isSuperAdmin = signal(false);
  protected readonly isPending = signal(false);
  protected readonly inGracePeriod = signal(false);
  protected readonly gracePeriodDaysRemaining = signal(0);
  protected readonly isSubscriptionExpired = signal(false);

  public ngOnInit(): void {
    this.loadCatererProfile();
  }

  private loadCatererProfile(): void {
    this.catererService.getCurrentProfile().subscribe({
      next: (profile: CatererProfile) => {
        if (profile) {
          this.userBusinessName.set(profile.businessName || 'Mon Compte Organisateur');
          this.userEmail.set(profile.email || '');
          this.isSuperAdmin.set(profile.role === 'SUPER_ADMIN');
          this.isPending.set(profile.accountStatus === 'PENDING');
          this.inGracePeriod.set(!!profile.inGracePeriod);
          this.gracePeriodDaysRemaining.set(profile.gracePeriodDaysRemaining || 0);
          this.isSubscriptionExpired.set(!!profile.isExpired || !!profile.expired);
        }
      },
      error: (err) => {
        console.error('Erreur chargement profil organisateur layout', err);
        this.userBusinessName.set('Mon Compte Organisateur');
      }
    });
  }

  protected toggleSidebar(): void {
    if (window.innerWidth < 992) {
      this.isSidebarMobileOpen.update(v => !v);
    } else {
      this.isSidebarOpen.update(v => !v);
    }
  }

  protected toggleSidebarMini(): void {
    this.isSidebarMini.update(v => !v);
  }

  protected toggleUserDropdown(): void {
    this.isUserDropdownOpen.update(v => !v);
  }

  protected closeSidebarMobile(): void {
    this.isSidebarMobileOpen.set(false);
  }

  protected logout(): void {
    this.authService.logout();
  }
}
