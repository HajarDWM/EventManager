import { Component, inject, OnInit, OnDestroy, signal, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { GuestRsvp, PublicRsvpDetail } from '../events/components/guest-rsvp/guest-rsvp';

@Component({
  selector: 'app-template-preview-frame',
  standalone: true,
  imports: [CommonModule, GuestRsvp],
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="template-preview-frame-container">
      <app-guest-rsvp
        *ngIf="previewData()"
        [previewMode]="true"
        [previewData]="previewData()">
      </app-guest-rsvp>

      <div *ngIf="!previewData() && isLoading()" class="d-flex align-items-center justify-content-center text-white" style="min-height: 100vh; background: #0f172a;">
        <div class="spinner-border text-warning" role="status"></div>
      </div>
    </div>
  `,
  styles: [`
    html, body {
      margin: 0 !important;
      padding: 0 !important;
      width: 100% !important;
      height: 100% !important;
      background: #0f172a !important;
      overflow-x: hidden !important;
      overflow-y: auto !important;
      scrollbar-width: none !important;
      -ms-overflow-style: none !important;
    }
    html::-webkit-scrollbar,
    body::-webkit-scrollbar,
    *::-webkit-scrollbar {
      display: none !important;
      width: 0 !important;
      height: 0 !important;
    }
    * {
      scrollbar-width: none !important;
      -ms-overflow-style: none !important;
    }
    app-template-preview-frame {
      display: block;
      width: 100%;
      min-height: 100%;
      margin: 0;
      padding: 0;
      background: #0f172a;
    }
    .template-preview-frame-container {
      width: 100%;
      min-height: 100%;
      margin: 0;
      padding: 0;
    }
    .rsvp-luxury-wrapper {
      box-sizing: border-box !important;
      padding-top: 55px !important;
      padding-bottom: 25px !important;
    }
  `]
})
export class TemplatePreviewFrame implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly http = inject(HttpClient);

  public readonly previewData = signal<PublicRsvpDetail | null>(null);
  public readonly isLoading = signal<boolean>(true);

  private messageHandler = (event: MessageEvent) => {
    if (event.data && event.data.type === 'UPDATE_INVITATION_PREVIEW' && event.data.payload) {
      this.previewData.set(event.data.payload);
      this.isLoading.set(false);
    }
  };

  ngOnInit(): void {
    window.addEventListener('message', this.messageHandler);

    // Try reading directly from sessionStorage if available
    const cached = sessionStorage.getItem('active_template_preview_data');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed) {
          this.previewData.set(parsed);
          this.isLoading.set(false);
        }
      } catch (e) {}
    }

    // Read templateId or eventId from query params if passed
    const templateId = this.route.snapshot.queryParamMap.get('templateId');
    const eventId = this.route.snapshot.queryParamMap.get('eventId');

    if (!this.previewData() && templateId) {
      this.http.get<any>(`/api/templates/${templateId}`).subscribe({
        next: (tpl) => {
          const fallbackData: PublicRsvpDetail = {
            guestId: 0,
            guestName: 'Amine Idrissi',
            guestEmail: 'invite@example.com',
            guestPhone: '+212 600 000 000',
            guestStatus: 'PENDING',
            tableNumber: 'Table d\'Honneur',
            dietaryRequirements: '',
            eventId: eventId ? parseInt(eventId, 10) : 0,
            eventTitle: tpl.title || 'Soirée de Gala',
            eventDate: new Date().toISOString(),
            eventLocation: 'Casablanca, Ain Sebaa',
            digitalTemplateId: tpl.id,
            templateId: tpl.templateKey || (tpl.id === 1 ? 'fleurs-de-coton' : (tpl.id === 2 ? 'or-et-velours' : 'corporate-professional')),
            templateTitle: tpl.title,
            templateCategory: tpl.category || 'Soirée de Gala',
            decorativeFrame: tpl.decorativeFrame || 'gold-border',
            accentColor: tpl.accentColor || '#d4af37',
            backgroundColor: tpl.backgroundColor || '#0f172a',
            templateBackgroundImageUrl: tpl.backgroundImageUrl || tpl.imageUrl || undefined,
            templateBackgroundImageDesktopUrl: tpl.backgroundImageDesktopUrl || tpl.backgroundImageUrl || tpl.imageUrl || undefined,
            primaryFont: tpl.primaryFont || 'Cinzel',
            primaryFontSize: tpl.primaryFontSize || '2.8rem',
            secondaryFont: tpl.secondaryFont || 'Playfair Display',
            secondaryFontSize: tpl.secondaryFontSize || '0.9rem',
            secondaryFontColor: tpl.secondaryFontColor || '#e0e0e0',
            templateMusicUrl: tpl.musicUrl || '/assets/music/gala-ambient.mp3',
            openingAnimation: tpl.openingAnimation || 'none',
            visualParticles: tpl.visualParticles || 'confetti',
            invitationTitle: tpl.title || 'Soirée de Gala',
            invitationSubtitle: tpl.subCategory || tpl.category || 'Invitation d\'Exception',
            invitationDate: new Date().toISOString(),
            invitationLocation: 'Casablanca, Ain Sebaa',
            parkingLocation: 'Parking VIP disponible',
            mealType: 'PLATS_FIXES',
            paymentStatus: 'UNPAID',
            paidAmount: 0
          };
          this.previewData.set(fallbackData);
          this.isLoading.set(false);
        },
        error: () => this.isLoading.set(false)
      });
    }

    // Tell parent window we are ready to receive live data
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({ type: 'PREVIEW_FRAME_READY' }, '*');
    }
  }

  ngOnDestroy(): void {
    window.removeEventListener('message', this.messageHandler);
  }
}
