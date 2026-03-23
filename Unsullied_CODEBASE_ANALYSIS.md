# Unsullied Codebase Analysis

## 1. SYSTEM OVERVIEW

### What is this system?
**Unsullied** is a full-stack web application for South African cleaning and pest control services. It enables customers to select services (cleaning and pest control), enter their details (name, address, property type), see live pricing with a call-out fee, and receive a quote that can be sent via WhatsApp. Admins can manage quotes, view a booking calendar, and technicians can complete job cards with digital signatures.

### What problem does it solve?
- Streamlines quote requests for cleaning/pest control services
- Reduces friction by generating WhatsApp-ready messages
- Provides admin visibility into quotes and bookings
- Supports field technicians with job completion and signature capture

### Current state
**MVP / Near-complete prototype.** Core flows work end-to-end. Payment is placeholder. No auth. No automated tests.

### Core modules or domains
1. **Quote Management** – Create, list, update quotes
2. **Admin Dashboard** – Quote list, status updates, details modal
3. **Booking Calendar** – Bookings grouped by date
4. **Job Cards** – Technician completion with signature
5. **Payment Flow** – Optional payment step (placeholder gateway)
6. **WhatsApp Integration** – Quote links to WhatsApp
7. **Reporting** – Daily report API

---

## 2. TECHNOLOGY STACK

### Backend
| Technology | Version |
|------------|---------|
| Node.js | 18 (Alpine in Docker) |
| Express | ^4.18.2 |
| Sequelize | ^6.35.0 |
| PostgreSQL driver (pg) | ^8.11.3 |
| dotenv | ^16.3.1 |
| cors | ^2.8.5 |

### Frontend
| Technology | Version |
|------------|---------|
| Angular | ^16.2.0 |
| TypeScript | ~5.1.0 |
| RxJS | ~7.8.0 |
| TailwindCSS | ^3.3.0 |
| signature_pad | ^4.0.9 |
| FormsModule, ReactiveFormsModule | - |
| HttpClientModule | - |

### Database
- **Type**: PostgreSQL 16 (Alpine)
- **ORM**: Sequelize
- **Schema**: Sequelize `sync({ alter: true })` in development
- **Tables**: `quotes`, `services` (one-to-many)

### Infrastructure
- **Docker**: `backend/Dockerfile`, `frontend/Dockerfile`, `docker-compose.yml`
- **docker-compose**: postgres, backend, frontend (nginx)
- **CI**: GitHub Actions (`.github/workflows/ci.yml`)

### External integrations
- **WhatsApp**: `wa.me` links with pre-filled message
- **Google Maps**: `https://www.google.com/maps/search/?api=1&query=ENCODED_ADDRESS`
- **Payment**: Placeholder `https://pay.unsullied.co.za/:id` (no real gateway)

---

## 3. ARCHITECTURE

### Overall architectural pattern
**Modular monolith** – Backend and frontend are separate apps; backend follows routes → controllers → services → models.

### Folder/module structure

**Backend:**
```
backend/
├── src/
│   ├── server.js           # Entry point, middleware, route registration
│   ├── config/
│   │   ├── database.js     # Sequelize connection
│   │   └── constants.js    # CALL_OUT_FEE from env
│   ├── models/
│   │   ├── Quote.js        # Quote model (Sequelize)
│   │   └── Service.js      # Service model (belongs to Quote)
│   ├── routes/
│   │   └── quoteRoutes.js  # All quote-related routes
│   ├── controllers/
│   │   └── quoteController.js  # Request handlers
│   └── services/
│       └── quoteService.js     # Business logic
├── scripts/
│   └── seed.js             # Database seeding
├── .env.example
├── Dockerfile
└── package.json
```

**Frontend:**
```
frontend/
├── src/
│   ├── app/
│   │   ├── app.component.ts
│   │   ├── app.module.ts
│   │   ├── app-routing.module.ts
│   │   ├── pages/
│   │   │   ├── quote-form/          # Customer quote form
│   │   │   ├── admin-quotes/        # Admin dashboard
│   │   │   ├── admin-calendar/      # Booking calendar
│   │   │   ├── job-card/            # Technician job completion
│   │   │   └── payment-return/      # Payment callback handler
│   │   ├── components/
│   │   │   ├── service-selector/     # Service selection UI
│   │   │   └── signature-pad/       # Canvas signature capture
│   │   ├── services/
│   │   │   ├── quote.service.ts     # Quote API
│   │   │   └── admin.service.ts     # Admin API
│   │   └── models/
│   │       └── service.model.ts     # Interfaces, AVAILABLE_SERVICES
│   ├── environments/
│   │   ├── environment.ts           # apiUrl: localhost:3000/api
│   │   └── environment.prod.ts      # apiUrl: /api (relative)
│   └── styles.css
├── nginx.conf              # SPA routing, /api proxy to backend
├── Dockerfile               # Multi-stage: build Angular, serve via nginx
└── package.json
```

