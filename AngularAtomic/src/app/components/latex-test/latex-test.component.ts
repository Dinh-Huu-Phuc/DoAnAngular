import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MarkdownKatexPipe } from '../../pipes/markdown-katex.pipe';

@Component({
  selector: 'app-latex-test',
  standalone: true,
  imports: [CommonModule, MarkdownKatexPipe],
  template: `
    <div class="p-8 bg-slate-900 text-white min-h-screen">
      <h1 class="text-2xl font-bold mb-6">LaTeX Test Component</h1>
      
      <div class="space-y-6">
        <div class="bg-slate-800 p-4 rounded-lg">
          <h3 class="text-lg font-semibold mb-2">Inline Math:</h3>
          <div [innerHTML]="inlineMath | markdownKatex"></div>
        </div>
        
        <div class="bg-slate-800 p-4 rounded-lg">
          <h3 class="text-lg font-semibold mb-2">Display Math:</h3>
          <div [innerHTML]="displayMath | markdownKatex"></div>
        </div>
        
        <div class="bg-slate-800 p-4 rounded-lg">
          <h3 class="text-lg font-semibold mb-2">Chemistry Formula:</h3>
          <div [innerHTML]="chemistryFormula | markdownKatex"></div>
        </div>
        
        <div class="bg-slate-800 p-4 rounded-lg">
          <h3 class="text-lg font-semibold mb-2">Complex Equation:</h3>
          <div [innerHTML]="complexEquation | markdownKatex"></div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host ::ng-deep .katex {
      color: white !important;
    }
    :host ::ng-deep .katex-display {
      margin: 1rem 0;
      text-align: center;
    }
  `]
})
export class LatexTestComponent {
  inlineMath = 'Công thức đơn giản: $E = mc^2$ trong vật lý.';
  
  displayMath = `Phương trình bậc hai:
$$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$`;

  chemistryFormula = `Phản ứng hóa học:
$$\\ce{2H2 + O2 -> 2H2O}$$

Nồng độ mol:
$$C = \\frac{n}{V}$$`;

  complexEquation = `Tích phân phức tạp:
$$\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}$$

Ma trận:
$$\\begin{pmatrix}
a & b \\\\
c & d
\\end{pmatrix}$$`;
}