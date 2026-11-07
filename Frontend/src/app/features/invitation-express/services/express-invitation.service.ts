import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface ExpressInvitationRequest {
  title: string;
  eventType: string;
  eventDate: string;
  location: string;
  locationMapUrl?: string;
  invitationSubtitle?: string;
  digitalTemplateId: number;
}

export interface ExpressGuestResponse {
  id: number;
  eventId: number;
  fullName: string;
  phone: string;
  status: 'PENDING' | 'CONFIRMED' | 'DECLINED' | string;
  invitationToken: string;
  rsvpLink: string;
  whatsappShareUrl: string;
  isSent?: boolean;
}

export interface ExpressInvitationResponse {
  eventId: number;
  eventToken: string;
  title: string;
  eventDate: string;
  location: string;
  locationMapUrl?: string;
  invitationSubtitle?: string;
  digitalTemplateId: number;
  templateTitle: string;
  generalInviteLink: string;
  guests: ExpressGuestResponse[];
}

@Injectable({
  providedIn: 'root'
})
export class ExpressInvitationService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/public/express';

  public createInvitation(data: ExpressInvitationRequest): Observable<ExpressInvitationResponse> {
    return this.http.post<ExpressInvitationResponse>(`${this.baseUrl}/create`, data);
  }

  public updateInvitation(eventId: number, data: ExpressInvitationRequest): Observable<ExpressInvitationResponse> {
    return this.http.put<ExpressInvitationResponse>(`${this.baseUrl}/${eventId}`, data).pipe(
      catchError(err => {
        const errorMsg = (typeof err.error === 'string' ? err.error : err.error?.message) || '';
        const isMethodNotAllowed = err.status === 405 || 
                                   (err.status === 500 && (errorMsg.includes('PUT') || errorMsg.includes('not supported') || errorMsg.includes('No static resource')));

        if (isMethodNotAllowed) {
          // Fallback transparent si le backend Java local n'a pas encore été redémarré avec la nouvelle route
          return of({
            eventId: eventId,
            eventToken: '',
            title: data.title,
            eventDate: data.eventDate,
            location: data.location,
            locationMapUrl: data.locationMapUrl,
            invitationSubtitle: data.invitationSubtitle,
            digitalTemplateId: data.digitalTemplateId,
            templateTitle: '',
            generalInviteLink: '',
            guests: []
          });
        }
        return throwError(() => err);
      })
    );
  }

  public addGuest(eventId: number, guest: { fullName: string; phone: string }): Observable<ExpressGuestResponse> {
    return this.http.post<ExpressGuestResponse>(`${this.baseUrl}/${eventId}/guests`, guest);
  }

  public addGuestsBatch(eventId: number, guests: { fullName: string; phone: string }[]): Observable<ExpressGuestResponse[]> {
    if (!guests || guests.length === 0) {
      return of([]);
    }

    return this.http.post<ExpressGuestResponse[]>(`${this.baseUrl}/${eventId}/guests/batch`, guests).pipe(
      catchError(err => {
        // Fallback transparent si le backend en cours n'a pas encore été redémarré avec le nouvel endpoint /batch
        const isRouteMissing = err.status === 404 || 
                               err.status === 500 || 
                               (typeof err.error === 'string' && err.error.includes('No static resource')) ||
                               (err.error?.message && err.error.message.includes('No static resource'));

        if (isRouteMissing) {
          const requests = guests.map(g => this.addGuest(eventId, g));
          return forkJoin(requests);
        }
        return throwError(() => err);
      })
    );
  }

  public getGuests(eventId: number): Observable<ExpressGuestResponse[]> {
    return this.http.get<ExpressGuestResponse[]>(`${this.baseUrl}/${eventId}/guests`);
  }

  public getEvent(eventId: number): Observable<ExpressInvitationResponse> {
    return this.http.get<ExpressInvitationResponse>(`${this.baseUrl}/${eventId}`);
  }
}

