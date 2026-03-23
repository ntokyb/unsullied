# Database Seeding Script

This script creates comprehensive test data for the Unsullied application to test all features.

## Usage

```bash
npm run seed
```

## What It Creates

The seed script creates **13 test quotes** covering:

### Status Distribution:
- **sent_to_whatsapp**: 2 quotes
- **pending**: 2 quotes  
- **booked**: 5 quotes (for calendar view)
- **completed**: 2 quotes (with job cards)
- **cancelled**: 1 quote

### Date Distribution:
- **Today**: 5 quotes (various statuses)
- **Tomorrow**: 3 bookings (for calendar testing)
- **Future dates**: 2 bookings (next week)
- **Past dates**: 2 completed jobs

### Payment Status:
- **Paid**: 7 quotes
- **Unpaid**: 6 quotes

### Features Tested:
✅ All quote statuses  
✅ Payment status (paid/unpaid)  
✅ Preferred dates (today, tomorrow, future, past)  
✅ All time blocks (morning, midday, afternoon)  
✅ Address types (estate/complex, house)  
✅ Special instructions  
✅ Job cards (for completed quotes)  
✅ Various service combinations  
✅ Google Maps addresses (South African addresses)  

## Data Cleared

⚠️ **Warning**: The script clears ALL existing quotes and services before seeding. If you want to keep existing data, comment out the clearing section in `seed.js`.

## Test Scenarios

After running the seed, you can test:

1. **Admin Dashboard** (`/admin/quotes`):
   - View all quotes with different statuses
   - Filter by status
   - Update quote statuses
   - View quote details

2. **Calendar View** (`/admin/calendar`):
   - See tomorrow's bookings (3 bookings)
   - See future bookings
   - View booking details

3. **Daily Report** (`GET /api/quotes/report?date=today`):
   - See today's quote count
   - Status breakdown
   - Tomorrow's bookings

4. **Job Cards** (`/job-card/:id`):
   - Test with completed quotes (IDs with job cards)

5. **Google Maps**:
   - Click "View Location on Map" on any quote
   - Test with various South African addresses

6. **Payment Flow**:
   - Test with paid quotes
   - Test with unpaid quotes

## Customization

To customize the seed data, edit `scripts/seed.js` and modify the `quotes` array.
