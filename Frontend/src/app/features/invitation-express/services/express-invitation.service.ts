import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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

  public addGuest(eventId: number, guest: { fullName: string; phone: string }): Observable<ExpressGuestResponse> {
    return this.http.post<ExpressGuestResponse>(`${this.baseUrl}/${eventId}/guests`, guest);
  }

  public getGuests(eventId: number): Observable<ExpressGuestResponse[]> {
    return this.http.get<ExpressGuestResponse[]>(`${this.baseUrl}/${eventId}/guests`);
  }

  public getEvent(eventId: number): Observable<ExpressInvitationResponse> {
    return this.http.get<ExpressInvitationResponse>(`${this.baseUrl}/${eventId}`);
  }
}

