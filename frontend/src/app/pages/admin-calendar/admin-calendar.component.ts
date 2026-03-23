import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AdminService, Quote } from '../../services/admin.service';

interface GroupedBooking {
  date: string;
  formattedDate: string;
  quotes: Quote[];
}

@Component({
  selector: 'app-admin-calendar',
  templateUrl: './admin-calendar.component.html',
  styleUrls: ['./admin-calendar.component.css']
})
export class AdminCalendarComponent implements OnInit {
  bookings: Quote[] = [];
  groupedBookings: GroupedBooking[] = [];
  isLoading: boolean = false;
  error: string = '';

  constructor(
    private adminService: AdminService,
    public router: Router
  ) {}

  ngOnInit(): void {
    this.loadBookings();
  }

  loadBookings(): void {
    this.isLoading = true;
    this.error = '';

    this.adminService.getBookings().subscribe({
      next: (response) => {
        this.isLoading = false;
        this.bookings = response.bookings || [];
        this.groupBookingsByDate();
      },
      error: (err) => {
        this.isLoading = false;
        this.error = err.error?.message || 'Failed to load bookings. Please try again.';
        console.error('Error loading bookings:', err);
      }
    });
  }

  groupBookingsByDate(): void {
    const grouped: { [key: string]: Quote[] } = {};

    this.bookings.forEach(quote => {
      if (quote.preferredDate) {
        if (!grouped[quote.preferredDate]) {
          grouped[quote.preferredDate] = [];
        }
        grouped[quote.preferredDate].push(quote);
      }
    });

    this.groupedBookings = Object.keys(grouped)
      .sort()
      .map(date => ({
        date,
        formattedDate: this.formatDate(date),
        quotes: grouped[date]
      }));
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.getTime() === today.getTime()) {
      return 'Today';
    } else if (date.getTime() === tomorrow.getTime()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-ZA', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
  }

  getTimeBlockLabel(timeBlock: string | null | undefined): string {
    if (!timeBlock) return 'No time specified';
    const labels: { [key: string]: string } = {
      'morning': 'Morning',
      'midday': 'Midday',
      'afternoon': 'Afternoon'
    };
    return labels[timeBlock] || timeBlock;
  }

  getTimeBlockBadgeClass(timeBlock: string | null | undefined): string {
    if (!timeBlock) return 'badge bg-gray-100 text-gray-600 ring-1 ring-inset ring-gray-500/20';
    const classes: { [key: string]: string } = {
      'morning': 'badge bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20',
      'midday': 'badge bg-orange-50 text-orange-700 ring-1 ring-inset ring-orange-600/20',
      'afternoon': 'badge bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20'
    };
    return classes[timeBlock] || 'badge bg-gray-100 text-gray-600 ring-1 ring-inset ring-gray-500/20';
  }

  viewQuoteDetails(quote: Quote): void {
    this.router.navigate(['/admin/quotes'], { queryParams: { id: quote.id } });
  }

  viewLocationOnMap(address: string): void {
    const encodedAddress = encodeURIComponent(address);
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
    window.open(mapsUrl, '_blank');
  }
}