### Data flow
1. **Quote creation**: Form → `QuoteService.createQuote()` → `POST /api/quotes` → `quoteController.createQuote` → `quoteService.createQuote` → Quote + Services in DB
2. **Admin**: `AdminService.getAllQuotes()` → `GET /api/quotes` → controller → service → DB
3. **Job card**: `AdminService.submitJobCard()` → `POST /api/quotes/:id/job-card` → updates quote + jobCard JSONB

### Authentication & authorization
- **None.** Admin routes are open. README notes: "For now, admin access can be open — no auth needed."

### API design
**REST.** Endpoints:

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | /api/quotes | All quotes |
| GET | /api/quotes/report?date=today | Daily report |
| GET | /api/quotes/bookings | Booked quotes with preferredDate |
| POST | /api/quotes | Create quote |
| GET | /api/quotes/:id | Single quote |
| PATCH | /api/quotes/:id/status | Update status |
| POST | /api/quotes/:id/job-card | Submit job card |
| POST | /api/quotes/:id/payment | Record payment |
| GET | /health | Health check |

---

## 4. WHAT IS DONE

### Fully implemented features
1. **Quote form** – services, address, property type, preferred date/time, special instructions
2. **Quote preview modal** – cost breakdown, confirm before WhatsApp
3. **WhatsApp integration** – `wa.me` links with formatted message
4. **Payment flow** – optional "Continue to Payment" → placeholder URL → return → record payment → WhatsApp
5. **Admin dashboard** – list quotes, status dropdowns, view details modal
6. **Booking calendar** – bookings grouped by date, time block colors
7. **Job cards** – signature pad, technician notes, customer confirmation
8. **Daily report API** – today's quotes, status breakdown, tomorrow's bookings
9. **Google Maps** – "View Location on Map" in admin, calendar, job card
10. **Database seeding** – `npm run seed` for test data
11. **Docker** – backend, frontend, postgres via docker-compose
12. **CI** – GitHub Actions for build/lint/test (scripts mostly missing)

### Validation logic
- **Backend**: `quoteController` validates `customerName`, `address`, `addressType`, `services`, `addressType`, `timeBlock`; `quoteService.validateServices()` for services
- **Frontend**: `isFormValid()` checks required fields and at least one service
- **Models**: Sequelize validations on Quote and Service

### End-to-end flows
- Quote creation → DB → WhatsApp link
- Admin list/update quotes
- Job card submission → status "completed"
- Payment return → record payment → WhatsApp
- Calendar view of bookings

---

## 5. WHAT IS LEFT TO DO

### Incomplete / placeholder
1. **Payment gateway** – `https://pay.unsullied.co.za/:id` is fake; no PayFast/Yoco
2. **Admin auth** – no login or role checks
3. **README** – still mentions `WHATSAPP_PHONE=27123456789`; `.env.example` has `27767756770`

### Missing
1. **Tests**
   - No `*.spec.ts` in `frontend/src/app`
   - No `test` script in `backend/package.json`
   - CI runs `npm test || echo "No test script found"`
2. **Linting**
   - No `lint` script in backend or frontend `package.json`
   - CI runs `npm run lint || echo "No lint script found"`
3. **Route logging** – `server.js` logs routes but omits `/report` and `/bookings`

### Security gaps
- No auth on admin endpoints
- CORS allows all origins (`app.use(cors())`)
- No rate limiting
- No input sanitization beyond basic validation
- `WHATSAPP_PHONE` fallback hardcoded in `quoteController.js` (lines 56, 311)

### Config
- `environment.prod.ts` uses relative `/api`; nginx must proxy `/api` to backend (it does)
- `docker-compose` uses `WHATSAPP_PHONE: ${WHATSAPP_PHONE:-27123456789}` – outdated default

---

## 6. STAGING DEPLOYMENT READINESS

### What is missing before staging?
1. **Auth** – protect admin routes
2. **Payment** – real PayFast/Yoco integration
3. **Tests** – at least smoke tests
4. **Env/config** – document and validate required vars
5. **Migration strategy** – move from `sync({ alter })` to explicit migrations

