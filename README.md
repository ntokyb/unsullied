# Unsullied

A full-stack, production-ready web application for South African cleaning and pest control services.

## 🎯 Features

- **Service Selection**: Choose from cleaning and pest control services
- **Live Pricing**: Real-time total calculation as you select services
- **WhatsApp Integration**: Send quotes directly via WhatsApp
- **Responsive Design**: Mobile-first, works on all devices
- **PostgreSQL Storage**: All quotes are saved to the database

## 🏗️ Architecture

### Backend
- Node.js + Express
- PostgreSQL + Sequelize
- RESTful API
- Clean separation of concerns (routes, controllers, services, models)

### Frontend
- Angular 16+
- TailwindCSS
- Reactive Forms
- HTTP Client for API communication

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL (local or cloud)
- npm or yarn

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your PostgreSQL connection details
npm start
```

Backend runs on `http://localhost:3000`

### Frontend Setup

```bash
cd frontend
npm install
npm start
```

Frontend runs on `http://localhost:4200`

## 📁 Project Structure

```
unsullied-app/
├── backend/
│   ├── src/
│   │   ├── routes/          # API routes
│   │   ├── controllers/     # Request handlers
│   │   ├── services/        # Business logic
│   │   ├── models/          # Sequelize models
│   │   ├── config/          # Database configuration
│   │   └── server.js        # Entry point
│   ├── package.json
│   └── Dockerfile
├── frontend/
│   ├── src/app/
│   │   ├── pages/           # Page components
│   │   ├── components/      # Reusable components
│   │   ├── services/        # API services
│   │   └── models/          # TypeScript interfaces
│   ├── tailwind.config.js
│   └── package.json
└── README.md
```

## 🔌 API Endpoints

### POST /api/quotes
Create a new quote request.

**Request:**
```json
{
  "customerName": "John Doe",
  "address": "123 Main St, Cape Town",
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
  "quote": { ... },
  "whatsappMessage": "...",
  "whatsappLink": "https://wa.me/..."
}
```

## 🐳 Docker

### Using Docker Compose (Recommended)
```bash
# Start all services (PostgreSQL, Backend, Frontend)
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

### Individual Docker Builds

**Backend:**
```bash
cd backend
docker build -t unsullied-backend .
docker run -p 3000:3000 --env-file .env unsullied-backend
```

**Frontend:**
```bash
cd frontend
docker build -t unsullied-frontend .
docker run -p 80:80 unsullied-frontend
```

## 📝 Environment Variables

### Backend (.env)
```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=unsullied
DB_USER=postgres
DB_PASSWORD=postgres
NODE_ENV=development
WHATSAPP_PHONE=27123456789
```

**Note:** Update `WHATSAPP_PHONE` with your actual WhatsApp Business number (format: country code + number, e.g., 27123456789 for South Africa).

### Frontend
The API URL is configured in `frontend/src/environments/environment.ts` for development and `environment.prod.ts` for production.

## 🔮 Planned Features

- Online payment integration (Yoco/PayFast)
- Admin dashboard
- Booking management system
- Email notifications
- SMS notifications

## 📄 License

ISC
