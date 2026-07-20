import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CatererProfile {
  id?: number;
  businessName: string;
  email: string;
  accountStatus?: string;
  stripeCustomerId?: string;
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

  public getCurrentProfile(): Observable<CatererProfile> {
    return this.http.get<CatererProfile>(`${this.apiUrl}/me`);
  }

  public updateProfile(profile: Partial<CatererProfile>): Observable<CatererProfile> {
    return this.http.put<CatererProfile>(`${this.apiUrl}/me`, profile);
  }

  public changePassword(request: ChangePasswordRequest): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/me/password`, request);
  }
}
