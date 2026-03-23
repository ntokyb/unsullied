import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LandingComponent } from './pages/landing/landing.component';
import { QuoteFormComponent } from './pages/quote-form/quote-form.component';
import { AdminQuotesComponent } from './pages/admin-quotes/admin-quotes.component';
import { AdminCalendarComponent } from './pages/admin-calendar/admin-calendar.component';
import { JobCardComponent } from './pages/job-card/job-card.component';
import { PaymentReturnComponent } from './pages/payment-return/payment-return.component';

const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'quote', component: QuoteFormComponent },
  { path: 'admin/quotes', component: AdminQuotesComponent },
  { path: 'admin/calendar', component: AdminCalendarComponent },
  { path: 'job-card/:id', component: JobCardComponent },
  { path: 'payment-return', component: PaymentReturnComponent },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: 'enabled' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
