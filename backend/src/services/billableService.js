const BILLABLE_URL = process.env.BILLABLE_API_URL || 'https://api.mybillable.co.za';
const BILLABLE_API_KEY = process.env.BILLABLE_API_KEY;

class BillableService {
  /**
   * Make an authenticated request to the Billable API
   */
  async request(method, path, body = null) {
    if (!BILLABLE_API_KEY) {
      throw new Error('BILLABLE_API_KEY not configured');
    }

    const options = {
      method,
      headers: {
        'Authorization': `ApiKey ${BILLABLE_API_KEY}`,
        'Content-Type': 'application/json'
      }
    };
    if (body) {
      options.body = JSON.stringify(body);
    }

    const res = await fetch(`${BILLABLE_URL}${path}`, options);

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(`Billable API ${method} ${path} failed: ${err.error || res.statusText}`);
    }

    const text = await res.text();
    return text ? JSON.parse(text) : {};
  }

  /**
   * Find existing client by email, or create a new one
   */
  async findOrCreateClient({ name, email, phone, addressLine1, city, province, postalCode }) {
    // Search by email first
    const searchResult = await this.request('GET', `/api/clients?search=${encodeURIComponent(email)}`);
  
    if (searchResult.items && searchResult.items.length > 0) {
      const existing = searchResult.items[0];
      console.log(`Billable: Found existing client ${existing.id} for ${email}`);
  
      // Update if name is wrong or was a placeholder
      if (!existing.name || existing.name === 'Client Name' || existing.name !== name) {
        try {
          await this.request('PUT', `/api/clients/${existing.id}`, {
            id: existing.id,
            name: name || existing.name,
            email: email,
            phone: phone || existing.phone || null,
            vatNumber: null,
            registrationNumber: null,
            addressLine1: addressLine1 || existing.address?.street || null,
            city: city || existing.address?.city || null,
            province: province || existing.address?.province || null,
            postalCode: postalCode || existing.address?.postalCode || null,
            country: 'South Africa'
          });
          console.log(`Billable: Updated client ${existing.id} name to ${name}`);
        } catch (updateErr) {
          console.error('Could not update existing client:', updateErr.message);
        }
      }
  
      return existing.id;
    }
  
    // Create new client
    const client = await this.request('POST', '/api/clients', {
      name,
      email,
      phone: phone || null,
      vatNumber: null,
      registrationNumber: null,
      addressLine1: addressLine1 || null,
      addressLine2: null,
      city: city || null,
      province: province || null,
      postalCode: postalCode || null,
      country: 'South Africa'
    });
  
    console.log(`Billable: Created new client ${client.id} for ${email}`);
    return client.id;
  }

  /**
   * Create a quote in Billable
   */
  async createQuote(clientId, { title, preferredDate, specialInstructions, services, callOutFee }) {
    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + 7);

    const lines = services.map(s => ({
      itemName: s.name,
      description: `${s.category === 'pest-control' ? 'Pest Control' : 'Cleaning'} service`,
      quantity: s.quantity,
      unit: 'each',
      unitPrice: parseFloat(s.unitPrice),
      vatCode: 'STANDARD',
      discountType: 'NONE',
      discountValue: 0
    }));

    // Add call-out fee as a line item
    lines.push({
      itemName: 'Call-out fee',
      description: 'Standard call-out fee',
      quantity: 1,
      unit: 'each',
      unitPrice: parseFloat(callOutFee),
      vatCode: 'STANDARD',
      discountType: 'NONE',
      discountValue: 0
    });

    const servicePeriod = preferredDate
      ? `${preferredDate}T00:00:00Z`
      : new Date().toISOString();

    const quote = await this.request('POST', '/api/quotes', {
      clientId,
      engagementTitle: title,
      validUntil: validUntil.toISOString(),
      servicePeriodFrom: servicePeriod,
      servicePeriodTo: servicePeriod,
      notes: specialInstructions || null,
      terms: 'Payment due within 7 days of invoice date.',
      lines
    });

    console.log(`Billable: Created quote ${quote.quoteNumber} (${quote.id})`);
    return quote;
  }

  /**
   * Send quote PDF to client via email
   */
  async sendQuote(quoteId) {
    await this.request('POST', `/api/quotes/${quoteId}/send`);
    console.log(`Billable: Sent quote ${quoteId} to client`);
  }

  /**
   * Create an invoice in Billable
   */
  async createInvoice(clientId, { services, callOutFee, reference, notes }) {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 7);

    const lines = services.map(s => ({
      itemName: s.name,
      description: `${s.category === 'pest-control' ? 'Pest Control' : 'Cleaning'} service`,
      quantity: s.quantity,
      unit: 'each',
      unitPrice: parseFloat(s.unitPrice),
      vatCode: 'STANDARD',
      discountType: 'NONE',
      discountValue: 0
    }));

    lines.push({
      itemName: 'Call-out fee',
      description: 'Standard call-out fee',
      quantity: 1,
      unit: 'each',
      unitPrice: parseFloat(callOutFee),
      vatCode: 'STANDARD',
      discountType: 'NONE',
      discountValue: 0
    });

    const invoice = await this.request('POST', '/api/invoices', {
      clientId,
      dueDate: dueDate.toISOString(),
      reference: reference || null,
      notes: notes || null,
      lines
    });

    console.log(`Billable: Created invoice ${invoice.invoiceNumber} (${invoice.id})`);
    return invoice;
  }

  /**
   * Send invoice to client and get PayFast payment link
   */
  async sendInvoiceAndGetPaymentLink(invoiceId) {
    await this.request('POST', `/api/invoices/${invoiceId}/send`);
    console.log(`Billable: Sent invoice ${invoiceId}`);

    const session = await this.request('POST', `/api/invoices/${invoiceId}/payfast/session`);
    console.log(`Billable: Got PayFast link for invoice ${invoiceId}`);
    return session.redirectUrl;
  }

  /**
   * Get invoice status
   */
  async getInvoiceStatus(invoiceId) {
    return await this.request('GET', `/api/invoices/${invoiceId}`);
  }

  /**
   * Record a manual payment
   */
  async recordManualPayment(invoiceId, { amount, paymentMethod, reference }) {
    return await this.request('POST', '/api/payments', {
      invoiceId,
      amount,
      paymentDate: new Date().toISOString(),
      paymentMethod: paymentMethod || 'EFT',
      reference: reference || null
    });
  }
}

module.exports = new BillableService();
