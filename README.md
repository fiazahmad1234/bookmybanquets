# 🏛️ BookMyBanquets
## Pakistan's #1 Premium Banquet Hall Booking Platform

A **full-stack MERN-style** event venue booking platform with PostgreSQL, built with React + Node.js + Express + Socket.IO.

---

## 🎨 Theme & Design
- **Colors:** Deep Amber `#C4823A` · Dark Mahogany `#2C1810` · Warm Cream `#FDF5E6` · Burgundy `#8B1A1A`
- **Fonts:** Playfair Display (headings) · DM Sans (body) · Cormorant Garamond (elegant text)
- **Style:** Luxury premium aesthetic — unique, professional, non-generic

---

## 📁 Project Structure

```
bookmybanquets/
├── frontend/          # React 18 SPA
│   ├── src/
│   │   ├── components/
│   │   │   └── common/    # Navbar, Footer, Sidebar, HallCard
│   │   ├── context/       # AuthContext (JWT auth + API)
│   │   ├── pages/
│   │   │   ├── Home.js            # Landing page
│   │   │   ├── Halls.js           # Listing + filters + AI
│   │   │   ├── HallDetail.js      # Gallery + booking form
│   │   │   ├── Auth.js            # Login + Register
│   │   │   ├── Vendors.js         # Marketplace
│   │   │   ├── Profile.js         # User profile
│   │   │   ├── customer/          # Customer dashboard + bookings
│   │   │   ├── manager/           # Manager dashboard + halls
│   │   │   └── admin/             # Admin dashboard
│   │   └── styles/
│   │       └── global.css         # Design tokens + utility classes
│   └── package.json
│
├── backend/           # Node.js + Express API
│   ├── config/
│   │   └── database.js    # PostgreSQL pool
│   ├── controllers/       # Auth, Halls, Bookings, Reviews, Admin, Vendors
│   ├── middleware/        # Auth (JWT), Upload (Multer)
│   ├── routes/            # All API routes
│   ├── utils/
│   │   └── emailService.js # Nodemailer email templates
│   ├── uploads/           # Uploaded images (auto-created)
│   ├── server.js          # Express + Socket.IO server
│   ├── package.json
│   └── .env.example
│
└── database/
    ├── schema.sql     # Complete PostgreSQL schema
    └── seed.js        # Demo data seeder
```

---

## 🚀 Quick Setup

### Prerequisites
- **Node.js** v18+
- **PostgreSQL** v14+
- **npm** or **yarn**

---

### 1. Database Setup

```bash
# Create database
psql -U postgres
CREATE DATABASE bookmybanquets;
\q

# Run schema
psql -U postgres -d bookmybanquets -f database/schema.sql
```

---

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your DB credentials and JWT secret

# Seed demo data
npm run seed

# Start server
npm run dev    # Development (nodemon)
npm start      # Production
```

Backend runs on: `http://localhost:5000`

---

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

Frontend runs on: `http://localhost:3000`

---

## 🔐 Demo Credentials

| Role     | Email                          | Password      |
|----------|--------------------------------|---------------|
| Admin    | admin@bookmybanquets.com       | Admin@123     |
| Manager  | ahmed@manager.com              | Manager@123   |
| Customer | ali@customer.com               | Customer@123  |

---

## ✨ Features

### 👤 Customer
- Browse & search 500+ halls with 15+ filters
- **AI-powered recommendations** (event type, budget, city)
- Side-by-side hall comparison (up to 4)
- Real-time availability calendar check
- Book halls with pricing calculator
- Coupon code support (FIRST10, SAVE500, WELCOME15)
- View and manage bookings (cancel, review)
- Write verified reviews with sub-ratings
- Direct chat with hall managers (Socket.IO)
- Notification center
- Profile management

### 🏛️ Hall Manager
- Add & manage multiple halls
- Upload hall images and amenities
- View booking requests (confirm/reject)
- Revenue analytics with charts (Recharts)
- Monthly booking trends
- Reply to customer reviews
- Real-time chat with customers

### 👑 Admin
- Platform-wide dashboard
- User management (enable/disable)
- Hall approval workflow
- Vendor approval system
- Revenue & booking analytics
- All bookings overview

---

## 🌐 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login |
| GET | `/api/halls` | List halls (filters) |
| GET | `/api/halls/recommendations` | AI recommendations |
| GET | `/api/halls/:id/availability` | Check availability |
| POST | `/api/bookings` | Create booking |
| GET | `/api/bookings/stats` | Dashboard stats |
| PUT | `/api/bookings/:id/status` | Update status |
| POST | `/api/reviews` | Submit review |
| GET | `/api/admin/dashboard` | Admin stats |
| ... | ... | 30+ endpoints total |

---

## 🤖 AI Prediction Logic

The AI recommendation engine scores halls based on:
- **40%** Average rating
- **30%** Price-to-budget ratio  
- **30%** Review count (popularity)

Filtered by: city, event type, guest capacity, budget range.

Each recommendation includes a personalized reason string highlighting key matching features.

---

## 🔧 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router v6 |
| State | Context API + JWT |
| Charts | Recharts |
| Forms | React Hook Form |
| Real-time | Socket.IO |
| Backend | Node.js, Express 4 |
| Database | PostgreSQL + pg |
| Auth | JWT + bcryptjs |
| Email | Nodemailer |
| Upload | Multer |
| Security | Helmet, Rate Limiting, CORS |

---

## 📧 Email Configuration

Update `.env` with SMTP credentials:
```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_app_password  # Gmail App Password
```

For Gmail: Enable 2FA → App Passwords → Generate password

---

## 🌍 Environment Variables

```env
PORT=5000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=bookmybanquets
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your_very_long_secret_key
JWT_EXPIRE=7d
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your@email.com
EMAIL_PASS=your_app_password
FRONTEND_URL=http://localhost:3000
```

---

## 🗃️ Database Tables

1. **users** — Customers, Managers, Admins
2. **halls** — Hall listings with all features
3. **hall_images** — Multiple images per hall
4. **hall_amenities** — Custom amenities
5. **bookings** — All booking records
6. **booking_services** — Additional services per booking
7. **reviews** — Verified customer reviews
8. **vendors** — Marketplace vendors
9. **vendor_bookings** — Vendor hire records
10. **messages** — Real-time chat messages
11. **notifications** — System notifications

---

## 📦 Production Deployment

```bash
# Frontend build
cd frontend && npm run build

# Serve with nginx or serve the build folder via Express
cd backend && NODE_ENV=production npm start
```

---

**Built with ❤️ for BookMyBanquets**
