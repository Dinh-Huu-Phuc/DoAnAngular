import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import equationData from '../../assets/equation.json';
import periodicTableData from '../../assets/PeriodicTable.json';
import { AtomViewerComponent, AtomElement } from '../../shared/atom-viewer/atom-viewer.component';

interface Equation {
  id: number;
  reactants: string;
  products: string;
  equation: string;
  condition: string;
  phenomenon: string;
  level: string;
  tags: string[];
}

interface PeriodicElement {
  symbol: string;
  number: number;
  name: string;
  shells?: number[];
}

@Component({
  selector: 'app-balance-equation-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AtomViewerComponent],
  templateUrl: './balance-equation-page.component.html',
  styleUrls: ['./balance-equation-page.component.css']
})
export class BalanceEquationPageComponent {
  private readonly fb = new FormBuilder();
  private readonly allEquations = signal<Equation[]>(equationData as Equation[]);
  private readonly allElements = signal<PeriodicElement[]>(
    (periodicTableData as any).elements as PeriodicElement[]
  );

  form = this.fb.nonNullable.group({
    reactant1: ['', [Validators.required]],
    reactant2: ['', [Validators.required]]
  });

  searchResults = signal<Equation[]>([]);
  selectedEquation = signal<Equation | null>(null);
  errorMessage = signal<string>('');
  productElements = signal<AtomElement[]>([]);

  search() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const reactant1 = this.form.value.reactant1?.trim().toLowerCase() || '';
    const reactant2 = this.form.value.reactant2?.trim().toLowerCase() || '';

    this.errorMessage.set('');
    this.selectedEquation.set(null);

    // Tìm kiếm trong database
    const results = this.allEquations().filter(eq => {
      const reactants = eq.reactants.toLowerCase();
      // Tìm kiếm linh hoạt: có thể tìm theo từng chất hoặc cả hai
      const hasReactant1 = reactants.includes(reactant1) || 
                         reactant1.split(' ').some(word => reactants.includes(word));
      const hasReactant2 = reactants.includes(reactant2) || 
                         reactant2.split(' ').some(word => reactants.includes(word));
      
      return hasReactant1 && hasReactant2;
    });

    if (results.length === 0) {
      this.errorMessage.set('Không tìm thấy phương trình phù hợp. Vui lòng thử lại với các chất khác.');
      this.searchResults.set([]);
    } else {
      this.searchResults.set(results);
      // Tự động chọn kết quả đầu tiên
      if (results.length > 0) {
        this.selectEquation(results[0]);
      }
    }
  }

  selectEquation(equation: Equation) {
    this.selectedEquation.set(equation);
    // Tự động tìm và hiển thị các nguyên tố trong sản phẩm
    this.updateProductElements(equation.products);
  }

  updateProductElements(products: string) {
    const productList = this.parseProducts(products);
    const elements: AtomElement[] = [];
    
    for (const product of productList) {
      const elementSymbols = this.extractElements(product);
      for (const symbol of elementSymbols) {
        // Tìm nguyên tố trong bảng tuần hoàn
        const element = this.allElements().find(e => e.symbol === symbol);
        if (element && !elements.find(e => e.symbol === symbol)) {
          elements.push({
            symbol: element.symbol,
            number: element.number,
            shells: element.shells || []
          });
        }
      }
    }
    
    this.productElements.set(elements);
  }

  // Phân tích các nguyên tố trong sản phẩm để vẽ cấu hình
  parseProducts(products: string): string[] {
    // Tách các sản phẩm bằng dấu +
    return products.split('+').map(p => p.trim()).filter(p => p.length > 0);
  }

  // Lấy ký hiệu nguyên tố từ công thức hóa học
  extractElements(formula: string): string[] {
    const elements: string[] = [];
    const elementRegex = /([A-Z][a-z]?)(\d*)/g;
    let match;
    
    while ((match = elementRegex.exec(formula)) !== null) {
      const element = match[1];
      if (!elements.includes(element)) {
        elements.push(element);
      }
    }
    
    return elements;
  }

  // Điền ví dụ vào form
  fillExample(reactant1: string, reactant2: string) {
    this.form.patchValue({
      reactant1: reactant1,
      reactant2: reactant2
    });
  }

  // Xóa form
  clearForm() {
    this.form.reset();
    this.searchResults.set([]);
    this.selectedEquation.set(null);
    this.errorMessage.set('');
    this.productElements.set([]);
  }
}

