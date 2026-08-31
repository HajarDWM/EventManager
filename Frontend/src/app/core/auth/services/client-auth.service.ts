import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, of } from 'rxjs';
import { Event } from '../../../features/events/models/event.model';

@Injectable({
  providedIn: 'root'
})
export class ClientAuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  
  private readonly tokenKey = 'client_auth_token';
  
  // Signal to store current client's events
  public readonly clientEvents = signal<Event[]>([]);
  public readonly isAuthenticated = signal<boolean>(this.isTokenPresent());

  private isTokenPresent(): boolean {
    return !!localStorage.getItem(this.tokenKey);
  }

  public getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  public login(accessLinkToken: string): Observable<any> {
    return this.http.post<any>('/api/v1/client/auth/login', { accessLinkToken }).pipe(
      tap(response => {
        if (response && response.token) {
          localStorage.setItem(this.tokenKey, response.token);
          this.isAuthenticated.set(true);
          
          if (response.events) {
            this.clientEvents.set(response.events);
          }
        }
      })
    );
  }

  public logout(): void {
    localStorage.removeItem(this.tokenKey);
    this.isAuthenticated.set(false);
    this.clientEvents.set([]);
    this.router.navigate(['/client/login']);
  }

  public fetchEvents(): Observable<any> {
    if (!this.isTokenPresent()) return of([]);
    return this.http.get<Event[]>('/api/v1/client/events').pipe(
      tap(events => {
        if (events) {
          this.clientEvents.set(events);
        }
      })
    );
  }
}
