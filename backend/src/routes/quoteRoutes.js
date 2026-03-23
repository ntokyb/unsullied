const express = require('express');
const quoteController = require('../controllers/quoteController');

const router = express.Router();

// Register routes - order matters! Specific routes before parameterized ones
router.get('/', quoteController.getAllQuotes.bind(quoteController));
router.get('/report', quoteController.getDailyReport.bind(quoteController));
router.get('/bookings', quoteController.getBookings.bind(quoteController));
router.post('/', quoteController.createQuote.bind(quoteController));
router.get('/:id', quoteController.getQuoteById.bind(quoteController));
router.patch('/:id/status', quoteController.updateQuoteStatus.bind(quoteController));
router.post('/:id/job-card', quoteController.submitJobCard.bind(quoteController));
router.post('/:id/payment', quoteController.recordPayment.bind(quoteController));

module.exports = router;
