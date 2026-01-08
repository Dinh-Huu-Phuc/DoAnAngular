import { Pipe, PipeTransform, inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { MarkdownService } from '../services/markdown.service';

@Pipe({
  name: 'markdownKatex',
  standalone: true
})
export class MarkdownKatexPipe implements PipeTransform {
  private readonly sanitizer = inject(DomSanitizer);
  private readonly markdownService = inject(MarkdownService);

  transform(value: string): SafeHtml {
    if (!value) return '';
    
    const processed = this.markdownService.renderMarkdownWithKatex(value);
    return this.sanitizer.bypassSecurityTrustHtml(processed);
  }
}