import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export type GuestStatus = 'PENDING' | 'CONFIRMED' | 'DECLINED';

export interface Guest {
  id?: number;
  eventId?: number;
  fullName: string;
  email?: string;
  phone?: string;
  status: GuestStatus;
  tableNumber?: string;
  dietaryRequirements?: string;
  isSent?: boolean;
  invitationStatus?: 'PENDING' | 'SENT' | string;
}

@Injectable({
  providedIn: 'root'
})
export class GuestService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api';

  public getGuestsByEvent(eventId: number): Observable<Guest[]> {
    return this.http.get<Guest[]>(`${this.apiUrl}/events/${eventId}/guests`);
  }

  public createGuest(eventId: number, guest: Guest): Observable<Guest> {
    return this.http.post<Guest>(`${this.apiUrl}/events/${eventId}/guests`, guest);
  }

  public updateGuest(guestId: number, guest: Guest): Observable<Guest> {
    return this.http.put<Guest>(`${this.apiUrl}/guests/${guestId}`, guest);
  }

  public deleteGuest(guestId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/guests/${guestId}`);
  }
}
