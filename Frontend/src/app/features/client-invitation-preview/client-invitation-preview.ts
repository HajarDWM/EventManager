import { Component, inject, computed, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
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
  private readonly http = inject(HttpClient);

  public readonly templates = signal<any[]>([]);

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

    const allTemplates = this.templates();
    const tpl = allTemplates.find(t => 
      (ev.digitalTemplateId && t.id === ev.digitalTemplateId) ||
      (ev.templateId && t.templateKey === ev.templateId)
    ) || allTemplates.find(t => t.templateKey === 'or-et-velours') || (allTemplates.length > 0 ? allTemplates[0] : null);

    return {
      guestId: 0,
      guestName: 'Cher(e) Invité(e)',
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
      templateId: tpl?.templateKey || ev.templateId,
      templateTitle: tpl?.title,
      templateCategory: tpl?.category || 'Mariage',
      decorativeFrame: tpl?.decorativeFrame,
      accentColor: tpl?.accentColor,
      backgroundColor: tpl?.backgroundColor,
      templateBackgroundImageUrl: tpl?.backgroundImageUrl || ev.templateBackgroundImageUrl,
      primaryFont: tpl?.primaryFont,
      primaryFontSize: tpl?.primaryFontSize,
      secondaryFont: tpl?.secondaryFont,
      secondaryFontSize: tpl?.secondaryFontSize,
      secondaryFontColor: tpl?.secondaryFontColor,
      templateMusicUrl: tpl?.musicUrl,
      invitationTitle: ev.invitationTitle,
      invitationSubtitle: ev.invitationSubtitle,
      invitationDate: ev.invitationDate,
      invitationLocation: ev.invitationLocation,
      parkingLocation: ev.parkingLocation,
      mealType: ev.mealType,
      isPaidEvent: ev.isPaidEvent,
      ticketPrice: ev.ticketPrice,
      currency: ev.currency,
      paymentStatus: 'UNPAID',
      paidAmount: 0
    };
  });

  ngOnInit() {
    if (this.clientAuthService.clientEvents().length === 0) {
      this.clientAuthService.fetchEvents().subscribe();
    }
    this.http.get<any[]>('/api/templates').subscribe({
      next: (data) => this.templates.set(data),
      error: (err) => console.error('Failed to load templates in preview', err)
    });
  }
}
