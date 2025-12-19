import { Component } from '@angular/core';

@Component({
  selector: 'app-about-page',
  standalone: true,
  template: `
    <section class="space-y-3">
      <h1 class="text-xl font-semibold text-slate-50 sm:text-2xl">
        Giới thiệu
      </h1>
      <p class="text-sm text-slate-400">
        Website Hóa học 3D được xây dựng với mục tiêu mang lại trải nghiệm học Hóa trực quan, sinh
        động, kết hợp mô hình 3D và giao diện hiện đại, tối màu.
      </p>
      <p class="text-xs text-slate-500">
        Kiến trúc tách biệt Frontend (Angular, Tailwind, Three.js) và Backend (ASP.NET Core Web
        API, SQL Server), dễ dàng mở rộng thêm AI hỗ trợ học, chức năng quản trị và nhiều mô hình
        3D mới.
      </p>
    </section>
  `
})
export class AboutPageComponent {}



