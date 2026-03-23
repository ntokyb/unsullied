require('dotenv').config();
const { sequelize } = require('../src/config/database');
const Quote = require('../src/models/Quote');
const Service = require('../src/models/Service');
const { CALL_OUT_FEE } = require('../src/config/constants');

// Helper function to get dates
const getDate = (daysOffset = 0) => {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  date.setHours(0, 0, 0, 0);
  return date.toISOString().split('T')[0]; // YYYY-MM-DD format
};

const getDateTime = (daysOffset = 0, hours = 0) => {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  date.setHours(hours, 0, 0, 0);
  return date;
};

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Test connection
    await sequelize.authenticate();
    console.log('✅ Connected to database');

    // Ensure models are synced (don't alter, just ensure tables exist)
    await Quote.sync({ alter: false });
    await Service.sync({ alter: false });
    console.log('✅ Models synchronized');

    // Clear existing data (optional - comment out if you want to keep existing data)
    console.log('🗑️  Clearing existing data...');
    await Service.destroy({ where: {}, force: true });
    await Quote.destroy({ where: {}, force: true });
    console.log('✅ Existing data cleared');

    const quotes = [];

    // 1. TODAY'S QUOTES - Different statuses
    console.log('📝 Creating today\'s quotes...');
    
    // Today - sent_to_whatsapp (unpaid)
    quotes.push({
      customerName: 'Thabo Nkosi',
      address: 'Unit 5, Ridge Estate\n54 Cineraria Street\nRooihuiskraal\nCenturion\n0157',
      addressType: 'estate',
      preferredDate: getDate(2), // 2 days from now
      timeBlock: 'morning',
      specialInstructions: 'Gate code: 1234. Please call when arriving.',
      total: 450.00,
      callOutFee: CALL_OUT_FEE,
      totalWithCallOut: 750.00,
      status: 'sent_to_whatsapp',
      paymentStatus: 'unpaid',
      createdAt: getDateTime(0, 9)
    });

    // Today - pending (paid)
    quotes.push({
      customerName: 'Sarah van der Merwe',
      address: '48 Matlejoane Street\nSaulsville\nPretoria\n0125',
      addressType: 'house',
      preferredDate: getDate(3),
      timeBlock: 'midday',
      specialInstructions: 'Pet dog in backyard. Please be careful.',
      total: 600.00,
      callOutFee: CALL_OUT_FEE,
      totalWithCallOut: 900.00,
      status: 'pending',
      paymentStatus: 'paid',
      paymentMethod: 'online',
      createdAt: getDateTime(0, 10)
    });

    // Today - booked (paid)
    quotes.push({
      customerName: 'John Smith',
      address: 'Unit 12, Villa Marelle\n54 Cineraria Street\nRooihuiskraal\nCenturion\n0157',
      addressType: 'estate',
      preferredDate: getDate(1), // Tomorrow
      timeBlock: 'afternoon',
      specialInstructions: 'Ladder needed for high windows.',
      total: 800.00,
      callOutFee: CALL_OUT_FEE,
      totalWithCallOut: 1100.00,
      status: 'booked',
      paymentStatus: 'paid',
      paymentMethod: 'online',
      createdAt: getDateTime(0, 11)
    });

    // Today - completed (with job card)
    quotes.push({
      customerName: 'Maria Garcia',
      address: '123 Oak Avenue\nSandton\nJohannesburg\n2196',
      addressType: 'house',
      preferredDate: getDate(-1), // Yesterday
      timeBlock: 'morning',
      specialInstructions: null,
      total: 350.00,
      callOutFee: CALL_OUT_FEE,
      totalWithCallOut: 650.00,
      status: 'completed',
      paymentStatus: 'paid',
      paymentMethod: 'online',
      jobCard: {
        completedBy: 'Technician Mike',
        notes: 'All services completed successfully. Customer satisfied.',
        signature: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        timestamp: getDateTime(-1, 14).toISOString(),
        date: getDate(-1)
      },
      createdAt: getDateTime(-2, 8)
    });

    // Today - cancelled
    quotes.push({
      customerName: 'David Brown',
      address: '456 Pine Road\nCape Town\n8001',
      addressType: 'house',
      preferredDate: getDate(5),
      timeBlock: 'midday',
      specialInstructions: 'Cancelled due to scheduling conflict',
      total: 500.00,
      callOutFee: CALL_OUT_FEE,
      totalWithCallOut: 800.00,
      status: 'cancelled',
      paymentStatus: 'unpaid',
      createdAt: getDateTime(0, 14)
    });

    // 2. TOMORROW'S BOOKINGS - Multiple bookings for calendar view
    console.log('📅 Creating tomorrow\'s bookings...');
    
    quotes.push({
      customerName: 'Lisa Anderson',
      address: '789 Maple Street\nDurban\n4001',
      addressType: 'house',
      preferredDate: getDate(1), // Tomorrow
      timeBlock: 'morning',
      specialInstructions: 'Early morning preferred. Gate opens at 7am.',
      total: 550.00,
      callOutFee: CALL_OUT_FEE,
      totalWithCallOut: 850.00,
      status: 'booked',
      paymentStatus: 'paid',
      paymentMethod: 'online',
      createdAt: getDateTime(-1, 15)
    });

    quotes.push({
      customerName: 'Robert Wilson',
      address: 'Unit 8, Sunset Complex\nBeach Road\nPort Elizabeth\n6001',
      addressType: 'estate',
      preferredDate: getDate(1), // Tomorrow
      timeBlock: 'midday',
      specialInstructions: null,
      total: 700.00,
      callOutFee: CALL_OUT_FEE,
      totalWithCallOut: 1000.00,
      status: 'booked',
      paymentStatus: 'unpaid',
      createdAt: getDateTime(-1, 16)
    });

    quotes.push({
      customerName: 'Emma Thompson',
      address: '321 Elm Drive\nBloemfontein\n9301',
      addressType: 'house',
      preferredDate: getDate(1), // Tomorrow
      timeBlock: 'afternoon',
      specialInstructions: 'Back gate entrance. Ring bell twice.',
      total: 400.00,
      callOutFee: CALL_OUT_FEE,
      totalWithCallOut: 700.00,
      status: 'booked',
      paymentStatus: 'paid',
      paymentMethod: 'online',
      createdAt: getDateTime(-2, 10)
    });

    // 3. FUTURE BOOKINGS - For calendar view
    console.log('🔮 Creating future bookings...');
    
    quotes.push({
      customerName: 'James Taylor',
      address: '654 Cedar Lane\nPolokwane\n0700',
      addressType: 'house',
      preferredDate: getDate(7), // Next week
      timeBlock: 'morning',
      specialInstructions: 'Large property. May need extra time.',
      total: 900.00,
      callOutFee: CALL_OUT_FEE,
      totalWithCallOut: 1200.00,
      status: 'booked',
      paymentStatus: 'paid',
      paymentMethod: 'online',
      createdAt: getDateTime(-3, 9)
    });

    quotes.push({
      customerName: 'Sophie Martinez',
      address: 'Unit 15, Green Valley\nMain Street\nNelspruit\n1200',
      addressType: 'estate',
      preferredDate: getDate(10),
      timeBlock: 'midday',
      specialInstructions: null,
      total: 650.00,
      callOutFee: CALL_OUT_FEE,
      totalWithCallOut: 950.00,
      status: 'booked',
      paymentStatus: 'unpaid',
      createdAt: getDateTime(-4, 11)
    });

    // 4. PAST COMPLETED JOBS - With job cards
    console.log('✅ Creating past completed jobs...');
    
    quotes.push({
      customerName: 'Michael Johnson',
      address: '987 Birch Boulevard\nEast London\n5200',
      addressType: 'house',
      preferredDate: getDate(-3),
      timeBlock: 'afternoon',
      specialInstructions: 'Completed successfully',
      total: 750.00,
      callOutFee: CALL_OUT_FEE,
      totalWithCallOut: 1050.00,
      status: 'completed',
      paymentStatus: 'paid',
      paymentMethod: 'online',
      jobCard: {
        completedBy: 'Technician Sarah',
        notes: 'Excellent service. Customer very happy.',
        signature: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        timestamp: getDateTime(-3, 16).toISOString(),
        date: getDate(-3)
      },
      createdAt: getDateTime(-5, 8)
    });

    // 5. VARIOUS STATUSES - For admin dashboard testing
    console.log('📊 Creating quotes with various statuses...');
    
    quotes.push({
      customerName: 'Amanda White',
      address: '147 Willow Way\nKimberley\n8301',
      addressType: 'house',
      preferredDate: getDate(4),
      timeBlock: 'morning',
      specialInstructions: null,
      total: 480.00,
      callOutFee: CALL_OUT_FEE,
      totalWithCallOut: 780.00,
      status: 'sent_to_whatsapp',
      paymentStatus: 'unpaid',
      createdAt: getDateTime(-1, 12)
    });

    quotes.push({
      customerName: 'Christopher Lee',
      address: 'Unit 20, Mountain View\nValley Road\nPietermaritzburg\n3201',
      addressType: 'estate',
      preferredDate: getDate(6),
      timeBlock: 'afternoon',
      specialInstructions: 'Security guard at gate. Show ID.',
      total: 850.00,
      callOutFee: CALL_OUT_FEE,
      totalWithCallOut: 1150.00,
      status: 'pending',
      paymentStatus: 'paid',
      paymentMethod: 'online',
      createdAt: getDateTime(-2, 13)
    });

    // Create quotes and their services
    const createdQuotes = [];
    for (const quoteData of quotes) {
      const quote = await Quote.create(quoteData);
      createdQuotes.push(quote);

      // Add services based on total amount
      const services = [];
      
      // Determine services based on quote
      if (quoteData.total >= 800) {
        // Large quote - multiple services
        services.push(
          { name: 'Mattress Clean', quantity: 2, unitPrice: 150.00, category: 'cleaning' },
          { name: 'Couch Clean', quantity: 1, unitPrice: 200.00, category: 'cleaning' },
          { name: 'Pest Fumigation', quantity: 1, unitPrice: 500.00, category: 'pest-control' }
        );
      } else if (quoteData.total >= 500) {
        // Medium quote
        services.push(
          { name: 'Mattress Clean', quantity: 1, unitPrice: 150.00, category: 'cleaning' },
          { name: 'Couch Clean', quantity: 1, unitPrice: 200.00, category: 'cleaning' },
          { name: 'Carpet Clean', quantity: 1, unitPrice: 250.00, category: 'cleaning' }
        );
      } else {
        // Small quote
        services.push(
          { name: 'Mattress Clean', quantity: 1, unitPrice: 150.00, category: 'cleaning' },
          { name: 'Couch Clean', quantity: 1, unitPrice: 200.00, category: 'cleaning' }
        );
      }

      // Create services for this quote
      for (const serviceData of services) {
        await Service.create({
          ...serviceData,
          quoteId: quote.id
        });
      }
    }

    console.log(`✅ Created ${createdQuotes.length} quotes with services`);
    console.log('\n📋 Summary:');
    console.log(`   - Today's quotes: ${quotes.filter(q => new Date(q.createdAt).toDateString() === new Date().toDateString()).length}`);
    console.log(`   - Tomorrow's bookings: ${quotes.filter(q => q.preferredDate === getDate(1)).length}`);
    console.log(`   - Future bookings: ${quotes.filter(q => q.preferredDate && new Date(q.preferredDate) > new Date(getDate(1))).length}`);
    console.log(`   - Completed jobs: ${quotes.filter(q => q.status === 'completed').length}`);
    console.log(`   - Paid quotes: ${quotes.filter(q => q.paymentStatus === 'paid').length}`);
    console.log(`   - Unpaid quotes: ${quotes.filter(q => q.paymentStatus === 'unpaid').length}`);
    
    console.log('\n✨ Database seeding completed successfully!');
    console.log('\n📊 Status breakdown:');
    const statusCounts = {};
    quotes.forEach(q => {
      statusCounts[q.status] = (statusCounts[q.status] || 0) + 1;
    });
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`   - ${status}: ${count}`);
    });

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
};

// Run the seed
seedDatabase()
  .then(() => {
    console.log('\n🎉 Seeding process completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Seeding failed:', error);
    process.exit(1);
  });
