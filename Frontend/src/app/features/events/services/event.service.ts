import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Event } from '../models/event.model';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/events';

  public getAllEvents(catererId?: number): Observable<Event[]> {
    let url = this.apiUrl;
    if (catererId) {
      url += `?catererId=${catererId}`;
    }
    return this.http.get<Event[]>(url);
  }

  public getEventById(id: number): Observable<Event> {
    return this.http.get<Event>(`${this.apiUrl}/${id}`);
  }

  public createEvent(event: Event): Observable<Event> {
    return this.http.post<Event>(this.apiUrl, event);
  }

  public updateEvent(id: number, event: Event): Observable<Event> {
    return this.http.put<Event>(`${this.apiUrl}/${id}`, event);
  }

  public deleteEvent(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  public setupInvitation(eventId: number, setupData: any): Observable<any> {
    return this.http.post<any>(`/api/organizer/events/${eventId}/invitation-setup`, setupData);
  }

  public regenerateClientToken(eventId: number): Observable<Event> {
    return this.http.post<Event>(`${this.apiUrl}/${eventId}/regenerate-client-token`, {});
  }
}
