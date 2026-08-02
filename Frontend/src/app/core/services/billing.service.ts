import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface QuoteItemDTO {
  id?: number;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice?: number;
}

export interface QuoteDTO {
  id?: number;
  reference?: string;
  eventId: number;
  catererId?: number;
  items: QuoteItemDTO[];
  status?: string;
  taxRate: number;
  totalHt?: number;
  totalVat?: number;
  totalTtc?: number;
  createdAt?: string;
  validUntil?: string;
}

export interface PaymentDTO {
  id?: number;
  invoiceId: number;
  catererId?: number;
  amount: number;
  paymentDate?: string;
  paymentMethod: string;
  reference?: string;
}

export interface InvoiceDTO {
  id?: number;
  invoiceNumber?: string;
  eventId: number;
  catererId?: number;
  quoteId?: number;
  type: string;
  status?: string;
  totalHt?: number;
  taxRate: number;
  totalVat?: number;
  totalTtc?: number;
  dueDate?: string;
  createdAt?: string;
  payments?: PaymentDTO[];
  totalPaid?: number;
  remainingDue?: number;
}

@Injectable({
  providedIn: 'root'
})
export class BillingService {
  private readonly http = inject(HttpClient);

  public getQuotes(eventId: number): Observable<QuoteDTO[]> {
    return this.http.get<QuoteDTO[]>(`/api/events/${eventId}/quotes`);
  }

  public createQuote(eventId: number, quote: QuoteDTO): Observable<QuoteDTO> {
    return this.http.post<QuoteDTO>(`/api/events/${eventId}/quotes`, quote);
  }

  public updateQuote(eventId: number, quoteId: number, quote: QuoteDTO): Observable<QuoteDTO> {
    return this.http.put<QuoteDTO>(`/api/events/${eventId}/quotes/${quoteId}`, quote);
  }

  public deleteQuote(eventId: number, quoteId: number): Observable<void> {
    return this.http.delete<void>(`/api/events/${eventId}/quotes/${quoteId}`);
  }

  public acceptQuote(eventId: number, quoteId: number): Observable<QuoteDTO> {
    return this.http.post<QuoteDTO>(`/api/events/${eventId}/quotes/${quoteId}/accept`, {});
  }

  public rejectQuote(eventId: number, quoteId: number): Observable<QuoteDTO> {
    return this.http.post<QuoteDTO>(`/api/events/${eventId}/quotes/${quoteId}/reject`, {});
  }

  public getInvoices(eventId: number): Observable<InvoiceDTO[]> {
    return this.http.get<InvoiceDTO[]>(`/api/events/${eventId}/invoices`);
  }

  public getInvoice(eventId: number, invoiceId: number): Observable<InvoiceDTO> {
    return this.http.get<InvoiceDTO>(`/api/events/${eventId}/invoices/${invoiceId}`);
  }

  public generateInvoice(eventId: number, quoteId: number, type: string, percentage?: number): Observable<InvoiceDTO> {
    let params = new HttpParams()
      .set('quoteId', quoteId.toString())
      .set('type', type);
    if (percentage !== undefined && percentage !== null) {
      params = params.set('percentage', percentage.toString());
    }
    return this.http.post<InvoiceDTO>(`/api/events/${eventId}/invoices/generate`, null, { params });
  }

  public recordPayment(eventId: number, invoiceId: number, payment: PaymentDTO): Observable<InvoiceDTO> {
    return this.http.post<InvoiceDTO>(`/api/events/${eventId}/invoices/${invoiceId}/payments`, payment);
  }

  public deleteInvoice(eventId: number, invoiceId: number): Observable<void> {
    return this.http.delete<void>(`/api/events/${eventId}/invoices/${invoiceId}`);
  }
}
