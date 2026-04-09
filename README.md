# Food delivery (full stack)

Angular 15 frontend with a Node.js + Express + MongoDB backend. JWT auth is **disabled**; the app uses the user object stored in `localStorage` after login.

## Prerequisites

- Node.js 18+
- MongoDB running locally (or set `MONGO_URI` in `backend/.env`)

## Backend

```bash
cd backend
npm install
# Optional: create backend/.env with MONGO_URI=mongodb://127.0.0.1:27017/foodDelivery
npm run seed
npm start
```

API base URL: `http://localhost:5000/api` (see `frontend/src/app/core/services/api.service.ts`).

## Frontend

```bash
cd frontend
npm install
ng serve
```

Open `http://localhost:4200`. Register sends **POST** `/api/users` with `username`, `email`, `phoneNo`, `password`, and `role` (`Customer` or `Owner`).

## Project layout

- `backend/` — `controllers/`, `models/`, `routes/`, `config/`, `middleware/`, `seed/seed.js`, `server.js`
- `frontend/src/app/` — `core/` (services, guards, interceptors), `shared/`, `modules/` (auth, user, owner, delivery)
