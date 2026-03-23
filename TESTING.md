# 🧪 Testing Guide for Unsullied Application

This guide helps you test all features of the Unsullied application using the seed data.

## 🚀 Quick Start

1. **Start the backend server:**
   ```bash
   cd backend
   npm start
   ```

2. **Seed the database with test data:**
   ```bash
   cd backend
   npm run seed
   ```

3. **Start the frontend:**
   ```bash
   cd frontend
   npm start
   ```

## 📊 Test Data Overview

The seed script creates **13 test quotes** with:

- **5 statuses**: sent_to_whatsapp, pending, booked, completed, cancelled
- **Dates**: Today, tomorrow, future, and past dates
- **Payment statuses**: Paid and unpaid
- **Time blocks**: Morning, midday, afternoon
- **Address types**: Estate/complex and house
- **Job cards**: 2 completed quotes with job cards

## 🧪 Feature Testing Checklist

### 1. Admin Dashboard (`/admin/quotes`)

✅ **View All Quotes**
- Navigate to `/admin/quotes`
- Should see 13 quotes in the table
- Verify all statuses are displayed with correct color badges

✅ **Status Filtering**
- Change status dropdowns for different quotes
- Test all status transitions:
  - sent_to_whatsapp → pending → booked → completed
  - Any status → cancelled

✅ **View Quote Details**
- Click "View" button on any quote
- Verify modal shows:
  - Customer name
  - Address with "View Location on Map" button
  - Preferred date and time block
  - Services list
  - Cost breakdown
  - Payment status

✅ **Google Maps Integration**
- Click "View Location on Map" button
- Should open Google Maps in new tab
- Test from:
  - Table view (desktop)
  - Table view (mobile)
  - Details modal

✅ **Job Card Links**
- Quotes with status "booked", "pending", or "sent_to_whatsapp" should show "Job Card" link
- Click to navigate to job card page

### 2. Calendar View (`/admin/calendar`)

✅ **View Bookings**
- Navigate to `/admin/calendar`
- Should see bookings grouped by date
- Verify:
  - Tomorrow's bookings (3 bookings)
  - Future bookings
  - Date headers show "Today", "Tomorrow", or formatted dates

✅ **Time Block Colors**
- Morning bookings: Yellow background
- Midday bookings: Orange background
- Afternoon bookings: Blue background

✅ **Booking Details**
- Click on any booking card
- Should navigate to admin quotes page
- Test "View Location on Map" button

✅ **Empty State**
- Filter to a date with no bookings (if possible)
- Should show "No bookings" message

### 3. Daily Report API (`GET /api/quotes/report?date=today`)

✅ **Test Endpoint**
```bash
curl http://localhost:3000/api/quotes/report?date=today
```

✅ **Verify Response**
- `newQuotesToday`: Should be 5 (quotes created today)
- `statusBreakdown`: Should show counts for each status
- `bookingsForTomorrow`: Should list 3 bookings for tomorrow

### 4. Job Card Component (`/job-card/:id`)

✅ **Access Job Card**
- Use a quote ID from a "booked" quote
- Navigate to `/job-card/:id`
- Should display:
  - Customer name and address
  - Services list
  - "View Location on Map" button
  - Technician notes field
  - Signature pad
  - Customer confirmation checkbox

✅ **Submit Job Card**
- Fill in technician name
- Add notes
- Draw signature
- Check customer confirmation
- Submit
- Should update quote status to "completed"

### 5. Quote Form (`/quote`)

✅ **Create New Quote**
- Fill in customer name
- Enter address (test both estate and house formats)
- Select services
- Set preferred date (must be future)
- Select time block
- Add special instructions
- Submit quote

✅ **Quote Preview Modal**
- Click "Get Quote & Send WhatsApp"
- Verify modal shows:
  - Customer details
  - Grouped services
  - Cost breakdown (subtotal, call-out fee, grand total)
  - "Continue to Payment" button
  - "Skip Payment & Send to WhatsApp" button

✅ **Payment Flow**
- Click "Continue to Payment"
- Should redirect to payment link (placeholder)
- After payment return, should record payment and open WhatsApp

✅ **WhatsApp Preview**
- Toggle "Preview WhatsApp Message"
- Verify message includes:
  - Customer name
  - Address
  - Services with quantities and prices
  - Subtotal, call-out fee, grand total
  - Preferred date and time
  - Special instructions
  - Payment status (if paid)

### 6. Payment Features

✅ **Payment Status**
- Check quotes with `paymentStatus: 'paid'`
- Should show "✓ Paid" badge
- WhatsApp message should include "✅ Paid Online"

✅ **Payment Recording**
- Test payment return flow
- Verify payment is recorded in database
- Check WhatsApp message includes payment confirmation

### 7. Google Maps Integration

✅ **Test All Locations**
- Test "View Location on Map" from:
  - Admin quotes table
  - Admin quotes modal
  - Calendar view
  - Job card page
- Verify all South African addresses open correctly in Google Maps

### 8. Status Workflows

✅ **Complete Workflow**
1. Create quote → status: "sent_to_whatsapp"
2. Update to "pending" → verify yellow badge
3. Update to "booked" → verify green badge
4. Complete job card → status: "completed" → verify purple badge

✅ **Cancellation Workflow**
1. Create quote → any status
2. Update to "cancelled" → verify red badge
3. Verify cancelled quotes don't appear in calendar

## 🐛 Common Issues & Solutions

### Issue: No quotes showing
**Solution**: Run `npm run seed` in backend directory

### Issue: Calendar shows no bookings
**Solution**: Check that quotes have `status: 'booked'` and `preferredDate` set

### Issue: Google Maps not opening
**Solution**: Verify address is properly formatted and URL encoding works

### Issue: Job card not submitting
**Solution**: Ensure all required fields are filled (name, signature, confirmation)

## 📝 Test Data Reference

### Quote IDs by Status:
- **sent_to_whatsapp**: Check admin dashboard
- **pending**: Check admin dashboard  
- **booked**: Check calendar view (tomorrow has 3)
- **completed**: Check admin dashboard (has job cards)
- **cancelled**: Check admin dashboard

### Test Addresses:
All addresses are real South African format:
- Estate/Complex: Unit numbers, street names, suburbs
- House: Street addresses, suburbs, cities, postal codes

## 🎯 Success Criteria

All features should work:
- ✅ View quotes in admin dashboard
- ✅ Filter and update quote statuses
- ✅ View calendar with bookings
- ✅ Generate daily reports
- ✅ Complete job cards
- ✅ View locations on Google Maps
- ✅ Process payments
- ✅ Generate WhatsApp messages

Happy Testing! 🚀
