import { Component } from '@angular/core';

@Component({
  selector: 'app-elements-page',
  standalone: true,
  template: `
    <section class="space-y-3">
      <h1 class="text-xl font-semibold text-slate-50 sm:text-2xl">
        Nguyên tố hóa học
      </h1>
      <p class="text-sm text-slate-400">
        Trang này sẽ hiển thị danh sách nguyên tố hóa học và thông tin chi tiết từng nguyên tố từ API.
      </p>
      <p class="text-xs text-slate-500">
        (Đang xây dựng – sẽ kết nối API và thêm bảng tra cứu sau.)
      </p>
    </section>
  `
})
export class ElementsPageComponent {}



