import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminService, Quote } from '../../services/admin.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-job-card',
  templateUrl: './job-card.component.html',
  styleUrls: ['./job-card.component.css']
})
export class JobCardComponent implements OnInit {
  quote: Quote | null = null;
  quoteId: number | null = null;
  
  completedBy: string = '';
  notes: string = '';
  signature: string | null = null;
  customerConfirmed: boolean = false;
  
  isLoading: boolean = false;
  isSubmitting: boolean = false;
  error: string = '';
  success: boolean = false;

  constructor(
    public router: Router,
    private route: ActivatedRoute,
    private adminService: AdminService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.quoteId = +params['id'];
      if (this.quoteId) {
        this.loadQuote();
      }
    });
  }

  loadQuote(): void {
    if (!this.quoteId) return;

    this.isLoading = true;
    this.error = '';

    // Use the admin service to get quote by ID
    this.adminService.getQuoteById(this.quoteId).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.quote = response.quote;
        
        // Pre-fill completedBy if job card already exists
        if (this.quote.jobCard?.completedBy) {
          this.completedBy = this.quote.jobCard.completedBy;
          this.notes = this.quote.jobCard.notes || '';
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.error = err.error?.message || 'Failed to load quote. Please try again.';
        console.error('Error loading quote:', err);
      }
    });
  }

  onSignatureChange(signature: string | null): void {
    this.signature = signature;
  }

  isFormValid(): boolean {
    return !!(
      this.completedBy.trim() &&
      this.signature &&
      this.customerConfirmed
    );
  }

  onSubmit(): void {
    if (!this.isFormValid()) {
      this.error = 'Please fill in all required fields, provide a signature, and confirm completion.';
      return;
    }

    if (!this.quoteId) {
      this.error = 'Invalid quote ID.';
      return;
    }

    this.isSubmitting = true;
    this.error = '';

    if (!this.signature) {
      this.error = 'Please provide a signature before submitting.';
      this.isSubmitting = false;
      return;
    }

    const jobCardData = {
      completedBy: this.completedBy.trim(),
      notes: this.notes.trim() || null,
      signature: this.signature,
      timestamp: new Date().toISOString()
    };

    this.adminService.submitJobCard(this.quoteId, jobCardData).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        this.success = true;
        this.quote = response.quote;
        
        // Redirect after 2 seconds
        setTimeout(() => {
          this.router.navigate(['/admin/quotes']);
        }, 2000);
      },
      error: (err) => {
        this.isSubmitting = false;
        this.error = err.error?.message || 'Failed to submit job card. Please try again.';
        console.error('Error submitting job card:', err);
      }
    });
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  getCleaningServices(): any[] {
    if (!this.quote) return [];
    return this.quote.services.filter(s => s.category === 'cleaning');
  }

  getPestControlServices(): any[] {
    if (!this.quote) return [];
    return this.quote.services.filter(s => s.category === 'pest-control');
  }

  viewLocationOnMap(address: string): void {
    const encodedAddress = encodeURIComponent(address);
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
    window.open(mapsUrl, '_blank');
  }
}
