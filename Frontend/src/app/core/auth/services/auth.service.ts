import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { CatererService } from '../../services/caterer.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly catererService = inject(CatererService);
  private readonly tokenKey = 'auth_token';

  // Signal pour l'état de connexion réactif dans l'UI
  public readonly isAuthenticated = signal<boolean>(this.isTokenPresent());

  private isTokenPresent(): boolean {
    return !!localStorage.getItem(this.tokenKey);
  }

  public getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  public login(credentials: any): Observable<any> {
    return this.http.post<any>('/api/auth/login', credentials).pipe(
      tap(response => {
        if (response && response.token) {
          localStorage.setItem(this.tokenKey, response.token);
          this.isAuthenticated.set(true);
        }
      })
    );
  }

  public register(caterer: any): Observable<any> {
    return this.http.post<any>('/api/auth/register', caterer);
  }

  public logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem('caterer'); // Nettoyer aussi le caterer stocké s'il existe
    this.catererService.clearProfile();
    this.isAuthenticated.set(false);
    this.router.navigate(['/login']);
  }
}
