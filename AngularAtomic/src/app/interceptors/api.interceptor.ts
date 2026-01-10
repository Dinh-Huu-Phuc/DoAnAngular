import { Injectable, inject } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable()
export class ApiInterceptor implements HttpInterceptor {
  private readonly authService = inject(AuthService);
  
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Chuẩn bị headers cơ bản
    let headers: { [key: string]: string } = {
      'Accept': 'application/json'
    };

    // Thêm Content-Type cho requests có body
    if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
      headers['Content-Type'] = 'application/json';
    }

    // Chỉ thêm Authorization header cho các requests KHÔNG phải login/register
    const isAuthEndpoint = req.url.includes('/api/auth/login') || req.url.includes('/api/auth/register');
    
    if (!isAuthEndpoint) {
      // Thêm Authorization header nếu user đã đăng nhập
      const currentUser = this.authService.currentUser();
      const token = this.authService.token();
      
      if (currentUser && token) {
        headers['Authorization'] = `Bearer ${token}`;
        console.log('🔐 Added Authorization header for user:', currentUser.username);
      } else if (currentUser && !token) {
        // Trường hợp user đã login nhưng backend chưa trả token
        // Có thể thêm user ID vào header hoặc xử lý khác
        headers['X-User-ID'] = currentUser.id;
        console.log('👤 Added User-ID header for user:', currentUser.username);
      } else {
        console.log('🔓 No authentication - sending request without auth headers');
      }
    } else {
      console.log('🔑 Auth endpoint - skipping auth headers');
    }

    const apiReq = req.clone({
      setHeaders: headers
    });

    return next.handle(apiReq).pipe(
      catchError((error: HttpErrorResponse) => {
        // Log chi tiết lỗi để debug
        console.error('API Error:', {
          status: error.status,
          statusText: error.statusText,
          url: error.url,
          message: error.message,
          error: error.error
        });

        // Xử lý các lỗi phổ biến với thông tin chi tiết hơn
        if (error.status === 0) {
          console.error('❌ Network Error - Backend không khả dụng');
          console.error('Kiểm tra: Backend server, CORS, Network connection');
        } else if (error.status === 401) {
          console.error('❌ 401 Unauthorized - Cần đăng nhập hoặc token hết hạn');
          console.error('Current auth state:', {
            hasUser: !!this.authService.currentUser(),
            hasToken: !!this.authService.token(),
            isAuthenticated: this.authService.isAuthenticated()
          });
          
          // Nếu là lỗi login, có thể là credentials sai
          if (isAuthEndpoint) {
            console.error('❌ Login failed - Kiểm tra username/password');
          }
        } else if (error.status === 403) {
          console.error('❌ 403 Forbidden - Không có quyền truy cập');
          console.error('User có thể đã đăng nhập nhưng không có quyền cho action này');
        } else if (error.status === 404) {
          console.error('❌ 404 Not Found - Endpoint không tồn tại');
        } else if (error.status >= 500) {
          console.error('❌ Server Error - Lỗi từ backend');
          console.error('Chi tiết lỗi server:', error.error);
        }

        return throwError(() => error);
      })
    );
  }
}