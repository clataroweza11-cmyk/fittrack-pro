# 🧪 FitTrack Pro — API Testing Guide

Use this guide to test all endpoints via **Postman**, **Insomnia**, or **cURL**.

**Base URL (local):** `http://localhost:3000`  
**Base URL (production):** `https://fittrack-pro-api.onrender.com`

---

## 🔐 Authentication

### 1. Register a New User
```
POST /api/auth/register
Content-Type: application/json

{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "Password123"
}
```

**Expected Response (201):**
```json
{
  "message": "Registration successful!",
  "token": "eyJhbGci...",
  "user": {
    "id": "uuid",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "role": "user",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

---

### 2. Login
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@fittrackpro.com",
  "password": "Admin@123"
}
```

> 💡 **Copy the `token` from this response** — add it to all protected requests as:
> `Authorization: Bearer <token>`

---

### 3. Get Current User
```
GET /api/auth/me
Authorization: Bearer <token>
```

---

## 👤 Profile

### 4. Create / Update Profile
```
POST /api/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "weight": 75.5,
  "height": 175,
  "age": 28,
  "gender": "male",
  "goal": "Build muscle",
  "activity_level": "moderate",
  "target_weight": 80,
  "daily_calorie_goal": 2500
}
```

---

### 5. Get Profile
```
GET /api/profile
Authorization: Bearer <token>
```

---

## 🏋️ Workouts

### 6. Log a Workout
```
POST /api/workouts
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Morning Run",
  "type": "cardio",
  "duration": 45,
  "calories_burned": 380,
  "notes": "Felt great today!",
  "date": "2024-01-15"
}
```

---

### 7. Log a Strength Workout
```
POST /api/workouts
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Bench Press",
  "type": "strength",
  "duration": 60,
  "calories_burned": 280,
  "sets": 4,
  "reps": 10,
  "weight_used": 80,
  "date": "2024-01-15"
}
```

---

### 8. Get My Workouts (with filters)
```
GET /api/workouts?page=1&limit=10
GET /api/workouts?search=run
GET /api/workouts?type=cardio
GET /api/workouts?startDate=2024-01-01&endDate=2024-01-31
GET /api/workouts?type=strength&page=1&limit=5
Authorization: Bearer <token>
```

---

### 9. Get Workout Stats
```
GET /api/workouts/stats
Authorization: Bearer <token>
```

**Expected Response:**
```json
{
  "totalWorkouts": 15,
  "totalMinutes": 720,
  "totalCalories": 4500,
  "workoutsByType": {
    "cardio": 8,
    "strength": 6,
    "flexibility": 1
  },
  "averageDuration": 48,
  "streakDays": 3
}
```

---

### 10. Update a Workout
```
PUT /api/workouts/<workout-id>
Authorization: Bearer <token>
Content-Type: application/json

{
  "duration": 50,
  "calories_burned": 410,
  "notes": "Updated after tracking"
}
```

---

### 11. Delete a Workout
```
DELETE /api/workouts/<workout-id>
Authorization: Bearer <token>
```

---

## 📸 Progress

### 12. Upload Progress Photo
```
POST /api/progress
Authorization: Bearer <token>
Content-Type: multipart/form-data

image: [file upload]
weight: 74.2
notes: "Week 3 progress"
date: 2024-01-15
```

> In Postman: set Body to **form-data**, add `image` as **File** type

---

### 13. Get Progress Entries
```
GET /api/progress?page=1&limit=12
Authorization: Bearer <token>
```

---

### 14. Delete Progress Entry
```
DELETE /api/progress/<progress-id>
Authorization: Bearer <token>
```

---

## 👑 Admin Endpoints

> ⚠️ Requires `role: "admin"` JWT token

### 15. Get All Users
```
GET /api/users?page=1&limit=20
GET /api/users?search=jane
Authorization: Bearer <admin-token>
```

---

### 16. Get User by ID
```
GET /api/users/<user-id>
Authorization: Bearer <admin-token>
```

---

### 17. Update User (change role / deactivate)
```
PUT /api/users/<user-id>
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "role": "admin",
  "is_active": false
}
```

---

### 18. Delete User
```
DELETE /api/users/<user-id>
Authorization: Bearer <admin-token>
```

---

### 19. Get All Workouts (Admin)
```
GET /api/workouts/all?page=1&limit=20
Authorization: Bearer <admin-token>
```

---

## ❌ Error Response Examples

### Validation Error (400)
```json
{
  "error": "Validation failed",
  "messages": [
    "Duration must be at least 1 minute.",
    "Type must be one of: cardio, strength, flexibility, sports"
  ]
}
```

### Unauthorized (401)
```json
{
  "error": "Access denied. No token provided."
}
```

### Forbidden (403)
```json
{
  "error": "Access denied. Admin privileges required."
}
```

### Not Found (404)
```json
{
  "error": "Workout not found."
}
```

### Conflict (409)
```json
{
  "error": "An account with this email already exists."
}
```

---

## 🔧 Postman Environment Setup

Create a Postman Environment with these variables:

| Variable | Value |
|----------|-------|
| `base_url` | `http://localhost:3000` |
| `token` | *(empty, filled after login)* |
| `admin_token` | *(empty, filled after admin login)* |

**Auto-save token after login** — add this to the Login request's **Tests** tab:
```javascript
const res = pm.response.json();
if (res.token) {
  pm.environment.set("token", res.token);
}
```

Then use `{{token}}` in Authorization headers.
