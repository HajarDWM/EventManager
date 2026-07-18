import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../auth/services/auth.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './layout.html',
  styleUrl: './layout.scss'
})
export class Layout {
  private readonly authService = inject(AuthService);

  // Signaux réactifs pour contrôler le layout
  protected readonly isSidebarOpen = signal(true);
  protected readonly isSidebarMobileOpen = signal(false);
  protected readonly isSidebarMini = signal(false);
  protected readonly isUserDropdownOpen = signal(false);

  // Informations utilisateur simulées pour le moment
  protected readonly userBusinessName = signal('Mon Traiteur Premium');
  protected readonly userEmail = signal('caterer@example.com');

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
