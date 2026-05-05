// ─── User Types ──────────────────────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'user';
  avatar_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserPublic {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  avatar_url?: string;
  created_at: string;
}

// ─── Profile Types ────────────────────────────────────────────────────────────

export interface Profile {
  id: string;
  user_id: string;
  weight?: number;
  height?: number;
  age?: number;
  gender?: string;
  goal?: string;
  activity_level?: string;
  target_weight?: number;
  daily_calorie_goal?: number;
  created_at: string;
  updated_at: string;
}

// ─── Workout Types ────────────────────────────────────────────────────────────

export type WorkoutType = 'cardio' | 'strength' | 'flexibility' | 'sports';

export interface Workout {
  id: string;
  user_id: string;
  name: string;
  type: WorkoutType;
  duration: number;          // minutes
  calories_burned?: number;
  sets?: number;
  reps?: number;
  weight_used?: number;      // kg
  notes?: string;
  date: string;
  created_at: string;
  updated_at: string;
}

// ─── Progress Types ───────────────────────────────────────────────────────────

export interface Progress {
  id: string;
  user_id: string;
  image_url?: string;
  weight?: number;
  notes?: string;
  date: string;
  created_at: string;
}

// ─── Request/Response Types ───────────────────────────────────────────────────

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: UserPublic;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  search?: string;
  type?: string;
  startDate?: string;
  endDate?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface WorkoutStats {
  totalWorkouts: number;
  totalMinutes: number;
  totalCalories: number;
  workoutsByType: Record<string, number>;
  averageDuration: number;
  streakDays: number;
}

// ─── JWT Payload ──────────────────────────────────────────────────────────────

export interface JwtPayload {
  userId: string;
  email: string;
  role: 'admin' | 'user';
  iat?: number;
  exp?: number;
}

// ─── Express Request Extension ────────────────────────────────────────────────

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}
