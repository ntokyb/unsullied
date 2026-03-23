const Quote = require('../models/Quote');
const Service = require('../models/Service');
const { sequelize } = require('../config/database');
const { CALL_OUT_FEE } = require('../config/constants');
const billableService = require('./billableService');

class QuoteService {
  /**
   * Calculate total price for services
   * @param {Array} services - Array of service objects
   * @returns {number} Total price
   */
  calculateTotal(services) {
    if (!services || services.length === 0) {
      return 0;
    }
    
    return services.reduce((total, service) => {
      return total + (service.quantity * parseFloat(service.unitPrice));
    }, 0);
  }

  /**
   * Validate service data
   * @param {Array} services - Array of service objects
   * @returns {Object} Validation result
   */
  validateServices(services) {
    if (!services || !Array.isArray(services) || services.length === 0) {
      return { valid: false, error: 'At least one service is required' };
    }

    for (const service of services) {
      if (!service.name || typeof service.name !== 'string') {
        return { valid: false, error: 'Service name is required' };
      }
      if (!service.quantity || typeof service.quantity !== 'number' || service.quantity < 1) {
        return { valid: false, error: 'Service quantity must be at least 1' };
      }
      if (!service.unitPrice || typeof service.unitPrice !== 'number' || service.unitPrice < 0) {
        return { valid: false, error: 'Service unit price must be a positive number' };
      }
      if (!service.category || !['cleaning', 'pest-control'].includes(service.category)) {
        return { valid: false, error: 'Service category must be "cleaning" or "pest-control"' };
      }
    }

    return { valid: true };
  }

