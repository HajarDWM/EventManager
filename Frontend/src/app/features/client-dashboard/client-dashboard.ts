import { Component, inject, computed, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { ClientAuthService } from '../../core/auth/services/client-auth.service';
import { CurrencyService } from '../../core/services/currency.service';
import { TranslatePipe } from '../../core/pipes/translate.pipe';
import { Event } from '../events/models/event.model';

@Component({
  selector: 'app-client-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TranslatePipe],
  templateUrl: './client-dashboard.html',
  styleUrls: ['./client-dashboard.scss']
})
export class ClientDashboard implements OnInit {
  private readonly clientAuthService = inject(ClientAuthService);
  private readonly currencyService = inject(CurrencyService);
  private readonly route = inject(ActivatedRoute);

  public readonly events = computed(() => this.clientAuthService.clientEvents());
  public readonly currencySymbol = computed(() => this.currencyService.activeSymbol());

  public readonly selectedEventId = signal<number | null>(null);

  public readonly activeEvent = computed<Event | null>(() => {
    const list = this.events();
    if (!list || list.length === 0) return null;

    const currentId = this.selectedEventId();
    if (currentId) {
      const found = list.find(e => e.id === currentId);
      if (found) return found;
    }
    return list[0];
  });

  public ngOnInit(): void {
    // 1. Check if eventId was passed in route queryParams
    this.route.queryParams.subscribe(params => {
      const qId = params['eventId'];
      if (qId) {
        const parsed = Number(qId);
        this.selectedEventId.set(parsed);
        localStorage.setItem('active_client_event_id', String(parsed));
      } else {
        // 2. Otherwise restore last selected event from localStorage
        const cachedId = localStorage.getItem('active_client_event_id');
        if (cachedId) {
          this.selectedEventId.set(Number(cachedId));
        }
      }
    });

    // If client events haven't loaded yet, fetch them
    if (this.events().length === 0) {
      this.clientAuthService.fetchEvents().subscribe();
    }
  }

  public selectEvent(eventId: number | string): void {
    const parsed = Number(eventId);
    this.selectedEventId.set(parsed);
    localStorage.setItem('active_client_event_id', String(parsed));
  }
}
