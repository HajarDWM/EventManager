import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ClientAuthService } from '../../core/auth/services/client-auth.service';

@Component({
  selector: 'app-client-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './client-dashboard.html',
  styleUrls: ['./client-dashboard.scss']
})
export class ClientDashboard {
  private readonly clientAuthService = inject(ClientAuthService);

  public events = computed(() => this.clientAuthService.clientEvents());
}
