import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ClientAuthService } from '../../core/auth/services/client-auth.service';
import { CurrencyService } from '../../core/services/currency.service';
import { TranslatePipe } from '../../core/pipes/translate.pipe';

@Component({
  selector: 'app-client-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslatePipe],
  templateUrl: './client-dashboard.html',
  styleUrls: ['./client-dashboard.scss']
})
export class ClientDashboard {
  private readonly clientAuthService = inject(ClientAuthService);
  private readonly currencyService = inject(CurrencyService);

  public events = computed(() => this.clientAuthService.clientEvents());
  public currencySymbol = computed(() => this.currencyService.activeSymbol());
}
