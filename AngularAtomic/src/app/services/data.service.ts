import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

// Định nghĩa interface cho dữ liệu (thay đổi theo API của bạn)
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
}

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor(private apiService: ApiService) {}

  // Ví dụ các method để gọi API
  getUsers(): Observable<ApiResponse<User[]>> {
    return this.apiService.get<ApiResponse<User[]>>('/users');
  }

  getUserById(id: number): Observable<ApiResponse<User>> {
    return this.apiService.get<ApiResponse<User>>(`/users/${id}`);
  }

  createUser(user: Partial<User>): Observable<ApiResponse<User>> {
    return this.apiService.post<ApiResponse<User>>('/users', user);
  }

  updateUser(id: number, user: Partial<User>): Observable<ApiResponse<User>> {
    return this.apiService.put<ApiResponse<User>>(`/users/${id}`, user);
  }

  deleteUser(id: number): Observable<ApiResponse<any>> {
    return this.apiService.delete<ApiResponse<any>>(`/users/${id}`);
  }

  // Thêm các method khác theo API endpoints của bạn
}