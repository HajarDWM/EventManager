import { Component, inject, computed, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ClientAuthService } from '../../core/auth/services/client-auth.service';
import { GuestRsvp, PublicRsvpDetail } from '../events/components/guest-rsvp/guest-rsvp';
import { TranslatePipe } from '../../core/pipes/translate.pipe';

@Component({
  selector: 'app-client-invitation-preview',
  standalone: true,
  imports: [CommonModule, RouterLink, GuestRsvp, TranslatePipe],
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
      (ev.digitalTemplateId && (t.id === ev.digitalTemplateId || String(t.id) === String(ev.digitalTemplateId))) ||
      (ev.templateId && (
        t.templateKey === ev.templateId || 
        t.templateKey?.toLowerCase() === ev.templateId?.toLowerCase() || 
        String(t.id) === String(ev.templateId)
      ))
    ) || allTemplates.find(t => t.templateKey === 'or-et-velours') || (allTemplates.length > 0 ? allTemplates[0] : null);

    const bgUrl = tpl?.backgroundImageUrl || ev.templateBackgroundImageUrl || tpl?.imageUrl || undefined;
    const bgDesktopUrl = tpl?.backgroundImageDesktopUrl || ev.templateBackgroundImageDesktopUrl || tpl?.backgroundImageUrl || ev.templateBackgroundImageUrl || tpl?.imageUrl || undefined;

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
      digitalTemplateId: ev.digitalTemplateId || (tpl ? tpl.id : undefined),
      templateId: tpl?.templateKey || ev.templateId,
      templateTitle: tpl?.title,
      templateCategory: tpl?.category || 'Mariage',
      templateSubCategory: tpl?.subCategory || '',
      decorativeFrame: tpl?.decorativeFrame || 'gold-border',
      accentColor: tpl?.accentColor || '#d4af37',
      backgroundColor: tpl?.backgroundColor || '#080808',
      templateBackgroundImageUrl: bgUrl,
      templateBackgroundImageDesktopUrl: bgDesktopUrl,
      primaryFont: tpl?.primaryFont,
      primaryFontSize: tpl?.primaryFontSize,
      primaryFontWeight: tpl?.primaryFontWeight,
      primaryLetterSpacing: tpl?.primaryLetterSpacing,
      secondaryFont: tpl?.secondaryFont,
      secondaryFontSize: tpl?.secondaryFontSize,
      secondaryFontWeight: tpl?.secondaryFontWeight,
      secondaryLetterSpacing: tpl?.secondaryLetterSpacing,
      secondaryFontColor: tpl?.secondaryFontColor,
      templateMusicUrl: tpl?.musicUrl,
      openingAnimation: tpl?.openingAnimation || 'none',
      visualParticles: tpl?.visualParticles || 'none',
      backgroundMotion: tpl?.backgroundMotion || 'ken-burns',
      contentEntrance: tpl?.contentEntrance || 'staggered-royal',
      showCountdown: true,
      showCalendarButton: true,
      showMapRoute: true,
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
    this.clientAuthService.fetchEvents().subscribe();
    this.http.get<any[]>('/api/templates').subscribe({
      next: (data) => this.templates.set(data),
      error: (err) => console.error('Failed to load templates in preview', err)
    });
  }
}
