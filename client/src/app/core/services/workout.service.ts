import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Workout, WorkoutStats, PaginatedResponse } from '../../shared/models';

export interface WorkoutFilter {
  page?: number;
  limit?: number;
  search?: string;
  type?: string;
  startDate?: string;
  endDate?: string;
}

@Injectable({ providedIn: 'root' })
export class WorkoutService {
  private readonly API = `${environment.apiUrl}/workouts`;

  constructor(private http: HttpClient) {}

  getWorkouts(filters: WorkoutFilter = {}): Observable<PaginatedResponse<Workout>> {
    let params = new HttpParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params = params.set(key, String(value));
      }
    });
    return this.http.get<PaginatedResponse<Workout>>(this.API, { params });
  }

  getStats(): Observable<WorkoutStats> {
    return this.http.get<WorkoutStats>(`${this.API}/stats`);
  }

  createWorkout(data: Partial<Workout>): Observable<{ workout: Workout; message: string }> {
    return this.http.post<{ workout: Workout; message: string }>(this.API, data);
  }

  updateWorkout(id: string, data: Partial<Workout>): Observable<{ workout: Workout }> {
    return this.http.put<{ workout: Workout }>(`${this.API}/${id}`, data);
  }

  deleteWorkout(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.API}/${id}`);
  }

  // Admin only
  getAllWorkouts(page = 1, limit = 20): Observable<PaginatedResponse<Workout>> {
    const params = new HttpParams().set('page', page).set('limit', limit);
    return this.http.get<PaginatedResponse<Workout>>(`${this.API}/all`, { params });
  }
}
