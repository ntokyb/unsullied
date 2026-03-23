require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize, testConnection } = require('./config/database');
const quoteRoutes = require('./routes/quoteRoutes');

// Import models to register them with Sequelize
const Quote = require('./models/Quote');
const Service = require('./models/Service');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection and sync
const initializeDatabase = async () => {
  try {
    await testConnection();
    
    // Handle migration for totalWithCallOut column if table has existing data
    if (process.env.NODE_ENV === 'development') {
      try {
        // Check if quotes table exists and has data
        const [tableCheck] = await sequelize.query(`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'quotes'
          )
        `);
        
        if (tableCheck[0]?.exists) {
          // Check if totalWithCallOut column exists
          const [columnCheck] = await sequelize.query(`
            SELECT EXISTS (
              SELECT FROM information_schema.columns 
              WHERE table_schema = 'public' 
              AND table_name = 'quotes' 
              AND column_name = 'totalWithCallOut'
            )
          `);
          
          const columnExists = columnCheck[0]?.exists;
          
          if (!columnExists) {
            // Add column as nullable first
            console.log('Adding totalWithCallOut column as nullable...');
            await sequelize.query(`
              ALTER TABLE quotes 
              ADD COLUMN "totalWithCallOut" DECIMAL(10,2)
            `);
            
            // Update existing rows
            const [updateResult] = await sequelize.query(`
              UPDATE quotes 
              SET "totalWithCallOut" = COALESCE("total", 0) + COALESCE("callOutFee", 300)
              WHERE "totalWithCallOut" IS NULL
            `);
            console.log(`✅ Updated existing quotes with totalWithCallOut values`);
            
            // Now make it NOT NULL with default
            await sequelize.query(`
              ALTER TABLE quotes 
              ALTER COLUMN "totalWithCallOut" SET NOT NULL,
              ALTER COLUMN "totalWithCallOut" SET DEFAULT 0
            `);
            console.log('✅ Set totalWithCallOut as NOT NULL');
          } else {
            // Column exists, just update any nulls
            const [results] = await sequelize.query(`
              SELECT COUNT(*) as null_count 
              FROM quotes 
              WHERE "totalWithCallOut" IS NULL
            `);
            
            const nullCount = parseInt(results[0]?.null_count || 0);
            if (nullCount > 0) {
              await sequelize.query(`
                UPDATE quotes 
                SET "totalWithCallOut" = COALESCE("total", 0) + COALESCE("callOutFee", 300)
                WHERE "totalWithCallOut" IS NULL
              `);
              console.log(`✅ Updated ${nullCount} quotes with totalWithCallOut values`);
            }
          }
        }
      } catch (migrationError) {
        console.log('Migration check:', migrationError.message);
        // Continue with sync - Sequelize will handle it
      }
    }
    
    // Sync models in order: Quote first (parent), then Service (child with foreign key)
    await Quote.sync({ alter: process.env.NODE_ENV === 'development' });
    await Service.sync({ alter: process.env.NODE_ENV === 'development' });
    console.log('Database models synchronized');
  } catch (error) {
    console.error('Database initialization error:', error);
    process.exit(1);
  }
};

initializeDatabase();

// Routes
app.use('/api/quotes', quoteRoutes);

// Debug: Log all registered routes
console.log('Registered routes:');
console.log('  GET /api/quotes - getAllQuotes');
console.log('  POST /api/quotes - createQuote');
console.log('  GET /api/quotes/:id - getQuoteById');
console.log('  PATCH /api/quotes/:id/status - updateQuoteStatus');
console.log('  POST /api/quotes/:id/job-card - submitJobCard');
console.log('  POST /api/quotes/:id/payment - recordPayment');

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
