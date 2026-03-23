# Quick Start Guide

Get Unsullied up and running in minutes!

## Prerequisites

- Node.js 18+ installed
- PostgreSQL running (local or cloud)
- npm or yarn

## Step 1: Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env` and update:
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` - Your PostgreSQL connection details
- `WHATSAPP_PHONE` - Your WhatsApp Business number (format: 27123456789)

```bash
npm start
```

Backend should be running at `http://localhost:3000`

## Step 2: Frontend Setup

Open a new terminal:

```bash
cd frontend
npm install
npm start
```

Frontend should be running at `http://localhost:4200`

## Step 3: Test the Application

1. Open `http://localhost:4200` in your browser
2. Fill in your name and address
3. Select services and quantities
4. Click "Get Quote & Send WhatsApp"
5. Click "Open WhatsApp" to send the message

## Using Docker Compose

For a complete setup with PostgreSQL:

```bash
# Create backend/.env file first
cd backend
cp .env.example .env
# Edit .env with your WhatsApp phone number

# Then start everything
cd ..
docker-compose up -d
```

Access:
- Frontend: `http://localhost`
- Backend API: `http://localhost:3000`
- PostgreSQL: `localhost:5432`

## Troubleshooting

### Backend won't start
- Check PostgreSQL is running: `psql -U postgres` or check pgAdmin
- Verify `.env` file exists and has correct database credentials
- Check port 3000 is not in use
- Ensure PostgreSQL database exists (it will be created automatically if user has permissions)

### Frontend won't connect to backend
- Verify backend is running on port 3000
- Check CORS settings in backend
- Update `frontend/src/environments/environment.ts` if backend is on different port

### WhatsApp link not working
- Verify `WHATSAPP_PHONE` in backend `.env` is correct format (no +, no spaces)
- Format: `27123456789` (country code + number)
