import { Component } from '@angular/core';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.css']
})
export class LandingComponent {
  services = [
    { name: 'Carpet Cleaning', description: 'Stain removal and complete carpet wash', icon: 'carpet', category: 'cleaning' },
    { name: 'Mattress Cleaning', description: 'Stain removal, bed bugs removal, wash and dry', icon: 'mattress', category: 'cleaning' },
    { name: 'Couch Cleaning', description: 'Stain removal, wash and dry', icon: 'couch', category: 'cleaning' },
    { name: 'Deep House Clean', description: 'Full deep clean of your entire home', icon: 'house', category: 'cleaning' },
    { name: 'Curtain Cleaning', description: 'Professional curtain wash and care', icon: 'curtain', category: 'cleaning' },
    { name: 'Pest Fumigation', description: 'Complete pest control fumigation', icon: 'pest', category: 'pest-control' },
    { name: 'Rodent Control', description: 'Effective rodent removal and prevention', icon: 'rodent', category: 'pest-control' },
    { name: 'Cockroach Treatment', description: 'Targeted cockroach elimination', icon: 'cockroach', category: 'pest-control' },
  ];

  benefits = [
    { title: 'Flexible Booking', description: 'Book online anytime, including weekends. Choose your preferred date and time slot.', icon: 'calendar' },
    { title: 'Eco-Friendly Products', description: 'Top of the range equipment and eco-friendly detergents that are safe for your family.', icon: 'leaf' },
    { title: 'Gauteng Coverage', description: 'Services available across Pretoria, Centurion, Midrand and greater Gauteng.', icon: 'location' },
    { title: 'Home or Pickup', description: 'We can either pick up your items or clean them at your home. Your choice.', icon: 'truck' },
  ];

  contactInfo = {
    location: 'Pretoria, Gauteng, South Africa',
    email: 'sales@unsullied.co.za',
    phone: '065-521-5665'
  };
}
