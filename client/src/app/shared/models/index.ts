// ─── User ─────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  avatar_url?: string;
  is_active?: boolean;
  created_at: string;
}

export interface AuthResponse {
  token: string;
  user: User;
  message: string;
}

// ─── Profile ──────────────────────────────────────────────────────────────────

export interface FitnessProfile {
  id?: string;
  user_id?: string;
  weight?: number;
  height?: number;
  age?: number;
  gender?: string;
  goal?: string;
  activity_level?: string;
  target_weight?: number;
  daily_calorie_goal?: number;
  created_at?: string;
  updated_at?: string;
}

// ─── Workout ─────────────────────────────────────────────────────────────────

export type WorkoutType = 'cardio' | 'strength' | 'flexibility' | 'sports';

export interface Workout {
  id: string;
  user_id: string;
  name: string;
  type: WorkoutType;
  duration: number;
  calories_burned?: number;
  sets?: number;
  reps?: number;
  weight_used?: number;
  notes?: string;
  date: string;
  created_at: string;
  updated_at?: string;
  users?: { name: string; email: string }; // admin join
}

export interface WorkoutStats {
  totalWorkouts: number;
  totalMinutes: number;
  totalCalories: number;
  workoutsByType: Record<string, number>;
  averageDuration: number;
  streakDays: number;
}

// ─── Progress ────────────────────────────────────────────────────────────────

export interface Progress {
  id: string;
  user_id: string;
  image_url?: string;
  weight?: number;
  notes?: string;
  date: string;
  created_at: string;
}

// ─── API Response ─────────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiError {
  error: string;
  messages?: string[];
}
