import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-account-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './account-page.component.html'
})
export class AccountPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);

  readonly user = computed(() => this.auth.currentUser());

  saving = false;
  successMessage = '';
  errorMessage = '';

  form = this.fb.nonNullable.group({
    fullName: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    phoneNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{9,11}$/)]],
    username: [{ value: '', disabled: true }]
  });

  constructor() {
    const u = this.user();
    if (u) {
      this.form.patchValue({
        fullName: u.fullName,
        email: u.email,
        phoneNumber: u.phoneNumber ?? '',
        username: u.username
      });
    }
  }

  submit() {
    if (!this.user()) {
      this.errorMessage = 'Bạn cần đăng nhập để cập nhật thông tin.';
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { fullName, email, phoneNumber } = this.form.getRawValue();

    this.saving = true;
    this.successMessage = '';
    this.errorMessage = '';

    this.auth.updateProfile({ fullName, email, phoneNumber }).subscribe({
      next: () => {
        this.saving = false;
        this.successMessage = 'Cập nhật thông tin thành công!';
      },
      error: (err: HttpErrorResponse) => {
        this.saving = false;
        this.errorMessage = err.error?.message || 'Không thể cập nhật thông tin. Vui lòng thử lại.';
      }
    });
  }
}


