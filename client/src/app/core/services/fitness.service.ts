import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { FitnessProfile, Progress, PaginatedResponse } from '../../shared/models';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private readonly API = `${environment.apiUrl}/profile`;

  constructor(private http: HttpClient) {}

  getProfile(): Observable<{ profile: FitnessProfile | null }> {
    return this.http.get<{ profile: FitnessProfile | null }>(this.API);
  }

  upsertProfile(data: Partial<FitnessProfile>): Observable<{ profile: FitnessProfile; message: string }> {
    return this.http.post<{ profile: FitnessProfile; message: string }>(this.API, data);
  }
}

@Injectable({ providedIn: 'root' })
export class ProgressService {
  private readonly API = `${environment.apiUrl}/progress`;

  constructor(private http: HttpClient) {}

  getProgress(page = 1, limit = 12): Observable<PaginatedResponse<Progress>> {
    return this.http.get<PaginatedResponse<Progress>>(`${this.API}?page=${page}&limit=${limit}`);
  }

  createProgress(formData: FormData): Observable<{ progress: Progress; message: string }> {
    return this.http.post<{ progress: Progress; message: string }>(this.API, formData);
  }

  deleteProgress(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.API}/${id}`);
  }
}
