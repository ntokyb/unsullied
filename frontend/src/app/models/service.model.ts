export interface Service {
  name: string;
  quantity: number;
  unitPrice: number;
  category: 'cleaning' | 'pest-control';
}

export interface QuoteRequest {
  customerName: string;
  email: string;
  address: string;
  addressType: 'estate' | 'house';
  services: Service[];
  preferredDate?: string;
  timeBlock?: 'morning' | 'midday' | 'afternoon';
  specialInstructions?: string;
  status?: string;
}

export const CALL_OUT_FEE = 300.00;

export interface QuoteResponse {
  success: boolean;
  quote: {
    id: number;
    customerName: string;
    address: string;
    addressType: 'estate' | 'house';
    preferredDate?: string;
    timeBlock?: 'morning' | 'midday' | 'afternoon';
    specialInstructions?: string;
    services: Service[];
    total: number;
    callOutFee: number;
    totalWithCallOut: number;
    status: 'sent_to_whatsapp' | 'pending' | 'booked' | 'completed' | 'cancelled';
    paymentStatus?: 'unpaid' | 'paid';
    paymentMethod?: string;
    billableQuoteId?: string;
    billableQuoteNumber?: string;
    paymentLink?: string;
    createdAt: string;
  };
  whatsappMessage: string;
  whatsappLink: string;
}

export const AVAILABLE_SERVICES: Service[] = [
  // Cleaning Services
  {
    name: 'Mattress Clean',
    quantity: 0,
    unitPrice: 150.00,
    category: 'cleaning'
  },
  {
    name: 'Couch Clean',
    quantity: 0,
    unitPrice: 200.00,
    category: 'cleaning'
  },
  {
    name: 'Carpet Clean',
    quantity: 0,
    unitPrice: 180.00,
    category: 'cleaning'
  },
  {
    name: 'Curtain Clean',
    quantity: 0,
    unitPrice: 120.00,
    category: 'cleaning'
  },
  {
    name: 'Deep House Clean',
    quantity: 0,
    unitPrice: 500.00,
    category: 'cleaning'
  },
  // Pest Control Services
  {
    name: 'Pest Fumigation',
    quantity: 0,
    unitPrice: 350.00,
    category: 'pest-control'
  },
  {
    name: 'Rodent Control',
    quantity: 0,
    unitPrice: 280.00,
    category: 'pest-control'
  },
  {
    name: 'Cockroach Treatment',
    quantity: 0,
    unitPrice: 250.00,
    category: 'pest-control'
  },
  {
    name: 'Ant Treatment',
    quantity: 0,
    unitPrice: 200.00,
    category: 'pest-control'
  },
  {
    name: 'Termite Inspection',
    quantity: 0,
    unitPrice: 400.00,
    category: 'pest-control'
  }
];
