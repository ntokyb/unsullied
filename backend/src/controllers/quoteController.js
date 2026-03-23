const quoteService = require('../services/quoteService');
const { CALL_OUT_FEE } = require('../config/constants');

class QuoteController {
  /**
   * Create a new quote
   * POST /api/quotes
   */
  async createQuote(req, res) {
    try {
      const { customerName, email, address, addressType, services, preferredDate, timeBlock, specialInstructions, status } = req.body;

      // Validate required fields
      if (!customerName || !email || !address || !addressType || !services) {
        return res.status(400).json({
          error: 'Missing required fields',
          required: ['customerName', 'email', 'address', 'addressType', 'services']
        });
      }

      // Validate addressType
      if (!['estate', 'house'].includes(addressType)) {
        return res.status(400).json({
          error: 'addressType must be either "estate" or "house"'
        });
      }

      // Validate timeBlock if provided
      if (timeBlock && !['morning', 'midday', 'afternoon'].includes(timeBlock)) {
        return res.status(400).json({
          error: 'timeBlock must be one of: "morning", "midday", "afternoon"'
        });
      }

      // Create quote with all fields
      const quote = await quoteService.createQuote({
        customerName,
        customerEmail: email,
        address,
        addressType,
        services,
        preferredDate: preferredDate || null,
        timeBlock: timeBlock || null,
        specialInstructions: specialInstructions || null,
        callOutFee: CALL_OUT_FEE,
        status: status || 'sent_to_whatsapp'
      });

      // Convert Sequelize instance to plain object
      const quoteData = quote.toJSON();

      // Add payment status and Billable data to quote data for WhatsApp message
      quoteData.paymentStatus = quote.paymentStatus;
      // billableQuoteNumber and paymentLink are attached by syncToBillable via dataValues

      // Generate WhatsApp message
      const whatsappMessage = quoteService.generateWhatsAppMessage(quoteData);
      const whatsappPhone = process.env.WHATSAPP_PHONE || '27767756770';
      const whatsappLink = `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(whatsappMessage)}`;

      res.status(201).json({
        success: true,
        quote: {
          id: quote.id,
          customerName: quote.customerName,
          customerEmail: quote.customerEmail,
          address: quote.address,
          addressType: quote.addressType,
          preferredDate: quote.preferredDate,
          timeBlock: quote.timeBlock,
          specialInstructions: quote.specialInstructions,
          services: quote.services || [],
          total: parseFloat(quote.total),
          callOutFee: parseFloat(quote.callOutFee),
          totalWithCallOut: parseFloat(quote.totalWithCallOut),
          status: quote.status,
          paymentStatus: quote.paymentStatus,
          paymentMethod: quote.paymentMethod,
          billableQuoteId: quoteData.billableQuoteId || null,
          billableQuoteNumber: quoteData.billableQuoteNumber || null,
          paymentLink: quoteData.paymentLink || null,
          createdAt: quote.createdAt
        },
        whatsappMessage,
        whatsappLink
      });
    } catch (error) {
      console.error('Error creating quote:', error);
      res.status(400).json({
        error: 'Failed to create quote',
        message: error.message
      });
    }
  }

  /**
   * Get all quotes
   * GET /api/quotes
   */
  async getAllQuotes(req, res) {
    try {
      console.log('GET /api/quotes - getAllQuotes called');
      const quotes = await quoteService.getAllQuotes();
      // Always return an array, even if empty
      const quotesArray = Array.isArray(quotes) ? quotes : [];
      console.log(`Found ${quotesArray.length} quotes`);
      res.status(200).json({
        success: true,
        quotes: quotesArray.map(quote => ({
          id: quote.id,
          customerName: quote.customerName,
          address: quote.address,
          addressType: quote.addressType,
          preferredDate: quote.preferredDate,
          timeBlock: quote.timeBlock,
          specialInstructions: quote.specialInstructions,
          services: quote.services || [],
          total: parseFloat(quote.total),
          callOutFee: parseFloat(quote.callOutFee),
          totalWithCallOut: parseFloat(quote.totalWithCallOut),
          status: quote.status,
          paymentStatus: quote.paymentStatus,
          paymentMethod: quote.paymentMethod,
          jobCard: quote.jobCard,
          createdAt: quote.createdAt
        }))
      });
    } catch (error) {
      console.error('Error fetching quotes:', error);
      res.status(500).json({
        error: 'Failed to fetch quotes',
        message: error.message
      });
    }
  }

