import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AtomViewerComponent, AtomElement } from '../atom-viewer/atom-viewer.component';
import PeriodicTableData from '../../assets/PeriodicTable.json';

interface Element {
  name: string;
  symbol: string;
  number: number;
  shells?: number[];
}

@Component({
  selector: 'app-molecule-viewer',
  standalone: true,
  imports: [CommonModule, FormsModule, AtomViewerComponent],
  templateUrl: './molecule-viewer.component.html'
})
export class MoleculeViewerComponent implements OnInit {
  elements: Element[] = [];
  selectedElement: Element | null = null;
  selectedAtomElement: AtomElement | null = null;

  ngOnInit(): void {
    this.elements = (PeriodicTableData.elements as Element[]).sort((a, b) => a.number - b.number);
    // Select first element by default
    if (this.elements.length > 0) {
      this.selectElement(this.elements[0]);
    }
  }

  selectElement(element: Element) {
    this.selectedElement = element;
    this.selectedAtomElement = {
      symbol: element.symbol,
      number: element.number,
      shells: element.shells
    };
  }

  onElementChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    const elementNumber = parseInt(select.value, 10);
    const element = this.elements.find(e => e.number === elementNumber);
    if (element) {
      this.selectElement(element);
    }
  }
}


