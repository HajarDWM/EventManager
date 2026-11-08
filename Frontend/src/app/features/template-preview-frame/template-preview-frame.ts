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
    /* Base Frame Reset & Smooth Scroll */
    html, body {
      margin: 0 !important;
      padding: 0 !important;
      width: 100% !important;
      min-height: 100% !important;
      background: #0f172a !important;
      overflow-x: hidden !important;
      overflow-y: auto !important;
      scrollbar-width: thin !important;
      scrollbar-color: rgba(212, 175, 55, 0.5) rgba(15, 23, 42, 0.6) !important;
      -webkit-overflow-scrolling: touch !important;
    }
    html::-webkit-scrollbar,
    body::-webkit-scrollbar {
      width: 6px !important;
    }
    html::-webkit-scrollbar-track,
    body::-webkit-scrollbar-track {
      background: rgba(15, 23, 42, 0.6) !important;
    }
    html::-webkit-scrollbar-thumb,
    body::-webkit-scrollbar-thumb {
      background: rgba(212, 175, 55, 0.5) !important;
      border-radius: 10px !important;
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

    /* Outer Wrapper: Start smoothly from top so contents never clip into negative scroll */
    .rsvp-luxury-wrapper {
      box-sizing: border-box !important;
      min-height: 100% !important;
      height: auto !important;
      display: flex !important;
      flex-direction: column !important;
      justify-content: flex-start !important;
      align-items: center !important;
      padding-top: 14px !important;
      padding-bottom: 24px !important;
      padding-left: 10px !important;
      padding-right: 10px !important;
    }

    .invitation-outer-container {
      margin: 0 auto !important;
      width: 100% !important;
    }

    /* Top Floating Audio & Language Widgets: Compact & Centered */
    .floating-music-widget {
      position: relative !important;
      top: 0 !important;
      left: auto !important;
      transform: none !important;
      margin: 0 auto 8px !important;
      display: inline-flex !important;
      justify-content: center !important;
      z-index: 10 !important;
    }

    .floating-lang-widget {
      position: relative !important;
      top: 0 !important;
      right: auto !important;
      transform: none !important;
      margin: 0 auto 8px !important;
      display: flex !important;
      justify-content: center !important;
      z-index: 10 !important;
    }

    /* Luxury Card: Enclose all elements, NEVER clip buttons */
    .rsvp-luxury-wrapper .luxury-card,
    .luxury-card {
      overflow: visible !important;
      height: auto !important;
      min-height: auto !important;
      max-height: none !important;
      aspect-ratio: auto !important;
      display: flex !important;
      flex-direction: column !important;
      margin: 0 auto !important;
    }

    .rsvp-luxury-wrapper .luxury-inner-border,
    .luxury-inner-border {
      overflow: visible !important;
      height: auto !important;
      min-height: auto !important;
      padding: 16px 14px 14px !important;
      display: flex !important;
      flex-direction: column !important;
      justify-content: flex-start !important;
      align-items: center !important;
      width: 100% !important;
    }

    /* Text & Salutation */
    .invitation-dynamic-text-overlay {
      width: 100% !important;
      max-width: 100% !important;
      overflow: visible !important;
    }

    .invitation-header-tag {
      margin-top: 2px !important;
      margin-bottom: 4px !important;
    }

    .invitation-main-title {
      margin-bottom: 6px !important;
      font-size: clamp(1.6rem, 3.8vw, 2.4rem) !important;
      line-height: 1.15 !important;
    }

    .invitation-guest-salutation {
      padding: 6px 12px !important;
      margin: 0 auto 8px !important;
      max-width: 100% !important;
    }

    .salutation-invitation-message {
      font-size: 0.84rem !important;
      line-height: 1.35 !important;
      margin-top: 3px !important;
    }

    /* Twin Details Cards (Date & Location): Compact & Symmetrical */
    .artistic-invitation-details {
      margin: 6px auto 10px !important;
      gap: 10px !important;
    }

    .artistic-detail-card {
      min-height: 100px !important;
      padding: 8px 6px !important;
      border-radius: 14px !important;
    }

    .detail-card-icon-circle {
      width: 28px !important;
      height: 28px !important;
      font-size: 0.8rem !important;
      margin-bottom: 2px !important;
    }

    .hero-event-day-number {
      font-size: 1.65rem !important;
      line-height: 1 !important;
      margin: 1px 0 !important;
    }

    .event-card-day-label,
    .event-card-month-label {
      font-size: 0.65rem !important;
      line-height: 1.1 !important;
    }

    .detail-card-subtitle {
      font-size: 0.6rem !important;
      margin-bottom: 2px !important;
    }

    .detail-card-main-title {
      font-size: 0.8rem !important;
      line-height: 1.2 !important;
    }

    .detail-card-bottom-info {
      font-size: 0.68rem !important;
      margin-top: 3px !important;
    }

    /* Staggered Cinematic Entrance: Buttons appear as the LAST element (آخر حاجة) */
    .content-entrance-staggered,
    .content-entrance-lateral,
    .content-entrance-golden,
    .content-entrance-unfold {
      .stage-header {
        animation-delay: 0.4s !important;
      }
      .stage-title {
        animation-delay: 1.2s !important;
      }
      .stage-salutation {
        animation-delay: 2.0s !important;
      }
      .stage-details {
        animation-delay: 2.8s !important;
      }
      .stage-actions {
        animation-delay: 3.6s !important;
        animation-fill-mode: forwards !important;
      }
    }

    /* ACTION BUTTONS (Accepter / Décliner): Beautiful layout respecting animation sequence */
    .page1-actions-container {
      display: block !important;
      margin-top: 10px !important;
      margin-bottom: 8px !important;
      width: 100% !important;
      z-index: 10 !important;
    }

    .page1-decision-buttons {
      display: flex !important;
      justify-content: center !important;
      align-items: center !important;
      gap: 12px !important;
      flex-wrap: nowrap !important;
    }

    .btn-decision-accept,
    .btn-decision-decline {
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;
      padding: 8px 18px !important;
      font-size: 0.85rem !important;
      font-weight: 800 !important;
      border-radius: 999px !important;
      letter-spacing: 0.5px !important;
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.35) !important;
      min-height: 38px !important;
      cursor: pointer !important;
    }

    /* Desktop Viewport Refinements */
    @media (min-width: 992px) {
      .rsvp-luxury-wrapper {
        padding-top: 20px !important;
        padding-bottom: 30px !important;
      }
      .rsvp-luxury-wrapper .luxury-card,
      .luxury-card {
        max-width: 860px !important;
        aspect-ratio: auto !important;
        min-height: auto !important;
      }
      .rsvp-luxury-wrapper .luxury-inner-border,
      .luxury-inner-border {
        padding: 24px 32px 18px !important;
      }
      .artistic-invitation-details {
        max-width: 700px !important;
        margin: 10px auto 14px !important;
        gap: 16px !important;
      }
      .artistic-detail-card {
        min-height: 110px !important;
        padding: 10px 14px !important;
      }
      .page1-actions-container {
        margin-top: 14px !important;
      }
      .btn-decision-accept,
      .btn-decision-decline {
        padding: 10px 24px !important;
        font-size: 0.95rem !important;
      }
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
            backgroundMotion: tpl.backgroundMotion || 'ken-burns',
            contentEntrance: tpl.contentEntrance || 'staggered-royal',
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
        error: () => {
          const tId = templateId ? parseInt(templateId, 10) : 1;
          const fallbackData: PublicRsvpDetail = {
            guestId: 0,
            guestName: 'Cher(e) Invité(e)',
            guestEmail: 'invite@example.com',
            guestPhone: '+212 600 000 000',
            guestStatus: 'PENDING',
            tableNumber: 'Table d\'Honneur',
            dietaryRequirements: '',
            eventId: eventId ? parseInt(eventId, 10) : 0,
            eventTitle: 'Notre Célébration',
            eventDate: new Date().toISOString(),
            eventLocation: 'Casablanca, Maroc',
            digitalTemplateId: tId,
            templateId: tId === 1 ? 'fleurs-de-coton' : (tId === 2 ? 'or-et-velours' : (tId === 3 ? 'corporate-professional' : 'fleurs-de-coton')),
            templateTitle: 'Modèle ' + tId,
            templateCategory: 'Célébration',
            decorativeFrame: 'gold-border',
            accentColor: '#d4af37',
            backgroundColor: '#0f172a',
            primaryFont: 'Cinzel',
            primaryFontSize: '2.8rem',
            secondaryFont: 'Playfair Display',
            secondaryFontSize: '0.9rem',
            secondaryFontColor: '#e0e0e0',
            templateMusicUrl: '/assets/music/gala-ambient.mp3',
            openingAnimation: 'none',
            visualParticles: 'confetti',
            backgroundMotion: 'ken-burns',
            contentEntrance: 'staggered-royal',
            invitationTitle: 'Notre Célébration',
            invitationSubtitle: 'Invitation Officielle',
            invitationDate: new Date().toISOString(),
            invitationLocation: 'Casablanca, Maroc',
            parkingLocation: 'Parking VIP disponible',
            paymentStatus: 'UNPAID',
            paidAmount: 0
          };
          this.previewData.set(fallbackData);
          this.isLoading.set(false);
        }
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
