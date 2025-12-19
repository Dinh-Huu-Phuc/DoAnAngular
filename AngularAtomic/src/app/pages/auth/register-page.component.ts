import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';
import { DecorativeAtomComponent } from '../../shared/decorative-atom/decorative-atom.component';

@Component({
  selector: 'app-register-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, DecorativeAtomComponent],
  templateUrl: './register-page.component.html'
})
export class RegisterPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  loading = false;
  errorMessage = '';
  successMessage = '';
  captchaCode = this.generateCaptcha();

  form = this.fb.nonNullable.group({
    fullName: ['', [Validators.required, Validators.minLength(3)]],
    username: ['', [Validators.required, Validators.minLength(4)]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    phoneNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{9,11}$/)]],
    captcha: ['', [Validators.required]]
  });

  private generateCaptcha(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  refreshCaptcha() {
    this.captchaCode = this.generateCaptcha();
    this.form.controls.captcha.reset();
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { password, confirmPassword, captcha } = this.form.getRawValue();

    if (password !== confirmPassword) {
      this.errorMessage = 'Mật khẩu và nhập lại mật khẩu không khớp.';
      return;
    }

    // Kiểm tra captcha (chuyển về chữ thường hoặc giữ nguyên tùy logic, ở đây mình trim khoảng trắng)
    if (captcha?.trim() !== this.captchaCode) {
      this.errorMessage = 'Captcha không chính xác. Vui lòng thử lại.';
      this.refreshCaptcha();
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.auth.register(this.form.getRawValue()).subscribe({
      next: () => {
        this.loading = false;
        this.successMessage = 'Đăng ký thành công! Đang chuyển sang trang đăng nhập...';
        setTimeout(() => this.router.navigateByUrl('/login'), 1500);
      },
      error: (err: HttpErrorResponse) => {
        this.loading = false;
        if (err.status === 409) {
          this.errorMessage = err.error?.message || 'Tên đăng nhập hoặc email đã tồn tại.';
        } else {
          this.errorMessage = 'Không thể đăng ký. Vui lòng thử lại sau.';
        }
      }
    });
  }
}