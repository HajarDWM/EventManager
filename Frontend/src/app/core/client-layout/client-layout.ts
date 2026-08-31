import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ClientAuthService } from '../auth/services/client-auth.service';

@Component({
  selector: 'app-client-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './client-layout.html',
  styleUrls: ['./client-layout.scss']
})
export class ClientLayout implements OnInit {
  private readonly clientAuthService = inject(ClientAuthService);
  public events = this.clientAuthService.clientEvents;

  ngOnInit() {
    if (this.events().length === 0) {
      this.clientAuthService.fetchEvents().subscribe();
    }
  }

  public logout(): void {
    this.clientAuthService.logout();
  }
}
