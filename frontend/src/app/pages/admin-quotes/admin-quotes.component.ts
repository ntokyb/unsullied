import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AdminService, Quote } from '../../services/admin.service';

@Component({
  selector: 'app-admin-quotes',
  templateUrl: './admin-quotes.component.html',
  styleUrls: ['./admin-quotes.component.css']
})
export class AdminQuotesComponent implements OnInit {
  quotes: Quote[] = [];
  isLoading: boolean = false;
  error: string = '';
  selectedQuote: Quote | null = null;
  showDetailsModal: boolean = false;

  statusOptions: Quote['status'][] = ['sent_to_whatsapp', 'pending', 'booked', 'completed', 'cancelled'];

  constructor(
    private adminService: AdminService,
    public router: Router
  ) {}

  ngOnInit(): void {
    this.loadQuotes();
  }

  loadQuotes(): void {
    this.isLoading = true;
    this.error = '';

    this.adminService.getAllQuotes().subscribe({
      next: (response) => {
        this.isLoading = false;
        this.quotes = response.quotes || [];
        this.error = '';
      },
      error: (err) => {
        this.isLoading = false;
        if (err.status === 404) {
          this.quotes = [];
          this.error = '';
        } else {
          this.error = err.error?.message || 'Failed to load quotes. Please try again.';
          console.error('Error loading quotes:', err);
        }
      }
    });
  }

  updateStatus(quote: Quote, newStatus: Quote['status']): void {
    if (quote.status === newStatus) {
      return;
    }

    const oldStatus = quote.status;
    quote.status = newStatus;
    this.error = '';

    this.adminService.updateQuoteStatus(quote.id, newStatus).subscribe({
      next: (response) => {
        const index = this.quotes.findIndex(q => q.id === quote.id);
        if (index !== -1) {
          this.quotes[index] = response.quote;
        }
        if (this.selectedQuote && this.selectedQuote.id === quote.id) {
          this.selectedQuote = response.quote;
        }
      },
      error: (err) => {
        quote.status = oldStatus;
        this.error = err.error?.message || 'Failed to update status. Please try again.';
        console.error('Error updating status:', err);
      }
    });
  }

  getStatusBadgeClass(status: Quote['status']): string {
    const classes: { [key: string]: string } = {
      'sent_to_whatsapp': 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20',
      'pending': 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20',
      'booked': 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20',
      'completed': 'bg-purple-50 text-purple-700 ring-1 ring-inset ring-purple-600/20',
      'cancelled': 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20'
    };
    return classes[status] || 'bg-gray-50 text-gray-700 ring-1 ring-inset ring-gray-600/20';
  }

  getStatusSelectClass(status: Quote['status']): string {
    const classes: { [key: string]: string } = {
      'sent_to_whatsapp': 'bg-blue-50 text-blue-700 border-blue-200',
      'pending': 'bg-amber-50 text-amber-700 border-amber-200',
      'booked': 'bg-emerald-50 text-emerald-700 border-emerald-200',
      'completed': 'bg-purple-50 text-purple-700 border-purple-200',
      'cancelled': 'bg-red-50 text-red-700 border-red-200'
    };
    return `text-xs font-semibold px-3 py-1.5 rounded-lg border cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 ${classes[status] || 'bg-gray-50 text-gray-700 border-gray-200'}`;
  }

  getStatusBadgeDisplayClass(status: Quote['status']): string {
    return `badge ${this.getStatusBadgeClass(status)}`;
  }

  getStatusLabel(status: Quote['status']): string {
    const labels: { [key: string]: string } = {
      'sent_to_whatsapp': 'Sent to WhatsApp',
      'pending': 'Pending',
      'booked': 'Booked',
      'completed': 'Completed',
      'cancelled': 'Cancelled'
    };
    return labels[status] || status;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  viewDetails(quote: Quote): void {
    this.selectedQuote = quote;
    this.showDetailsModal = true;
  }

  closeDetailsModal(): void {
    this.showDetailsModal = false;
    this.selectedQuote = null;
  }

  viewLocationOnMap(address: string): void {
    const encodedAddress = encodeURIComponent(address);
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
    window.open(mapsUrl, '_blank');
  }

  getCleaningServices(quote: Quote) {
    return quote.services.filter(s => s.category === 'cleaning');
  }

  getPestControlServices(quote: Quote) {
    return quote.services.filter(s => s.category === 'pest-control');
  }
}
