# 🍔 QuickBite — Full-Stack Food Delivery App

A complete full-stack food delivery web application built from scratch — featuring user authentication, restaurant & menu management, real-time order tracking, Razorpay payments, email notifications, and an analytics dashboard.

## 🔗 Live Demo

| | Link |
|---|---|
| 🌐 **Frontend (Live Website)** | [https://food-delivery-anushri.netlify.app](https://food-delivery-anushri.netlify.app) |
| ⚙️ **Backend API** | [https://food-delivery-website-y1g9.onrender.com](https://food-delivery-website-y1g9.onrender.com) |
| 📦 **Repository** | [github.com/Anushri488/food-delivery-website](https://github.com/Anushri488/food-delivery-website) |

> ⚠️ Note: The backend is hosted on Render's free tier, which spins down after periods of inactivity. The first request after idle time may take up to 50 seconds to respond while the server wakes up.

---

## ✨ Features

### 👤 User System
- Register / Login with JWT authentication
- Secure password hashing (bcrypt)
- User profile management (name, address, phone)
- Forgot password via email OTP

### 🍽️ Restaurant & Menu Management
- Restaurants and menus stored in MongoDB
- Admin-only APIs to add / edit / delete restaurants and menu items
- Restaurant image upload via Cloudinary
- Role-based access control (user vs admin)

### 📦 Orders
- Place orders with server-side price validation
- Order history for logged-in users
- Order status tracking: `Placed → Preparing → Out for Delivery → Delivered`
- **Real-time status updates** via Socket.io — no page refresh needed

### 💳 Payments
- Razorpay checkout integration
- Server-side payment signature verification (security-critical)
- Downloadable PDF invoices for every order
- Refund support via Razorpay API

### 🔔 Notifications
- Order confirmation emails
- Order status update emails
- Sent asynchronously so API responses stay fast

### 📊 Analytics & Admin Dashboard (API)
- Total orders, users, restaurants, and revenue
- Most popular menu items
- Restaurant-wise sales report
- User activity / spending report

---

## 🛠️ Tech Stack

**Frontend:** HTML, CSS, JavaScript (vanilla) — no framework, deployed on Netlify

**Backend:** Node.js, Express.js — deployed on Render

**Database:** MongoDB Atlas (cloud-hosted) with Mongoose ODM

**Real-time:** Socket.io

**Authentication:** JWT + bcrypt

**Payments:** Razorpay

**Image Hosting:** Cloudinary

**Email:** Nodemailer (Gmail SMTP)

**PDF Generation:** PDFKit

---

## 📁 Project Structure

```
food-delivery-website/
├── backend/
│   ├── config/          # Database, Cloudinary, Razorpay configs
│   ├── controllers/     # Route logic (auth, orders, payments, etc.)
│   ├── middleware/      # JWT auth, admin check, file upload
│   ├── models/          # Mongoose schemas (User, Restaurant, Order)
│   ├── routes/          # Express route definitions
│   ├── utils/           # Email sender, invoice generator
│   ├── seeder.js        # Script to bulk-import sample restaurant data
│   └── server.js        # App entry point (Express + Socket.io)
│
└── food-delivery/
    ├── css/style.css
    ├── js/
    │   ├── api.js        # API helper functions, auth logic
    │   └── app.js         # UI rendering, cart, checkout logic
    └── index.html
```

---

## 🔑 API Overview

| Module | Base Route |
|---|---|
| Auth | `/api/auth` — register, login, profile, forgot/reset password |
| Restaurants | `/api/restaurants` — CRUD + image upload |
| Orders | `/api/orders` — place, track, status update, invoice |
| Payments | `/api/payments` — create order, verify, refund |
| Analytics | `/api/analytics` — overview, popular items, sales report |

All protected routes require a `Bearer <token>` in the `Authorization` header. Admin-only routes additionally check the user's `role`.

---

## ⚙️ Environment Variables

The backend requires a `.env` file (not committed to this repo) with the following keys:

```
PORT=
MONGO_URI=
JWT_SECRET=
NODE_ENV=
EMAIL_USER=
EMAIL_PASS=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
```

---

## 🚀 Running Locally

**Backend:**
```bash
cd backend
npm install
npm run dev
```

**Frontend:**
Open `food-delivery/index.html` with a local server (e.g. VS Code's Live Server extension) — update `API_BASE_URL` in `js/api.js` to point to your local backend if needed.

---

## 📌 About This Project

This project was built end-to-end — backend architecture, database design, authentication, real-time features, payment gateway integration, and deployment — as a hands-on learning project covering the full lifecycle of a production-style web application.

---

## 👩‍💻 Author

**Anushri Mishra**
[GitHub](https://github.com/Anushri488)
