# 🍕 ByteBites — Food Delivery System

A full-stack food delivery web application built with **Angular 15** (frontend) and **Node.js + Express + MongoDB** (backend).

---

## 📋 Prerequisites

Before you start, make sure you have these installed:

| Tool | Version | Install |
|------|---------|---------|
| Node.js | v16, v18, or v20 | https://nodejs.org |
| npm | v8+ (comes with Node) | — |
| MongoDB | Local or Atlas | https://www.mongodb.com/try/download/community |
| Angular CLI | v15 | `npm install -g @angular/cli@15` |

> **MongoDB**: If using local MongoDB, make sure it's running before starting the backend.
> Default connection: `mongodb://127.0.0.1:27017/food-delivery`

---

## 🚀 How to Run

### Terminal 1 — Backend

```bash
cd backend
npm install
npm start
```

Server starts at: **http://localhost:5000**

---

### Terminal 2 — Frontend

```bash
cd frontend
npm install
npm start
```

App opens at: **http://localhost:4200**

---

## ⚙️ Environment Configuration

The backend works out of the box with default settings (no `.env` file required for local development).

To customise, copy the example file:

```bash
cd backend
cp .env.example .env
```

Then edit `.env`:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/food-delivery
```

For **MongoDB Atlas**, replace `MONGO_URI` with your Atlas connection string:

```env
MONGO_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/food-delivery
```

---

## 🔑 First Use

The database starts empty. Create accounts using the Signup page.

| Role | Signup path | Access |
|------|------------|--------|
| Customer | `/signup` → select **User** | Browse restaurants, cart, orders |
| Restaurant Owner | `/signup` → select **Restaurant Owner** | Manage restaurants, menus, orders |

> **Same email for both roles** is supported — you can register as both Customer and Owner using the same email address.

---

## 📁 Project Structure

```
infosys-project/
├── backend/            # Node.js + Express API
│   ├── config/         # MongoDB connection
│   ├── controllers/    # Route handlers
│   ├── middleware/     # Auth, error handling
│   ├── models/         # Mongoose schemas
│   ├── routes/         # API routes
│   ├── utils/          # dbManager (data layer)
│   ├── .env.example    # Environment template
│   └── server.js       # Entry point
│
└── frontend/           # Angular 15 app
    └── src/app/
        ├── auth/           # Login, Signup
        ├── customer/       # Customer pages
        ├── RestaurantOwner/ # Owner pages
        ├── core/           # Services, guards
        └── shared/         # Shared components
```

---

## 🔗 API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/health` | Server health check | None |
| POST | `/api/auth/login` | Login (role required) | None |
| POST | `/api/auth/register/customer` | Register customer | None |
| POST | `/api/auth/register/owner` | Register owner | None |
| GET | `/api/restaurants` | List all restaurants | None |
| GET | `/api/restaurants/:id` | Get restaurant | None |
| POST | `/api/restaurants` | Create restaurant | Owner |
| PUT | `/api/restaurants/:id` | Update restaurant | Owner |
| DELETE | `/api/restaurants/:id` | Delete restaurant | Owner |
| GET | `/api/menu/restaurant/:id` | Get public menu | None |
| GET | `/api/menu/owner/restaurant/:id` | Get owner menu (all items) | Owner |
| POST | `/api/menu` | Add menu item | Owner |
| PUT | `/api/menu/:id` | Update menu item | Owner |
| DELETE | `/api/menu/:id` | Delete menu item | Owner |
| GET | `/api/cart/user/:userId` | Get user cart | Customer |
| POST | `/api/cart/add-item` | Add to cart | Customer |
| PUT | `/api/cart/update-quantity` | Update quantity | Customer |
| POST | `/api/cart/remove-item` | Remove item | Customer |
| POST | `/api/orders` | Place order | Customer |
| GET | `/api/orders/user/:userId` | Get user orders | Customer |
| GET | `/api/orders/restaurant/:id` | Get restaurant orders | Owner |
| PUT | `/api/orders/:id/status` | Update order status | Owner |
| PUT | `/api/orders/:id/cancel` | Cancel order | Customer |

---

## 🔐 Authentication

- No JWT — uses a custom token format stored in `localStorage`
- Token is sent with every protected request via `x-auth-token` header
- Role-based access enforced on both frontend (AuthGuard) and backend (auth + roleAuth middleware)

---

## 🛠️ Development Mode (with auto-reload)

```bash
# Backend with nodemon (auto-restarts on file changes)
cd backend
npm run dev

# Frontend (already has live reload via ng serve)
cd frontend
npm start
```

---

## 🐛 Troubleshooting

| Problem | Fix |
|---------|-----|
| `MongoDB connection failed` | Make sure MongoDB is running locally. Run: `mongod` |
| `ng: command not found` | Install Angular CLI: `npm install -g @angular/cli@15` |
| Port 4200 already in use | `npx ng serve --port 4201` |
| Port 5000 already in use | Change `PORT=5001` in `backend/.env` |
| `Cannot GET /api/...` | Backend may not be running. Run `npm start` in the `backend/` folder |
| Cart shows old data after login | Clear localStorage in DevTools → Application → Local Storage |

---

## ✅ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Angular 15, Bootstrap 5, SCSS |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Authentication | Custom token (no JWT) |
| Package manager | npm |
