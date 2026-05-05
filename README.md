# 🏋️ FitTrack Pro — Fitness Tracking System

A full-stack fitness tracking web application built with Angular + Node.js/Express + Supabase.

---

## 🌐 Live Links

| Service | URL |
|--------|-----|
| Frontend (Vercel) | `https://fittrack-pro.vercel.app` |
| Backend API (Render) | `https://fittrack-pro-api.onrender.com` |
| Swagger Docs | `https://fittrack-pro-api.onrender.com/api-docs` |

> Replace with your actual deployed URLs after deployment.

---

## 🧰 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Angular 17, Tailwind CSS, RxJS |
| Backend | Node.js, Express, TypeScript |
| Database | Supabase (PostgreSQL) |
| Auth | JWT (JSON Web Tokens) |
| Storage | Supabase Storage |
| Deployment | Vercel (client), Render (server) |

---

## 🚀 Setup Instructions

### Prerequisites
- Node.js v18+
- npm v9+
- Angular CLI (`npm install -g @angular/cli`)
- Supabase account ([supabase.com](https://supabase.com))

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/fittrack-pro.git
cd fittrack-pro
```

### 2. Supabase Setup
1. Create a new Supabase project
2. Go to **SQL Editor** and run the contents of `server/src/config/schema.sql`
3. Go to **Storage** → Create a bucket named `progress-images` (set to public)
4. Copy your **Project URL** and **anon key** from Settings → API

### 3. Backend Setup
```bash
cd server
npm install
cp .env.example .env
# Fill in your Supabase credentials in .env
npm run dev
```

### 4. Frontend Setup
```bash
cd client
npm install
# Update environment.ts with your backend URL
ng serve
```

---

## 📡 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login & get JWT |
| GET | `/api/auth/me` | Get current user |

### Users (Admin)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | Get all users |
| GET | `/api/users/:id` | Get user by ID |
| PUT | `/api/users/:id` | Update user |
| DELETE | `/api/users/:id` | Delete user |

### Profile
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/profile` | Get my profile |
| POST | `/api/profile` | Create/update profile |

### Workouts
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/workouts` | Get my workouts (paginated) |
| POST | `/api/workouts` | Log new workout |
| PUT | `/api/workouts/:id` | Update workout |
| DELETE | `/api/workouts/:id` | Delete workout |
| GET | `/api/workouts/stats` | Get workout stats |

### Progress
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/progress` | Get progress logs |
| POST | `/api/progress` | Upload progress photo + notes |
| DELETE | `/api/progress/:id` | Delete progress entry |

---

## ✅ Features Implemented

- [x] JWT Authentication (Register/Login)
- [x] Role-based access (Admin / User)
- [x] Fitness Profile (weight, height, goal)
- [x] Workout Tracker (type, duration, calories, date)
- [x] Progress photo upload (Supabase Storage)
- [x] Dashboard with stats & charts
- [x] Search, filter & pagination for workouts
- [x] Admin panel (manage users + all logs)
- [x] Swagger/OpenAPI documentation
- [x] Responsive UI (Tailwind CSS)
- [x] Loading states & error handling
- [x] Route Guards (auth + role-based)
- [x] HTTP Interceptors (JWT injection)
- [x] Input validation (backend + frontend)

---

## 📸 Screenshots

See the `screenshots/` folder for UI and API testing screenshots.

---

## 👥 Team

| Role | Responsibility |
|------|---------------|
| Frontend Developer | Angular components, routing, UI |
| Backend Developer | API, database, authentication |
| UI/UX + DevOps | Design system, deployment, docs |
