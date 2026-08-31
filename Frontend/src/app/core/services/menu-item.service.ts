import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface MenuItem {
  id?: number;
  eventId?: number;
  name: string;
  category: 'STARTER' | 'MAIN' | 'DESSERT' | 'BEVERAGE' | string;
  pricePerPerson: number;
  dietaryTag?: string;
  description?: string;
  imageUrl?: string;
  selectedCount?: number;
}

@Injectable({
  providedIn: 'root'
})
export class MenuItemService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:8080/api';

  public getMenuItemsByEvent(eventId: number): Observable<MenuItem[]> {
    return this.http.get<MenuItem[]>(`${this.baseUrl}/events/${eventId}/menu-items`);
  }

  public getCatererMenuItems(): Observable<MenuItem[]> {
    return this.http.get<MenuItem[]>(`${this.baseUrl}/menu-items`);
  }

  public createMenuItem(eventId: number, menuItem: MenuItem): Observable<MenuItem> {
    return this.http.post<MenuItem>(`${this.baseUrl}/events/${eventId}/menu-items`, menuItem);
  }

  public updateMenuItem(id: number, menuItem: MenuItem): Observable<MenuItem> {
    return this.http.put<MenuItem>(`${this.baseUrl}/menu-items/${id}`, menuItem);
  }

  public deleteMenuItem(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/menu-items/${id}`);
  }
}
