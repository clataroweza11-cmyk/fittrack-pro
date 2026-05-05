import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User, PaginatedResponse } from '../../shared/models';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly API = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  getAllUsers(page = 1, limit = 20, search = ''): Observable<PaginatedResponse<User>> {
    const params = new HttpParams()
      .set('page', page)
      .set('limit', limit)
      .set('search', search);
    return this.http.get<PaginatedResponse<User>>(this.API, { params });
  }

  getUserById(id: string): Observable<{ user: User }> {
    return this.http.get<{ user: User }>(`${this.API}/${id}`);
  }

  updateUser(id: string, data: Partial<User>): Observable<{ user: User; message: string }> {
    return this.http.put<{ user: User; message: string }>(`${this.API}/${id}`, data);
  }

  deleteUser(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.API}/${id}`);
  }
}
