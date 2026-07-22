import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export interface CatererProfile {
  id?: number;
  businessName: string;
  email: string;
  accountStatus?: string;
  stripeCustomerId?: string;
  role?: string;
  subscriptionPlan?: string;
  subscriptionStatus?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

@Injectable({
  providedIn: 'root'
})
export class CatererService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/caterers';

  private readonly currentProfileSignal = signal<CatererProfile | null>(null);
  public readonly currentProfile = this.currentProfileSignal.asReadonly();

  public getCurrentProfile(): Observable<CatererProfile> {
    return this.http.get<CatererProfile>(`${this.apiUrl}/me`).pipe(
      tap(profile => this.currentProfileSignal.set(profile))
    );
  }

  public updateProfile(profile: Partial<CatererProfile>): Observable<CatererProfile> {
    return this.http.put<CatererProfile>(`${this.apiUrl}/me`, profile).pipe(
      tap(updated => {
        const current = this.currentProfileSignal();
        if (current) {
          this.currentProfileSignal.set({ ...current, ...updated });
        }
      })
    );
  }

  public changePassword(request: ChangePasswordRequest): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/me/password`, request);
  }

  public clearProfile(): void {
    this.currentProfileSignal.set(null);
  }
}