### Docker
- `backend/Dockerfile` – Node 18 Alpine
- `frontend/Dockerfile` – multi-stage build + nginx
- `docker-compose.yml` – postgres, backend, frontend

### Environment variables
- **Documented**: `backend/.env.example` (PORT, DB_*, NODE_ENV, WHATSAPP_PHONE, CALL_OUT_FEE)
- **Frontend**: `environment.ts` / `environment.prod.ts` for `apiUrl`
- **Missing**: no `.env.example` at repo root; no frontend env docs

### Migration strategy
- Uses Sequelize `sync({ alter: true })` in development
- Custom migration in `server.js` for `totalWithCallOut`
- No formal migration files or versioning

### Estimate: developer days to staging
| Category | Days |
|----------|------|
| Auth (basic admin) | 2–3 |
| Payment integration | 3–5 |
| Tests (critical paths) | 2–3 |
| Config & docs | 0.5–1 |
| Security (rate limit, CORS) | 1 |
| **Total** | **~9–13** |

---

## 7. ONBOARDING GUIDE

### Clone and run
```bash
git clone <repo>
cd unsullied
```

### Backend
```bash
cd backend
npm install
cp .env.example .env
# Edit .env: DB_*, WHATSAPP_PHONE
npm start
```

### Frontend
```bash
cd frontend
npm install
npm start
```

### Docker
```bash
cp backend/.env.example backend/.env
# Edit backend/.env
docker-compose up -d
# Frontend: http://localhost
# Backend: http://localhost:3000
```

### Environment variables
**Backend (.env):**
- `PORT` (default 3000)
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`
- `NODE_ENV`
- `WHATSAPP_PHONE` (e.g. 27767756770)
- `CALL_OUT_FEE` (default 300)

**Frontend:** `apiUrl` in `environment.ts` / `environment.prod.ts`.

### Run commands
- Backend: `npm start` or `npm run dev`
- Frontend: `npm start`
- Seed: `cd backend && npm run seed`
- Tests: `npm test` (no tests implemented)

### Gotchas
1. PostgreSQL must be running before backend start
2. `sync({ alter })` can fail on schema changes (e.g. `totalWithCallOut`); custom migration in `server.js` handles that
3. Frontend expects backend at `http://localhost:3000` in dev
4. `signature_pad` in backend `package.json` is unused (frontend only)

---

## 8. HOW TO FULLY USE THE SYSTEM

### User journey (customer)
1. Open `/quote`
2. Enter name, address, property type
3. Select services and quantities
4. Optionally set preferred date/time and special instructions
5. Click "Get Quote & Send WhatsApp"
6. Review modal → "Continue to Payment" or "Skip Payment & Send to WhatsApp"
7. If payment: redirect to placeholder → return → WhatsApp opens
8. If skip: quote saved → WhatsApp opens

### Admin journey
1. Open `/admin/quotes`
2. View quotes, change status, open details
3. Click "View Location on Map" for address
4. Click "Job Card" for booked/pending quotes
5. Open `/admin/calendar` for bookings by date

### Technician journey
1. Open `/job-card/:id` (from admin)
2. View job details
3. Enter technician name, notes
4. Draw signature
5. Check "Customer confirms work completed"
6. Submit → quote status set to "completed"

### Roles
- **Customer**: quote form, payment flow
- **Admin**: dashboard, calendar, status updates (no auth)
- **Technician**: job card completion (no auth)

---

## 9. RISKS & RECOMMENDATIONS

### Technical risks
1. **Schema changes** – `sync({ alter })` can break on existing data; custom migration logic is brittle
2. **No auth** – admin and job card endpoints are public
3. **Payment** – placeholder flow; no real payment processing
4. **CI** – no real tests; CI effectively only builds

### Architectural concerns
1. **Single controller** – `quoteController` handles all quote logic; consider splitting by domain
2. **Inline migration** – migration logic in `server.js`; better as separate migration scripts
3. **Frontend API URL** – production uses `/api`; nginx proxy must be correct

### Top 3 priorities before staging
1. **Admin authentication** – protect `/admin/*` and job card routes
2. **Payment integration** – implement PayFast or Yoco
3. **Database migrations** – replace `sync({ alter })` with versioned migrations

---

*Analysis based on the codebase as of the review date. File paths and line numbers refer to the current structure.*
