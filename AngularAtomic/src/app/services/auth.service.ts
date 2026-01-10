import { inject, Injectable, signal, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common'; // 1. Import hàm kiểm tra môi trường
import { environment } from '../../environments/environment';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  username: string;
  password: string;
  confirmPassword: string;
  email: string;
  phoneNumber: string;
  captcha: string;
}

export interface UserInfo {
  id: string;
  fullName: string;
  username: string;
  email: string;
  phoneNumber?: string;
}

export interface UpdateProfileRequest {
  fullName: string;
  email: string;
  phoneNumber: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  // 2. Inject PLATFORM_ID để biết đang chạy ở đâu (Server hay Browser)
  private readonly platformId = inject(PLATFORM_ID);
  
  private readonly apiBase = environment.apiUrl; // Sử dụng environment config

  readonly currentUser = signal<UserInfo | null>(null);
  readonly token = signal<string | null>(null);

  constructor() {
    // Gọi hàm load khi service khởi tạo
    this.loadFromStorage();
  }

  /**
   * Backend hiện trả về trực tiếp đối tượng User (không có token).
   * Ví dụ:
   * {
   *   "id": 1,
   *   "fullName": "",
   *   "username": "TanThuyHoang",
   *   "email": "",
   *   "phoneNumber": "",
   *   "role": "Sinh Vien",
   *   "createdAt": "2025-12-17T11:34:12.653052"
   * }
   */
  login(body: LoginRequest) {
    return this.http.post<UserInfo>(`${this.apiBase}/api/auth/login`, body).pipe(
      tap(user => {
        // Backend chưa trả token, nên tạm thời chỉ lưu thông tin user
        this.token.set(null);
        this.currentUser.set({
          id: String(user.id),
          fullName: user.fullName,
          username: user.username,
          email: user.email,
          phoneNumber: user.phoneNumber
        });

        if (isPlatformBrowser(this.platformId)) {
          localStorage.removeItem('auth_token');
          localStorage.setItem('auth_user', JSON.stringify(this.currentUser()));
        }
      })
    );
  }

  register(body: RegisterRequest) {
    return this.http.post(`${this.apiBase}/api/auth/register`, body);
  }

  updateProfile(body: UpdateProfileRequest) {
    return this.http.put<UserInfo>(`${this.apiBase}/api/users/profile`, body)
      .pipe(
        tap(user => {
          this.currentUser.set(user);

          // 3. Chỉ lưu vào localStorage khi đang ở Browser
          if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem('auth_user', JSON.stringify(user));
          }
        })
      );
  }

  loadFromStorage() {
    // 3. Quan trọng nhất: Kiểm tra môi trường trước khi lấy dữ liệu
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    try {
      const token = localStorage.getItem('auth_token');
      const userRaw = localStorage.getItem('auth_user');

      // Nếu không có user data hoặc dữ liệu bị sai (ví dụ: "undefined") thì bỏ qua
      // Token có thể không có vì backend không trả về token
      if (!userRaw || userRaw === 'undefined') {
        return;
      }

      const user: UserInfo = JSON.parse(userRaw);
      // Set token nếu có, nếu không thì null (backend không trả về token)
      this.token.set(token || null);
      this.currentUser.set(user);
    } catch {
      // Nếu JSON.parse lỗi (dữ liệu hỏng) thì xóa khỏi localStorage để tránh lỗi lặp lại
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      this.token.set(null);
      this.currentUser.set(null);
    }
  }

  logout() {
    this.token.set(null);
    this.currentUser.set(null);

    // 3. Chỉ xóa localStorage khi đang ở Browser
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
    }
  }

  /**
   * Kiểm tra xem user đã đăng nhập chưa
   */
  isAuthenticated(): boolean {
    return this.currentUser() !== null;
  }
}