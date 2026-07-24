import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-pending-approval',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pending-approval.html'
})
export class PendingApproval {
  private readonly authService = inject(AuthService);

  protected onLogout(): void {
    this.authService.logout();
  }
}
