# Unsullied Backend API

Backend API for Unsullied cleaning and pest control services platform.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file from `.env.example`:
```bash
cp .env.example .env
```

3. Update `.env` with your PostgreSQL connection details:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=unsullied
DB_USER=postgres
DB_PASSWORD=postgres
PORT=3000
WHATSAPP_PHONE=27123456789
```

**Note:** Make sure PostgreSQL is installed and running. The database will be created automatically if it doesn't exist.

4. Start the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

## API Endpoints

### POST /api/quotes
Create a new quote request.

**Request Body:**
```json
{
  "customerName": "John Doe",
  "address": "123 Main Street, Cape Town",
  "addressType": "house",
  "services": [
    {
      "name": "Mattress Clean",
      "quantity": 2,
      "unitPrice": 150.00,
      "category": "cleaning"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "quote": {
    "id": "...",
    "customerName": "John Doe",
    "address": "123 Main Street, Cape Town",
    "addressType": "house",
    "services": [...],
    "total": 300.00,
    "createdAt": "2026-01-29T..."
  },
  "whatsappMessage": "...",
  "whatsappLink": "https://wa.me/..."
}
```

## Docker

Build and run with Docker:
```bash
docker build -t unsullied-backend .
docker run -p 3000:3000 --env-file .env unsullied-backend
```
