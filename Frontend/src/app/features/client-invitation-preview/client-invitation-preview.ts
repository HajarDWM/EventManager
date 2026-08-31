import { Component, inject, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ClientAuthService } from '../../core/auth/services/client-auth.service';
import { GuestRsvp, PublicRsvpDetail } from '../events/components/guest-rsvp/guest-rsvp';

@Component({
  selector: 'app-client-invitation-preview',
  standalone: true,
  imports: [CommonModule, RouterLink, GuestRsvp],
  templateUrl: './client-invitation-preview.html',
  styleUrls: ['./client-invitation-preview.scss']
})
export class ClientInvitationPreview implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly clientAuthService = inject(ClientAuthService);

  public eventId = computed(() => {
    const id = this.route.snapshot.paramMap.get('id');
    return id ? parseInt(id, 10) : null;
  });

  public event = computed(() => {
    const id = this.eventId();
    const events = this.clientAuthService.clientEvents();
    return events.find(e => e.id === id);
  });

  public rsvpPreviewData = computed<PublicRsvpDetail | null>(() => {
    const ev = this.event();
    if (!ev) return null;

    // We don't have all exact fields (like template category, styling fields) directly on the Event interface in frontend,
    // so we map what we have, and some properties might be mapped based on what's available.
    return {
      guestId: 0,
      guestName: 'Cher Invité(e)',
      guestEmail: 'invite@example.com',
      guestPhone: '',
      guestStatus: 'PENDING',
      tableNumber: '',
      dietaryRequirements: '',
      eventId: ev.id || 0,
      eventTitle: ev.title,
      eventDate: ev.eventDate,
      eventLocation: ev.location,
      locationMapUrl: ev.locationMapUrl,
      digitalTemplateId: ev.digitalTemplateId,
      templateId: ev.templateId,
      invitationTitle: ev.invitationTitle,
      invitationSubtitle: ev.invitationSubtitle,
      invitationDate: ev.invitationDate,
      invitationLocation: ev.invitationLocation,
      parkingLocation: ev.parkingLocation,
      mealType: ev.mealType,
      // Map other potential fields if they are fetched in the event model, or rely on GuestRsvp fallbacks
      isPaidEvent: ev.isPaidEvent,
      ticketPrice: ev.ticketPrice,
      currency: ev.currency,
      paymentStatus: 'UNPAID',
      paidAmount: 0,
      templateBackgroundImageUrl: ev.templateBackgroundImageUrl
    };
  });

  ngOnInit() {
    // Si la liste d'événements est vide, on peut rafraîchir
    if (this.clientAuthService.clientEvents().length === 0) {
      this.clientAuthService.fetchEvents().subscribe();
    }
  }
}
