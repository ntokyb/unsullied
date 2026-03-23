import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { QuoteRequest, QuoteResponse } from '../models/service.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class QuoteService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  createQuote(quoteData: QuoteRequest): Observable<QuoteResponse> {
    return this.http.post<QuoteResponse>(`${this.apiUrl}/quotes`, quoteData);
  }

  recordPayment(quoteId: number, paymentMethod: string = 'online'): Observable<{ success: boolean; quote: any; whatsappMessage: string; whatsappLink: string }> {
    return this.http.post<{ success: boolean; quote: any; whatsappMessage: string; whatsappLink: string }>(`${this.apiUrl}/quotes/${quoteId}/payment`, { paymentMethod });
  }
}