  /**
   * Generate WhatsApp message text
   * @param {Object} quoteData - Quote data object
   * @returns {string} Formatted WhatsApp message
   */
  generateWhatsAppMessage(quoteData) {
    const { customerName, address, addressType, services, total, callOutFee, totalWithCallOut, preferredDate, timeBlock, specialInstructions, paymentStatus, billableQuoteNumber, paymentLink } = quoteData;
    
    let message = `Hi Unsullied, I'd like a quote for:\n\n`;
    message += `Name: ${customerName}\n`;
    message += `Address: ${address} (${addressType})\n\n`;
    message += `Services:\n`;
    
    const cleaningServices = services.filter(s => s.category === 'cleaning');
    const pestServices = services.filter(s => s.category === 'pest-control');
    
    if (cleaningServices.length > 0) {
      message += `\nCleaning:\n`;
      cleaningServices.forEach(service => {
        const unitPrice = parseFloat(service.unitPrice);
        const subtotal = service.quantity * unitPrice;
        message += `- ${service.name} x${service.quantity} @ R${unitPrice.toFixed(2)} = R${subtotal.toFixed(2)}\n`;
      });
    }
    
    if (pestServices.length > 0) {
      message += `\nPest Control:\n`;
      pestServices.forEach(service => {
        const unitPrice = parseFloat(service.unitPrice);
        const subtotal = service.quantity * unitPrice;
        message += `- ${service.name} x${service.quantity} @ R${unitPrice.toFixed(2)} = R${subtotal.toFixed(2)}\n`;
      });
    }
    
    const subtotal = parseFloat(total);
    const callOut = parseFloat(callOutFee) || CALL_OUT_FEE;
    const grandTotal = parseFloat(totalWithCallOut) || (subtotal + callOut);
    
    message += `\nSubtotal: R${subtotal.toFixed(2)}`;
    message += `\nCall-out Fee: R${callOut.toFixed(2)}`;
    message += `\nGrand Total: R${grandTotal.toFixed(2)}`;
    
    // Add preferred booking date and time if provided
    if (preferredDate) {
      const date = new Date(preferredDate);
      const formattedDate = date.toLocaleDateString('en-ZA', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      message += `\n\nPreferred Booking Date: ${formattedDate}`;
      
      if (timeBlock) {
        const timeBlockLabels = {
          morning: 'Morning (8am - 11am)',
          midday: 'Midday (11am - 2pm)',
          afternoon: 'Afternoon (2pm - 5pm)'
        };
        message += `\nPreferred Time: ${timeBlockLabels[timeBlock] || timeBlock}`;
      }
    }
    
    // Add special instructions if provided
    if (specialInstructions && specialInstructions.trim()) {
      message += `\n\nSpecial Instructions:\n${specialInstructions.trim()}`;
    }
    
    // Add Billable quote number if available
    if (billableQuoteNumber) {
      message += `\n\nQuote Ref: ${billableQuoteNumber}`;
    }

    // Add payment link if available
    if (paymentLink) {
      message += `\n\n💳 Pay Online: ${paymentLink}`;
    }

    // Add payment status if paid
    if (paymentStatus === 'paid') {
      message += `\n\n✅ Paid Online`;
    }

    return message;
  }

  /**
   * Create a new quote with services
   * @param {Object} quoteData - Quote data object
   * @returns {Promise<Object>} Created quote with services
   */
  async createQuote(quoteData) {
    const validation = this.validateServices(quoteData.services);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    const subtotal = this.calculateTotal(quoteData.services);
    const callOutFee = parseFloat(quoteData.callOutFee) || CALL_OUT_FEE;
    const totalWithCallOut = subtotal + callOutFee;
    const status = quoteData.status || 'pending';

    // Use transaction to ensure data consistency
    const transaction = await sequelize.transaction();

    try {
      // Create quote
      const quote = await Quote.create({
        customerName: quoteData.customerName,
        customerEmail: quoteData.customerEmail || null,
        address: quoteData.address,
        addressType: quoteData.addressType,
        preferredDate: quoteData.preferredDate || null,
        timeBlock: quoteData.timeBlock || null,
        specialInstructions: quoteData.specialInstructions || null,
        total: subtotal,
        callOutFee: callOutFee,
        totalWithCallOut: totalWithCallOut,
        status: status
      }, { transaction });

      // Create services
      const servicesData = quoteData.services.map(service => ({
        name: service.name,
        quantity: service.quantity,
        unitPrice: service.unitPrice,
        category: service.category,
        quoteId: quote.id
      }));

      await Service.bulkCreate(servicesData, { transaction });

      // Commit transaction
      await transaction.commit();

      // Fetch quote with services
      const quoteWithServices = await Quote.findByPk(quote.id, {
        include: [{
          model: Service,
          as: 'services'
        }]
      });

      // Integrate with Billable (non-blocking — don't fail the quote if Billable errors)
      let billableResult = null;
      if (quoteData.customerEmail) {
        try {
          billableResult = await this.syncToBillable(quoteWithServices, quoteData);
        } catch (billableError) {
          console.error('Billable integration error (quote saved locally):', billableError.message);
        }
      }

      // Attach Billable data to the returned object
      if (billableResult) {
        quoteWithServices.dataValues.billableQuoteNumber = billableResult.quoteNumber;
        quoteWithServices.dataValues.paymentLink = billableResult.paymentLink;
      }

      return quoteWithServices;
    } catch (error) {
      // Rollback transaction on error
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Sync a quote to Billable: create client, quote, invoice, and get payment link
   */
  async syncToBillable(quote, quoteData) {
    // 1. Find or create client
    const clientId = await billableService.findOrCreateClient({
      name: quoteData.customerName,
      email: quoteData.customerEmail,
      phone: null,
      addressLine1: quoteData.address,
      city: null,
      province: null,
      postalCode: null
    });

    // 2. Create quote in Billable
    const serviceNames = quoteData.services.map(s => s.name).join(', ');
    const billableQuote = await billableService.createQuote(clientId, {
      title: `${serviceNames} — ${quoteData.customerName}`,
      preferredDate: quoteData.preferredDate,
      specialInstructions: quoteData.specialInstructions,
      services: quoteData.services,
      callOutFee: quoteData.callOutFee || CALL_OUT_FEE
    });

    // 3. Send quote to client
    await billableService.sendQuote(billableQuote.id);

    // 4. Create invoice
    const invoice = await billableService.createInvoice(clientId, {
      services: quoteData.services,
      callOutFee: quoteData.callOutFee || CALL_OUT_FEE,
      reference: `${billableQuote.quoteNumber} — ${quoteData.customerName}`,
      notes: quoteData.specialInstructions
    });

    // 5. Get PayFast payment link
    let paymentLink = null;
    try {
      paymentLink = await billableService.sendInvoiceAndGetPaymentLink(invoice.id);
    } catch (paymentError) {
      console.error('Could not get PayFast link:', paymentError.message);
    }

    // 6. Update local quote with Billable IDs
    await Quote.update({
      billableClientId: clientId,
      billableQuoteId: billableQuote.id,
      billableInvoiceId: invoice.id
    }, { where: { id: quote.id } });

    return {
      clientId,
      quoteId: billableQuote.id,
      quoteNumber: billableQuote.quoteNumber,
      invoiceId: invoice.id,
      paymentLink
    };
  }

  /**
   * Get all quotes with services
   * @returns {Promise<Array>} Array of quotes with services
   */
  async getAllQuotes() {
    return await Quote.findAll({
      include: [{
        model: Service,
        as: 'services'
      }],
      order: [['createdAt', 'DESC']]
    });
  }

  /**
   * Update quote status
   * @param {number} quoteId - Quote ID
   * @param {string} status - New status
   * @returns {Promise<Object>} Updated quote
   */
  async updateQuoteStatus(quoteId, status) {
    const quote = await Quote.findByPk(quoteId, {
      include: [{
        model: Service,
        as: 'services'
      }]
    });

    if (!quote) {
      return null;
    }

    quote.status = status;
    await quote.save();

    // Reload to get fresh data
    return await Quote.findByPk(quoteId, {
      include: [{
        model: Service,
        as: 'services'
      }]
    });
  }

  /**
   * Get quote by ID with services
   * @param {number} quoteId - Quote ID
   * @returns {Promise<Object>} Quote with services
   */
  async getQuoteById(quoteId) {
    return await Quote.findByPk(quoteId, {
      include: [{
        model: Service,
        as: 'services'
      }]
    });
  }

  /**
   * Submit job card and update quote status
   * @param {number} quoteId - Quote ID
   * @param {Object} jobCardData - Job card data
   * @returns {Promise<Object>} Updated quote
   */
  async submitJobCard(quoteId, jobCardData) {
    const quote = await Quote.findByPk(quoteId, {
      include: [{
        model: Service,
        as: 'services'
      }]
    });

    if (!quote) {
      return null;
    }

    // Update quote with job card and set status to completed
    quote.jobCard = {
      completedBy: jobCardData.completedBy,
      notes: jobCardData.notes,
      signature: jobCardData.signature,
      timestamp: jobCardData.timestamp,
      date: new Date().toISOString()
    };
    quote.status = 'completed';
    await quote.save();

    // Reload to get fresh data
    return await Quote.findByPk(quoteId, {
      include: [{
        model: Service,
        as: 'services'
      }]
    });
  }

  /**
   * Record payment for a quote
   * @param {number} quoteId - Quote ID
   * @param {string} paymentMethod - Payment method (e.g., 'online', 'payfast', 'yoco')
   * @returns {Promise<Object>} Updated quote
   */
  async recordPayment(quoteId, paymentMethod) {
    const quote = await Quote.findByPk(quoteId, {
      include: [{
        model: Service,
        as: 'services'
      }]
    });

    if (!quote) {
      return null;
    }

    quote.paymentStatus = 'paid';
    quote.paymentMethod = paymentMethod;
    await quote.save();

    // Reload to get fresh data
    return await Quote.findByPk(quoteId, {
      include: [{
        model: Service,
        as: 'services'
      }]
    });
  }

  /**
   * Generate daily admin summary report
   * @param {string} dateFilter - 'today' or specific date
   * @returns {Promise<Object>} Report summary
   */
  async getDailyReport(dateFilter = 'today') {
    const { Op } = require('sequelize');
    
    // Get start and end of today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endOfToday = new Date(today);
    endOfToday.setHours(23, 59, 59, 999);

    // Get start and end of tomorrow
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const endOfTomorrow = new Date(tomorrow);
    endOfTomorrow.setHours(23, 59, 59, 999);

    // Get all quotes created today
    const quotesToday = await Quote.findAll({
      where: {
        createdAt: {
          [Op.gte]: today,
          [Op.lte]: endOfToday
        }
      },
      include: [{
        model: Service,
        as: 'services'
      }]
    });

    // Count quotes by status
    const statusBreakdown = {
      'sent_to_whatsapp': 0,
      'pending': 0,
      'booked': 0,
      'completed': 0,
      'cancelled': 0
    };

    quotesToday.forEach(quote => {
      const status = quote.status || 'sent_to_whatsapp';
      if (statusBreakdown.hasOwnProperty(status)) {
        statusBreakdown[status]++;
      }
    });

    // Get quotes booked for tomorrow (format: YYYY-MM-DD for DATEONLY)
    const tomorrowDateStr = tomorrow.toISOString().split('T')[0];
    const bookingsForTomorrow = await Quote.findAll({
      where: {
        preferredDate: tomorrowDateStr,
        status: {
          [Op.in]: ['booked', 'pending', 'sent_to_whatsapp']
        }
      },
      include: [{
        model: Service,
        as: 'services'
      }],
      order: [
        ['timeBlock', 'ASC'],
        ['createdAt', 'ASC']
      ]
    });

    // Format bookings for tomorrow
    const timeBlockLabels = {
      'morning': 'Morning',
      'midday': 'Midday',
      'afternoon': 'Afternoon'
    };

    const formattedBookings = bookingsForTomorrow.map(quote => ({
      id: quote.id,
      customerName: quote.customerName,
      address: quote.address,
      addressType: quote.addressType,
      preferredDate: quote.preferredDate,
      timeBlock: quote.timeBlock ? timeBlockLabels[quote.timeBlock] || quote.timeBlock : null,
      specialInstructions: quote.specialInstructions,
      services: (quote.services || []).map(service => ({
        name: service.name,
        quantity: service.quantity,
        unitPrice: parseFloat(service.unitPrice),
        category: service.category
      })),
      total: parseFloat(quote.totalWithCallOut),
      status: quote.status,
      paymentStatus: quote.paymentStatus
    }));

    return {
      newQuotesToday: quotesToday.length,
      statusBreakdown,
      bookingsForTomorrow: formattedBookings
    };
  }

  /**
   * Get all booked quotes with preferred dates
   * @returns {Promise<Array>} Array of booked quotes with services
   */
  async getBookings() {
    const { Op } = require('sequelize');
    
    return await Quote.findAll({
      where: {
        status: 'booked',
        preferredDate: {
          [Op.ne]: null
        }
      },
      include: [{
        model: Service,
        as: 'services'
      }],
      order: [
        ['preferredDate', 'ASC'],
        ['timeBlock', 'ASC'],
        ['createdAt', 'ASC']
      ]
    });
  }
}

module.exports = new QuoteService();
