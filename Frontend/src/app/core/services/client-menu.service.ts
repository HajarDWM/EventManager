import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MenuItem } from './menu-item.service';

@Injectable({
  providedIn: 'root'
})
export class ClientMenuService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:8080/api/v1/client/events';

  public getMenuItemsByEvent(eventId: number): Observable<MenuItem[]> {
    return this.http.get<MenuItem[]>(`${this.baseUrl}/${eventId}/menu-items`);
  }
}
