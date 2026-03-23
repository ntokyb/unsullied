import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Quote {
  id: number;
  customerName: string;
  address: string;
  addressType: 'estate' | 'house';
  preferredDate?: string;
  timeBlock?: 'morning' | 'midday' | 'afternoon';
  specialInstructions?: string;
  services: Array<{
    id: number;
    name: string;
    quantity: number;
    unitPrice: number;
    category: 'cleaning' | 'pest-control';
  }>;
  total: number;
  callOutFee: number;
  totalWithCallOut: number;
  status: 'sent_to_whatsapp' | 'pending' | 'booked' | 'completed' | 'cancelled';
  paymentStatus?: 'unpaid' | 'paid';
  paymentMethod?: string;
  jobCard?: {
    completedBy: string;
    notes?: string;
    signature: string;
    timestamp: string;
    date: string;
  };
  createdAt: string;
}

export interface QuotesResponse {
  success: boolean;
  quotes: Quote[];
}

export interface UpdateStatusResponse {
  success: boolean;
  quote: Quote;
  whatsappMessage?: string;
  whatsappLink?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getAllQuotes(): Observable<QuotesResponse> {
    return this.http.get<QuotesResponse>(`${this.apiUrl}/quotes`);
  }

  updateQuoteStatus(quoteId: number, status: Quote['status']): Observable<UpdateStatusResponse> {
    return this.http.patch<UpdateStatusResponse>(`${this.apiUrl}/quotes/${quoteId}/status`, { status });
  }

  getQuoteById(quoteId: number): Observable<{ success: boolean; quote: Quote }> {
    return this.http.get<{ success: boolean; quote: Quote }>(`${this.apiUrl}/quotes/${quoteId}`);
  }

  submitJobCard(quoteId: number, jobCardData: {
    completedBy: string;
    notes: string | null;
    signature: string;
    timestamp: string;
  }): Observable<UpdateStatusResponse> {
    return this.http.post<UpdateStatusResponse>(`${this.apiUrl}/quotes/${quoteId}/job-card`, jobCardData);
  }

  getBookings(): Observable<{ success: boolean; bookings: Quote[] }> {
    return this.http.get<{ success: boolean; bookings: Quote[] }>(`${this.apiUrl}/quotes/bookings`);
  }
}
