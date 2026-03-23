import { Component, OnInit, HostListener } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { QuoteService } from '../../services/quote.service';
import { AdminService } from '../../services/admin.service';
import { Service, AVAILABLE_SERVICES, QuoteRequest, CALL_OUT_FEE, QuoteResponse } from '../../models/service.model';

@Component({
  selector: 'app-quote-form',
  templateUrl: './quote-form.component.html',
  styleUrls: ['./quote-form.component.css']
})
export class QuoteFormComponent implements OnInit {
  customerName: string = '';
  customerEmail: string = '';
  address: string = '';
  addressType: 'estate' | 'house' = 'house';
  preferredDate: string = '';
  timeBlock: 'morning' | 'midday' | 'afternoon' | '' = '';
  specialInstructions: string = '';

  cleaningServices: Service[] = [];
  pestControlServices: Service[] = [];

  isLoading: boolean = false;
  error: string = '';
  whatsappLink: string = '';
  quoteSubmitted: boolean = false;
  showModal: boolean = false;
  showPreview: boolean = false;
  currentQuoteId: number | null = null;
  paymentStatus: 'unpaid' | 'paid' = 'unpaid';

  // Stepper
  currentStep: number = 1;
  steps = ['Your Info', 'Services', 'Schedule', 'Review'];

  constructor(
    private quoteService: QuoteService,
    private adminService: AdminService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cleaningServices = AVAILABLE_SERVICES
      .filter(s => s.category === 'cleaning')
      .map(s => ({ ...s, quantity: 0 }));

    this.pestControlServices = AVAILABLE_SERVICES
      .filter(s => s.category === 'pest-control')
      .map(s => ({ ...s, quantity: 0 }));
  }

  // Step validation
  isStep1Valid(): boolean {
    return !!(this.customerName.trim() && this.customerEmail.trim() && this.address.trim());
  }

  isStep2Valid(): boolean {
    return this.selectedServices.length > 0;
  }

  isStep3Valid(): boolean {
    return true; // Schedule is optional
  }

  isStepValid(step: number): boolean {
    switch (step) {
      case 1: return this.isStep1Valid();
      case 2: return this.isStep2Valid();
      case 3: return this.isStep3Valid();
      case 4: return this.isFormValid();
      default: return false;
    }
  }

  // Navigation
  nextStep(): void {
    if (this.isStepValid(this.currentStep) && this.currentStep < 4) {
      this.currentStep++;
      this.scrollToTop();
    }
  }

  prevStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
      this.scrollToTop();
    }
  }

  goToStep(step: number): void {
    // Only allow going back to completed steps or the current step
    if (step < this.currentStep || (step === this.currentStep)) {
      this.currentStep = step;
      this.scrollToTop();
    }
    // Allow going forward only if all previous steps are valid
    if (step > this.currentStep) {
      for (let i = 1; i < step; i++) {
        if (!this.isStepValid(i)) return;
      }
      this.currentStep = step;
      this.scrollToTop();
    }
  }

  private scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  get minDate(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  onDateChange(): void {
    if (!this.preferredDate) {
      this.timeBlock = '';
    }
  }

  get selectedServices(): Service[] {
    const allServices = [...this.cleaningServices, ...this.pestControlServices];
    return allServices.filter(s => s.quantity > 0);
  }

  get subtotal(): number {
    return this.selectedServices.reduce((sum, service) => {
      return sum + (service.quantity * service.unitPrice);
    }, 0);
  }

  get callOutFee(): number {
    return CALL_OUT_FEE;
  }

  get total(): number {
    return this.subtotal + this.callOutFee;
  }

  onServicesChange(services: Service[], category: 'cleaning' | 'pest-control'): void {
    if (category === 'cleaning') {
      this.cleaningServices = services;
    } else {
      this.pestControlServices = services;
    }
  }

  isFormValid(): boolean {
    return !!(
      this.customerName.trim() &&
      this.address.trim() &&
      this.selectedServices.length > 0
    );
  }

  onSubmit(): void {
    if (!this.isFormValid()) {
      this.error = 'Please fill in all required fields and select at least one service.';
      return;
    }
    this.error = '';
    this.showModal = true;
  }

  saveQuote(): Observable<QuoteResponse> {
    if (!this.isFormValid()) {
      throw new Error('Please fill in all required fields and select at least one service.');
    }

    const quoteData: QuoteRequest = {
      customerName: this.customerName.trim(),
      email: this.customerEmail.trim(),
      address: this.address.trim(),
      addressType: this.addressType,
      services: this.selectedServices.map(s => ({
        name: s.name,
        quantity: s.quantity,
        unitPrice: s.unitPrice,
        category: s.category
      })),
      preferredDate: this.preferredDate || undefined,
      timeBlock: this.timeBlock || undefined,
      specialInstructions: this.specialInstructions.trim() || undefined,
      status: 'sent_to_whatsapp'
    };

    return this.quoteService.createQuote(quoteData);
  }

  confirmSubmit(): void {
    this.showModal = false;
    this.isLoading = true;
    this.error = '';

    this.saveQuote().subscribe({
      next: (response: QuoteResponse) => {
        this.isLoading = false;
        this.whatsappLink = response.whatsappLink;
        if (this.whatsappLink) {
          window.open(this.whatsappLink, '_blank');
        }
      },
      error: (err: any) => {
        this.isLoading = false;
        this.error = err.error?.message || 'Failed to create quote. Please try again.';
        console.error('Error creating quote:', err);
      }
    });
  }

  continueToPayment(): void {
    this.showModal = false;
    this.isLoading = true;
    this.error = '';

    this.saveQuote().subscribe({
      next: (response: QuoteResponse) => {
        this.isLoading = false;
        this.currentQuoteId = response.quote.id;

        // Use real PayFast link from Billable if available
        const paymentLink = response.quote.paymentLink;
        if (paymentLink) {
          window.location.href = paymentLink;
        } else {
          // Fallback: no payment link available, redirect to WhatsApp instead
          this.error = 'Online payment is temporarily unavailable. Please use WhatsApp to arrange payment.';
          this.whatsappLink = response.whatsappLink;
          if (this.whatsappLink) {
            window.open(this.whatsappLink, '_blank');
          }
        }
      },
      error: (err: any) => {
        this.isLoading = false;
        this.error = err.error?.message || 'Failed to create quote. Please try again.';
        console.error('Error creating quote:', err);
      }
    });
  }

  openWhatsApp(): void {
    if (!this.isFormValid()) {
      this.error = 'Please fill in all required fields and select at least one service.';
      return;
    }

    this.isLoading = true;
    this.error = '';

    const quoteData: QuoteRequest = {
      customerName: this.customerName.trim(),
      email: this.customerEmail.trim(),
      address: this.address.trim(),
      addressType: this.addressType,
      services: this.selectedServices.map(s => ({
        name: s.name,
        quantity: s.quantity,
        unitPrice: s.unitPrice,
        category: s.category
      })),
      preferredDate: this.preferredDate || undefined,
      timeBlock: this.timeBlock || undefined,
      specialInstructions: this.specialInstructions.trim() || undefined,
      status: 'sent_to_whatsapp'
    };

    this.quoteService.createQuote(quoteData).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.whatsappLink = response.whatsappLink;
        if (this.whatsappLink) {
          window.open(this.whatsappLink, '_blank');
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.error = err.error?.message || 'Failed to create quote. Please try again.';
        console.error('Error creating quote:', err);
      }
    });
  }

  closeModal(): void {
    this.showModal = false;
  }

  getFormattedDate(): string {
    if (!this.preferredDate) return '';
    const date = new Date(this.preferredDate);
    return date.toLocaleDateString('en-ZA', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  getTimeBlockLabel(): string {
    const labels: { [key: string]: string } = {
      morning: 'Morning (8am - 11am)',
      midday: 'Midday (11am - 2pm)',
      afternoon: 'Afternoon (2pm - 5pm)'
    };
    return labels[this.timeBlock] || '';
  }

  getCleaningServices(): Service[] {
    return this.selectedServices.filter(s => s.category === 'cleaning');
  }

  getPestControlServices(): Service[] {
    return this.selectedServices.filter(s => s.category === 'pest-control');
  }

  resetForm(): void {
    this.customerName = '';
    this.customerEmail = '';
    this.address = '';
    this.addressType = 'house';
    this.preferredDate = '';
    this.timeBlock = '';
    this.specialInstructions = '';
    this.cleaningServices.forEach(s => s.quantity = 0);
    this.pestControlServices.forEach(s => s.quantity = 0);
    this.quoteSubmitted = false;
    this.whatsappLink = '';
    this.error = '';
    this.showModal = false;
    this.showPreview = false;
    this.currentStep = 1;
  }

  getAddressPlaceholder(): string {
    if (this.addressType === 'estate') {
      return 'Unit 12, Villa Marelle\n54 Cineraria Street\nRooihuiskraal\nCenturion\n0157';
    } else {
      return '48 Matlejoane Street\nSaulsville\nPretoria\n0125';
    }
  }

  getAddressExample(): string {
    if (this.addressType === 'estate') {
      return 'Unit 12, Villa Marelle\n54 Cineraria Street\nRooihuiskraal\nCenturion\n0157';
    } else {
      return '48 Matlejoane Street\nSaulsville\nPretoria\n0125';
    }
  }

  togglePreview(): void {
    this.showPreview = !this.showPreview;
  }

  getWhatsAppPreview(): string {
    if (!this.customerName.trim() || !this.address.trim() || this.selectedServices.length === 0) {
      return 'Fill in the form to see the WhatsApp message preview...';
    }

    let message = `Hi Unsullied, I'd like a quote for:\n\n`;
    message += `Name: ${this.customerName.trim()}\n`;
    message += `Address: ${this.address.trim()} (${this.addressType})\n\n`;
    message += `Services:\n`;

    const cleaningServices = this.selectedServices.filter(s => s.category === 'cleaning');
    const pestServices = this.selectedServices.filter(s => s.category === 'pest-control');

    if (cleaningServices.length > 0) {
      message += `\nCleaning:\n`;
      cleaningServices.forEach(service => {
        const subtotal = service.quantity * service.unitPrice;
        message += `- ${service.name} x${service.quantity} @ R${service.unitPrice.toFixed(2)} = R${subtotal.toFixed(2)}\n`;
      });
    }

    if (pestServices.length > 0) {
      message += `\nPest Control:\n`;
      pestServices.forEach(service => {
        const subtotal = service.quantity * service.unitPrice;
        message += `- ${service.name} x${service.quantity} @ R${service.unitPrice.toFixed(2)} = R${subtotal.toFixed(2)}\n`;
      });
    }

    message += `\nSubtotal: R${this.subtotal.toFixed(2)}`;
    message += `\nCall-out Fee: R${this.callOutFee.toFixed(2)}`;
    message += `\nGrand Total: R${this.total.toFixed(2)}`;

    if (this.preferredDate) {
      message += `\n\nPreferred Booking Date: ${this.getFormattedDate()}`;
      if (this.timeBlock) {
        message += `\nPreferred Time: ${this.getTimeBlockLabel()}`;
      }
    }

    if (this.specialInstructions && this.specialInstructions.trim()) {
      message += `\n\nSpecial Instructions:\n${this.specialInstructions.trim()}`;
    }

    return message;
  }

  @HostListener('document:keydown.escape', ['$event'])
  onEscapeKey(event: KeyboardEvent): void {
    if (this.showModal) {
      this.closeModal();
    }
  }
}
