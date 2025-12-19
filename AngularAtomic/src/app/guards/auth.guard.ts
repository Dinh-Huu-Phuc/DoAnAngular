import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  // Kiểm tra xem user đã đăng nhập chưa
  if (auth.currentUser()) {
    return true;
  }

  // Nếu chưa đăng nhập, redirect về trang login
  // Lưu URL hiện tại để redirect lại sau khi đăng nhập
  router.navigate(['/login'], { 
    queryParams: { returnUrl: state.url } 
  });
  return false;
};

