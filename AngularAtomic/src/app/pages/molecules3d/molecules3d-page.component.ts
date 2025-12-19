import { Component } from '@angular/core';
import { MoleculeViewerComponent } from '../../shared/molecule-viewer/molecule-viewer.component';

@Component({
  selector: 'app-molecules3d-page',
  standalone: true,
  imports: [MoleculeViewerComponent],
  template: `
    <section class="space-y-4">
      <header class="space-y-1">
        <h1 class="text-xl font-semibold text-slate-50 sm:text-2xl">
          Phân tử 3D
        </h1>
        <p class="text-sm text-slate-400">
          Khám phá các phân tử ở dạng 3D: H₂O, CO₂, CH₄, và nhiều hơn nữa với khả năng xoay, zoom,
          tương tác chuột.
        </p>
      </header>

      <app-molecule-viewer></app-molecule-viewer>

      <p class="text-xs text-slate-500">
        (Đang phát triển – sẽ bổ sung lựa chọn phân tử, màu sắc và kiểu hiển thị liên kết.)
      </p>
    </section>
  `
})
export class Molecules3DPageComponent {}



