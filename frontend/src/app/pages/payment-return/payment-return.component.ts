import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { QuoteService } from '../../services/quote.service';
import { AdminService } from '../../services/admin.service';

@Component({
  selector: 'app-payment-return',
  templateUrl: './payment-return.component.html',
  styleUrls: ['./payment-return.component.css']
})
export class PaymentReturnComponent implements OnInit {
  isProcessing: boolean = true;
  error: string = '';

  constructor(
    public router: Router,
    private route: ActivatedRoute,
    private quoteService: QuoteService,
    private adminService: AdminService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const quoteId = params['quoteId'];
      const paymentStatus = params['payment_status'] || params['status'];
      
      if (quoteId && paymentStatus === 'success') {
        this.handlePaymentSuccess(+quoteId);
      } else {
        this.error = 'Payment was not successful. Please try again.';
        this.isProcessing = false;
      }
    });
  }

  handlePaymentSuccess(quoteId: number): void {
    this.quoteService.recordPayment(quoteId, 'online').subscribe({
      next: (response) => {
        this.isProcessing = false;
        // Use WhatsApp link from backend response
        if (response.whatsappLink) {
          setTimeout(() => {
            window.open(response.whatsappLink, '_blank');
            this.router.navigate(['/quote'], { queryParams: { paid: 'true' } });
          }, 1500);
        } else {
          this.error = 'Payment recorded but WhatsApp link not available.';
        }
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to record payment.';
        this.isProcessing = false;
      }
    });
  }
}
