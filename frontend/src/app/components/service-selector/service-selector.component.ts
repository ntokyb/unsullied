import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Service } from '../../models/service.model';

@Component({
  selector: 'app-service-selector',
  template: `
    <div>
      <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <span
          class="w-7 h-7 rounded-lg flex items-center justify-center text-sm"
          [ngClass]="{
            'bg-blue-50 text-blue-600': title === 'Cleaning Services',
            'bg-orange-50 text-orange-600': title !== 'Cleaning Services'
          }"
        >
          <svg *ngIf="title === 'Cleaning Services'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path>
          </svg>
          <svg *ngIf="title !== 'Cleaning Services'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
          </svg>
        </span>
        {{ title }}
      </h3>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div
          *ngFor="let service of services"
          class="rounded-2xl p-4 transition-all duration-200 cursor-default"
          [ngClass]="{
            'bg-primary-50/60 border-2 border-primary-300 shadow-sm': service.quantity > 0,
            'bg-white border border-gray-200 hover:border-gray-300 hover:shadow-sm': service.quantity === 0
          }"
        >
          <div class="flex items-start justify-between mb-3">
            <div>
              <h4 class="text-sm font-semibold text-gray-900">{{ service.name }}</h4>
              <p class="text-xs text-gray-500 mt-0.5">R{{ service.unitPrice.toFixed(2) }} per unit</p>
            </div>
            <span
              *ngIf="service.quantity > 0"
              class="badge badge-teal text-[10px]"
            >
              R{{ (service.quantity * service.unitPrice).toFixed(2) }}
            </span>
          </div>
          <div class="flex items-center gap-3">
            <button
              type="button"
              (click)="decreaseQuantity(service)"
              [disabled]="service.quantity === 0"
              class="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-150 disabled:opacity-20 disabled:cursor-not-allowed"
              [ngClass]="{
                'bg-gray-100 hover:bg-gray-200 text-gray-700': service.quantity > 0,
                'bg-gray-50 text-gray-300': service.quantity === 0
              }"
            >
              &minus;
            </button>
            <span
              class="text-base font-bold w-8 text-center tabular-nums"
              [ngClass]="{
                'text-primary-700': service.quantity > 0,
                'text-gray-300': service.quantity === 0
              }"
            >{{ service.quantity }}</span>
            <button
              type="button"
              (click)="increaseQuantity(service)"
              class="w-9 h-9 rounded-full bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white flex items-center justify-center text-sm font-semibold transition-all duration-150 shadow-sm hover:shadow-md active:scale-95"
            >
              +
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class ServiceSelectorComponent {
  @Input() services: Service[] = [];
  @Input() title: string = '';
  @Output() servicesChange = new EventEmitter<Service[]>();

  increaseQuantity(service: Service): void {
    service.quantity++;
    this.servicesChange.emit([...this.services]);
  }

  decreaseQuantity(service: Service): void {
    if (service.quantity > 0) {
      service.quantity--;
      this.servicesChange.emit([...this.services]);
    }
  }
}
