import { Component, OnInit, computed, inject, signal, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { AtomViewerComponent, AtomElement } from '../../shared/atom-viewer/atom-viewer.component';
import periodicTableData from '../../assets/PeriodicTable.json';

interface PeriodicElement extends AtomElement {
  name: string;
  category: string;
  phase: string;
  atomic_mass: number;
  appearance?: string | null;
  summary?: string | null;
  electron_configuration?: string | null;
  shells: number[];
  xpos: number;
  ypos: number;
}

interface PeriodicTableResponse {
  elements: PeriodicElement[];
}

@Component({
  selector: 'app-periodic-table-page',
  standalone: true,
  imports: [CommonModule, AtomViewerComponent],
  templateUrl: './periodic-table-page.component.html',
  styleUrls: ['./periodic-table-page.component.css']
})
export class PeriodicTablePageComponent implements OnInit {
  private readonly _elements = signal<PeriodicElement[]>(periodicTableData.elements as PeriodicElement[]);
  readonly selectedElement = signal<PeriodicElement | null>(null);
  readonly searchTerm = signal<string>('');
  readonly filterKey = signal<string>('all');

  private readonly router = inject(Router);
  private readonly platformId: Object = inject(PLATFORM_ID);

  readonly filteredElements = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const filter = this.filterKey();

    let list = this._elements();

    // Category filter
    list = list.filter((el) => this.matchesFilter(el, filter));

    // Search filter
    if (term) {
      list = list.filter(
        (el) =>
          el.name.toLowerCase().includes(term) ||
          el.symbol.toLowerCase().includes(term) ||
          `${el.number}`.includes(term)
      );
    }

    return list;
  });

  constructor() {
    const all = periodicTableData.elements as PeriodicElement[];
    if (all.length) {
      this.selectedElement.set(all[0]);
    }
  }

  ngOnInit(): void {
    // Cho phép truy cập trang trực tiếp; bỏ chuyển hướng về trang chủ khi reload
  }

  selectElement(element: PeriodicElement) {
    this.selectedElement.set(element);
  }

  onSearch(term: string) {
    this.searchTerm.set(term);
    const first = this.filteredElements()[0];
    this.selectedElement.set(first ?? null);
  }

  setFilter(key: string) {
    this.filterKey.set(key);
    const first = this.filteredElements()[0];
    this.selectedElement.set(first ?? null);
  }

  private matchesFilter(el: PeriodicElement, filter: string): boolean {
    const sym = el.symbol;
    switch (filter) {
      case 'alkali':
        return ['H', 'Li', 'Na', 'K', 'Rb', 'Cs', 'Fr'].includes(sym);
      case 'alkaline':
        return ['Be', 'Mg', 'Ca', 'Sr', 'Ba', 'Ra'].includes(sym);
      case 'iib':
        return ['Zn', 'Cd', 'Hg'].includes(sym);
      case 'boron':
        return ['B', 'Si', 'Ge'].includes(sym);
      case 'halogen':
        return ['F', 'Cl', 'Br', 'I', 'At', 'Ts'].includes(sym);
      case 'noble':
        return ['He', 'Ne', 'Ar', 'Kr', 'Xe', 'Rn', 'Og'].includes(sym);
      case 'metals':
        return this.isMetal(el);
      case 'nonmetals':
        return this.isNonMetal(el);
      case 'radioactive':
        return this.isRadioactive(el);
      default:
        return true;
    }
  }

  private isRadioactive(el: PeriodicElement): boolean {
    const cat = el.category.toLowerCase();
    return el.number >= 84 || cat.includes('actinide') || cat.includes('radioactive');
  }

  private isMetal(el: PeriodicElement): boolean {
    const c = el.category.toLowerCase();
    if (c.includes('metalloid')) return false;
    if (c.includes('nonmetal')) return false;
    if (c.includes('noble gas')) return false;
    if (c.includes('halogen')) return false;
    return (
      c.includes('metal') ||
      c.includes('lanthanide') ||
      c.includes('actinide') ||
      c.includes('post-transition')
    );
  }

  private isNonMetal(el: PeriodicElement): boolean {
    const c = el.category.toLowerCase();
    return (
      c.includes('nonmetal') ||
      c.includes('halogen')
    );
  }

  categoryColor(category: string): string {
    const c = category.toLowerCase();
    if (c.includes('noble gas')) return 'from-sky-500/60 to-sky-600/50';
    if (c.includes('alkali metal')) return 'from-orange-500/60 to-amber-500/50';
    if (c.includes('alkaline earth')) return 'from-lime-500/60 to-emerald-500/50';
    if (c.includes('transition')) return 'from-cyan-500/60 to-blue-500/50';
    if (c.includes('lanthanide')) return 'from-fuchsia-500/60 to-purple-500/50';
    if (c.includes('actinide')) return 'from-rose-500/60 to-red-500/50';
    if (c.includes('metalloid')) return 'from-emerald-500/60 to-teal-500/50';
    if (c.includes('post-transition')) return 'from-slate-400/60 to-slate-500/50';
    if (c.includes('nonmetal')) return 'from-teal-400/60 to-cyan-500/50';
    if (c.includes('halogen')) return 'from-violet-500/60 to-indigo-500/50';
    return 'from-slate-500/40 to-slate-600/40';
  }

  getCategoryClass(category: string): string {
    const c = category.toLowerCase();
    if (c.includes('noble gas')) return 'noble';
    if (c.includes('alkali metal')) return 'alkali';
    if (c.includes('alkaline earth')) return 'alkaline';
    if (c.includes('transition')) return 'transition';
    if (c.includes('lanthanide')) return 'lanthanide';
    if (c.includes('actinide')) return 'actinide';
    if (c.includes('metalloid')) return 'metalloid';
    if (c.includes('post-transition')) return 'transition';
    if (c.includes('nonmetal')) return 'nonmetal';
    if (c.includes('halogen')) return 'halogen';
    return 'transition'; // default
  }
}

