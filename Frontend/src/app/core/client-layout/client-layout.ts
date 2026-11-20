import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ClientAuthService } from '../auth/services/client-auth.service';
import { LanguageSwitcher } from '../../shared/components/language-switcher/language-switcher';
import { TranslatePipe } from '../pipes/translate.pipe';
import { APP_VERSION } from '../constants/version.constant';

@Component({
  selector: 'app-client-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule, LanguageSwitcher, TranslatePipe],
  templateUrl: './client-layout.html',
  styleUrls: ['./client-layout.scss']
})
export class ClientLayout implements OnInit {
  private readonly clientAuthService = inject(ClientAuthService);
  public readonly appVersion = APP_VERSION;
  public events = this.clientAuthService.clientEvents;

  ngOnInit() {
    if (typeof document !== 'undefined') {
      document.documentElement.dir = 'ltr';
    }
    if (this.events().length === 0) {
      this.clientAuthService.fetchEvents().subscribe();
    }
  }

  public logout(): void {
    this.clientAuthService.logout();
  }
}
