import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Guest } from './guest.service';

@Injectable({
  providedIn: 'root'
})
export class ClientGuestService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/v1/client';

  public getGuestsByEvent(eventId: number): Observable<Guest[]> {
    return this.http.get<Guest[]>(`${this.apiUrl}/events/${eventId}/guests`);
  }

  public createGuest(eventId: number, guest: Guest): Observable<Guest> {
    return this.http.post<Guest>(`${this.apiUrl}/events/${eventId}/guests`, guest);
  }

  public updateGuest(eventId: number, guestId: number, guest: Guest): Observable<Guest> {
    return this.http.put<Guest>(`${this.apiUrl}/events/${eventId}/guests/${guestId}`, guest);
  }

  public deleteGuest(eventId: number, guestId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/events/${eventId}/guests/${guestId}`);
  }

  public downloadTemplate(eventId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/events/${eventId}/guests/template`, { responseType: 'blob' });
  }

  public batchAssignTable(eventId: number, groupName: string, tableNumber: string, confirmedOnly: boolean = true): Observable<Guest[]> {
    return this.http.put<Guest[]>(`${this.apiUrl}/events/${eventId}/guests/batch-assign-table`, {}, {
      params: {
        groupName: groupName,
        tableNumber: tableNumber,
        confirmedOnly: confirmedOnly
      }
    });
  }
}
