import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html'
})
export class Dashboard {
  protected readonly eventCount = signal(12);
  protected readonly guestCount = signal(1450);
  protected readonly messageCount = signal(5);
  protected readonly accountStatus = signal('ACTIF');
}
