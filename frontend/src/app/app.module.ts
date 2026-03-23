import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { QuoteFormComponent } from './pages/quote-form/quote-form.component';
import { ServiceSelectorComponent } from './components/service-selector/service-selector.component';
import { AdminQuotesComponent } from './pages/admin-quotes/admin-quotes.component';
import { AdminCalendarComponent } from './pages/admin-calendar/admin-calendar.component';
import { JobCardComponent } from './pages/job-card/job-card.component';
import { PaymentReturnComponent } from './pages/payment-return/payment-return.component';
import { SignaturePadComponent } from './components/signature-pad/signature-pad.component';
import { LandingComponent } from './pages/landing/landing.component';

@NgModule({
  declarations: [
    AppComponent,
    QuoteFormComponent,
    ServiceSelectorComponent,
    AdminQuotesComponent,
    AdminCalendarComponent,
    JobCardComponent,
    PaymentReturnComponent,
    SignaturePadComponent,
    LandingComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
