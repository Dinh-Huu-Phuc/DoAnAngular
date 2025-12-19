import { Pipe, PipeTransform, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import katex from 'katex';

@Pipe({
  name: 'katex',
  standalone: true
})
export class KatexPipe implements PipeTransform {
  private readonly platformId = inject(PLATFORM_ID);

  transform(value: string): string {
    if (!value || !isPlatformBrowser(this.platformId)) {
      return value || '';
    }

    try {
      // Escape HTML cơ bản
      let result = value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
      
      // Xử lý block math $$...$$ trước
      result = result.replace(/\$\$([\s\S]*?)\$\$/g, (match, formula) => {
        try {
          return katex.renderToString(formula.trim(), {
            displayMode: true,
            throwOnError: false
          });
        } catch (e) {
          return match;
        }
      });

      // Xử lý inline math $...$ (sau khi đã xử lý $$)
      // Sử dụng placeholder để tránh xử lý lại các phần đã render
      const placeholders: string[] = [];
      let placeholderIndex = 0;
      
      // Tạm thời thay thế các công thức đã render bằng placeholder
      result = result.replace(/<span class="katex-display">[\s\S]*?<\/span>/g, (match) => {
        const placeholder = `__KATEX_BLOCK_${placeholderIndex}__`;
        placeholders[placeholderIndex] = match;
        placeholderIndex++;
        return placeholder;
      });

      // Xử lý inline math $...$
      result = result.replace(/\$([^$\n]+?)\$/g, (match, formula) => {
        try {
          return katex.renderToString(formula.trim(), {
            displayMode: false,
            throwOnError: false
          });
        } catch (e) {
          return match;
        }
      });

      // Khôi phục các block math
      placeholders.forEach((placeholder, index) => {
        result = result.replace(`__KATEX_BLOCK_${index}__`, placeholder);
      });

      // Xử lý xuống dòng
      result = result.replace(/\n/g, '<br>');

      return result;
    } catch (error) {
      console.error('KaTeX rendering error:', error);
      return value;
    }
  }
}
