import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

declare var katex: any;

@Injectable({
  providedIn: 'root'
})
export class MarkdownService {
  private readonly platformId = inject(PLATFORM_ID);

  renderMarkdownWithKatex(content: string): string {
    if (!isPlatformBrowser(this.platformId)) {
      return content;
    }

    try {
      // Xử lý display math ($$...$$)
      content = content.replace(/\$\$([\s\S]*?)\$\$/g, (match, math) => {
        try {
          if (typeof katex !== 'undefined') {
            return katex.renderToString(math.trim(), {
              displayMode: true,
              throwOnError: false,
              errorColor: '#cc0000'
            });
          }
        } catch (e) {
          console.warn('KaTeX display math error:', e);
        }
        return match;
      });

      // Xử lý inline math ($...$)
      content = content.replace(/\$([^$\n]+?)\$/g, (match, math) => {
        try {
          if (typeof katex !== 'undefined') {
            return katex.renderToString(math.trim(), {
              displayMode: false,
              throwOnError: false,
              errorColor: '#cc0000'
            });
          }
        } catch (e) {
          console.warn('KaTeX inline math error:', e);
        }
        return match;
      });

      // Xử lý chemistry equations (\ce{...})
      content = content.replace(/\\ce\{([^}]+)\}/g, (match, chem) => {
        try {
          if (typeof katex !== 'undefined') {
            return katex.renderToString(`\\ce{${chem}}`, {
              displayMode: false,
              throwOnError: false,
              errorColor: '#cc0000'
            });
          }
        } catch (e) {
          console.warn('KaTeX chemistry error:', e);
        }
        return match;
      });

      // Xử lý markdown cơ bản
      content = this.processBasicMarkdown(content);

      return content;
    } catch (error) {
      console.error('Markdown processing error:', error);
      return content;
    }
  }

  private processBasicMarkdown(content: string): string {
    // Bold text
    content = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Italic text
    content = content.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Code blocks
    content = content.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
    
    // Inline code
    content = content.replace(/`([^`]+)`/g, '<code>$1</code>');
    
    // Line breaks
    content = content.replace(/\n/g, '<br>');
    
    return content;
  }
}