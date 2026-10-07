import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClientAuthService } from '../../core/auth/services/client-auth.service';
import { TranslatePipe } from '../../core/pipes/translate.pipe';

@Component({
  selector: 'app-client-profile',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './client-profile.html',
  styleUrls: ['./client-profile.scss']
})
export class ClientProfile {
  private readonly clientAuthService = inject(ClientAuthService);

  public events = computed(() => this.clientAuthService.clientEvents());
}
