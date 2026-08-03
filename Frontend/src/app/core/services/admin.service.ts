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
  public getAllCaterers(status?: string): Observable<any[]> {
    let params = new HttpParams();
    if (status) {
      params = params.set('status', status);
    }
    return this.http.get<any[]>(`${this.apiUrl}/caterers`, { params });
  }

  public getCatererById(id: number): Observable<any> {
    return new Observable<any>(observer => {
      this.getAllCaterers().subscribe({
        next: (caterers) => {
          const found = caterers.find(c => c.id === id);
          if (found) {
            observer.next(found);
            observer.complete();
          } else {
            observer.error(new Error('Compte organisateur introuvable.'));
          }
        },
        error: (err) => observer.error(err)
      });
    });
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

  // === AUDIT FINANCIER & TRANSACTIONS ===
  public getTransactions(search?: string, period?: string, page = 0, size = 10): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    if (search) {
      params = params.set('search', search);
    }
    if (period) {
      params = params.set('period', period);
    }
    return this.http.get<any>(`${this.apiUrl}/transactions`, { params });
  }

  public getFinancialStats(period: string): Observable<any> {
    const params = new HttpParams().set('period', period);
    return this.http.get<any>(`${this.apiUrl}/transactions/stats`, { params });
  }

  public downloadTransactionsCsv(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/transactions/export/csv`, { responseType: 'blob' });
  }

  // === GESTION DES DÉPENSES PLATEFORME ===
  public getAllExpenses(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/expenses`);
  }

  public createExpense(expense: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/expenses`, expense);
  }

  public updateExpense(id: number, expense: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/expenses/${id}`, expense);
  }

  public deleteExpense(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/expenses/${id}`);
  }
}
