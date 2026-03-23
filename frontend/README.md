# Unsullied Frontend

Angular frontend application for Unsullied cleaning and pest control services platform.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Update API URL in `src/app/services/quote.service.ts` if needed:
```typescript
private apiUrl = 'http://localhost:3000/api';
```

3. Start the development server:
```bash
npm start
```

The app will be available at `http://localhost:4200`

## Build

Build for production:
```bash
npm run build
```

The build artifacts will be stored in the `dist/` directory.

## Features

- Responsive, mobile-first design
- Real-time price calculation
- Service selection with quantity controls
- WhatsApp integration for quote sharing
- Form validation
- Clean Angular architecture with routing
