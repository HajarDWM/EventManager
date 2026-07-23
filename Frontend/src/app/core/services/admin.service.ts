import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AdminStats {
  totalCaterers: number;
  totalEvents: number;
  totalGuests: number;
  catererStatusDistribution: Record<string, number>;
  subscriptionPlanDistribution: Record<string, number>;
  eventsStatusDistribution: Record<string, number>;
}

export interface InvitationTemplate {
  id?: number;
  name: string;
  subject: string;
  content: string;
}

export interface BillingSettings {
  id?: number;
  vatRate: number;
  currency: string;
  subscriptionPriceStandard: number;
  subscriptionPricePremium: number;
  billingContactEmail: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/admin';

  // === STATISTIQUES GLOBALES ===
  public getGlobalStats(): Observable<AdminStats> {
    return this.http.get<AdminStats>(`${this.apiUrl}/stats`);
  }

  // === GESTION DES COMPTES TRAITEURS ===
  public getAllCaterers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/caterers`);
  }

  public updateCatererStatusAndSubscription(
    id: number, 
    accountStatus?: string, 
    plan?: string, 
    subscriptionStatus?: string,
    subscriptionStartDate?: string,
    subscriptionEndDate?: string
  ): Observable<any> {
    let params = new HttpParams();
    if (accountStatus) {
      params = params.set('accountStatus', accountStatus);
    }
    if (plan) {
      params = params.set('plan', plan);
    }
    if (subscriptionStatus) {
      params = params.set('subscriptionStatus', subscriptionStatus);
    }
    if (subscriptionStartDate) {
      params = params.set('subscriptionStartDate', subscriptionStartDate);
    }
    if (subscriptionEndDate) {
      params = params.set('subscriptionEndDate', subscriptionEndDate);
    }

    return this.http.put<any>(`${this.apiUrl}/caterers/${id}`, {}, { params });
  }

  public createCaterer(caterer: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/caterers`, caterer);
  }

  // === GESTION DES TEMPLATES D'INVITATION ===
  public getAllTemplates(): Observable<InvitationTemplate[]> {
    return this.http.get<InvitationTemplate[]>(`${this.apiUrl}/invitation-templates`);
  }

  public getTemplateById(id: number): Observable<InvitationTemplate> {
    return this.http.get<InvitationTemplate>(`${this.apiUrl}/invitation-templates/${id}`);
  }

  public createTemplate(template: InvitationTemplate): Observable<InvitationTemplate> {
    return this.http.post<InvitationTemplate>(`${this.apiUrl}/invitation-templates`, template);
  }

  public updateTemplate(id: number, template: InvitationTemplate): Observable<InvitationTemplate> {
    return this.http.put<InvitationTemplate>(`${this.apiUrl}/invitation-templates/${id}`, template);
  }

  public deleteTemplate(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/invitation-templates/${id}`);
  }

  // === PARAMÈTRES DE FACTURATION ===
  public getBillingSettings(): Observable<BillingSettings> {
    return this.http.get<BillingSettings>(`${this.apiUrl}/billing-settings`);
  }

  public updateBillingSettings(settings: BillingSettings): Observable<BillingSettings> {
    return this.http.put<BillingSettings>(`${this.apiUrl}/billing-settings`, settings);
  }
}