  /**
   * Update quote status
   * PATCH /api/quotes/:id/status
   */
  async updateQuoteStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      // Validate status
      const validStatuses = ['sent_to_whatsapp', 'pending', 'booked', 'completed', 'cancelled'];
      if (!status || !validStatuses.includes(status)) {
        return res.status(400).json({
          error: 'Invalid status',
          validStatuses
        });
      }

      const quote = await quoteService.updateQuoteStatus(id, status);
      
      if (!quote) {
        return res.status(404).json({
          error: 'Quote not found'
        });
      }

      res.status(200).json({
        success: true,
        quote: {
          id: quote.id,
          customerName: quote.customerName,
          address: quote.address,
          addressType: quote.addressType,
          preferredDate: quote.preferredDate,
          timeBlock: quote.timeBlock,
          specialInstructions: quote.specialInstructions,
          services: quote.services || [],
          total: parseFloat(quote.total),
          callOutFee: parseFloat(quote.callOutFee),
          totalWithCallOut: parseFloat(quote.totalWithCallOut),
          status: quote.status,
          createdAt: quote.createdAt
        }
      });
    } catch (error) {
      console.error('Error updating quote status:', error);
      res.status(400).json({
        error: 'Failed to update quote status',
        message: error.message
      });
    }
  }

  /**
   * Get quote by ID
   * GET /api/quotes/:id
   */
  async getQuoteById(req, res) {
    try {
      const { id } = req.params;
      const quote = await quoteService.getQuoteById(id);

      if (!quote) {
        return res.status(404).json({
          error: 'Quote not found'
        });
      }

      res.status(200).json({
        success: true,
        quote: {
          id: quote.id,
          customerName: quote.customerName,
          address: quote.address,
          addressType: quote.addressType,
          preferredDate: quote.preferredDate,
          timeBlock: quote.timeBlock,
          specialInstructions: quote.specialInstructions,
          services: quote.services || [],
          total: parseFloat(quote.total),
          callOutFee: parseFloat(quote.callOutFee),
          totalWithCallOut: parseFloat(quote.totalWithCallOut),
          status: quote.status,
          paymentStatus: quote.paymentStatus,
          paymentMethod: quote.paymentMethod,
          jobCard: quote.jobCard,
          createdAt: quote.createdAt
        }
      });
    } catch (error) {
      console.error('Error fetching quote:', error);
      res.status(500).json({
        error: 'Failed to fetch quote',
        message: error.message
      });
    }
  }

  /**
   * Submit job card
   * POST /api/quotes/:id/job-card
   */
  async submitJobCard(req, res) {
    try {
      const { id } = req.params;
      const { completedBy, notes, signature, timestamp } = req.body;

      // Validate required fields
      if (!completedBy || !signature) {
        return res.status(400).json({
          error: 'Missing required fields',
          required: ['completedBy', 'signature']
        });
      }

      const quote = await quoteService.submitJobCard(id, {
        completedBy,
        notes: notes || null,
        signature,
        timestamp: timestamp || new Date().toISOString()
      });

      if (!quote) {
        return res.status(404).json({
          error: 'Quote not found'
        });
      }

      res.status(200).json({
        success: true,
        quote: {
          id: quote.id,
          customerName: quote.customerName,
          address: quote.address,
          addressType: quote.addressType,
          preferredDate: quote.preferredDate,
          timeBlock: quote.timeBlock,
          specialInstructions: quote.specialInstructions,
          services: quote.services || [],
          total: parseFloat(quote.total),
          callOutFee: parseFloat(quote.callOutFee),
          totalWithCallOut: parseFloat(quote.totalWithCallOut),
          status: quote.status,
          paymentStatus: quote.paymentStatus,
          paymentMethod: quote.paymentMethod,
          jobCard: quote.jobCard,
          createdAt: quote.createdAt
        }
      });
    } catch (error) {
      console.error('Error submitting job card:', error);
      res.status(400).json({
        error: 'Failed to submit job card',
        message: error.message
      });
    }
  }

  /**
   * Record payment
   * POST /api/quotes/:id/payment
   */
  async recordPayment(req, res) {
    try {
      const { id } = req.params;
      const { paymentMethod } = req.body;

      const quote = await quoteService.recordPayment(id, paymentMethod || 'online');

      if (!quote) {
        return res.status(404).json({
          error: 'Quote not found'
        });
      }

      // Convert Sequelize instance to plain object
      const quoteData = quote.toJSON();
      
      // Generate WhatsApp message with payment status
      const whatsappMessage = quoteService.generateWhatsAppMessage(quoteData);
      const whatsappPhone = process.env.WHATSAPP_PHONE || '27767756770';
      const whatsappLink = `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(whatsappMessage)}`;

      res.status(200).json({
        success: true,
        quote: {
          id: quote.id,
          customerName: quote.customerName,
          address: quote.address,
          addressType: quote.addressType,
          preferredDate: quote.preferredDate,
          timeBlock: quote.timeBlock,
          specialInstructions: quote.specialInstructions,
          services: quote.services || [],
          total: parseFloat(quote.total),
          callOutFee: parseFloat(quote.callOutFee),
          totalWithCallOut: parseFloat(quote.totalWithCallOut),
          status: quote.status,
          paymentStatus: quote.paymentStatus,
          paymentMethod: quote.paymentMethod,
          jobCard: quote.jobCard,
          createdAt: quote.createdAt
        },
        whatsappMessage,
        whatsappLink
      });
    } catch (error) {
      console.error('Error recording payment:', error);
      res.status(400).json({
        error: 'Failed to record payment',
        message: error.message
      });
    }
  }

  /**
   * Get all bookings
   * GET /api/quotes/bookings
   */
  async getBookings(req, res) {
    try {
      const bookings = await quoteService.getBookings();
      
      res.status(200).json({
        success: true,
        bookings: bookings.map(quote => ({
          id: quote.id,
          customerName: quote.customerName,
          address: quote.address,
          addressType: quote.addressType,
          preferredDate: quote.preferredDate,
          timeBlock: quote.timeBlock,
          specialInstructions: quote.specialInstructions,
          services: quote.services || [],
          total: parseFloat(quote.totalWithCallOut),
          status: quote.status,
          paymentStatus: quote.paymentStatus,
          createdAt: quote.createdAt
        }))
      });
    } catch (error) {
      console.error('Error fetching bookings:', error);
      res.status(500).json({
        error: 'Failed to fetch bookings',
        message: error.message
      });
    }
  }

  /**
   * Get daily admin summary report
   * GET /api/quotes/report?date=today
   */
  async getDailyReport(req, res) {
    try {
      const { date } = req.query;
      
      // For now, only support 'today' filter
      // Can be extended to support specific dates later
      if (date !== 'today') {
        return res.status(400).json({
          error: 'Invalid date parameter',
          message: 'Currently only "today" is supported. Use ?date=today'
        });
      }

      const report = await quoteService.getDailyReport(date);

      res.status(200).json({
        success: true,
        summary: report
      });
    } catch (error) {
      console.error('Error generating daily report:', error);
      res.status(500).json({
        error: 'Failed to generate report',
        message: error.message
      });
    }
  }
}

module.exports = new QuoteController();
