import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MoleculeViewerComponent } from '../../shared/molecule-viewer/molecule-viewer.component';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [RouterLink, MoleculeViewerComponent],
  templateUrl: './home-page.component.html'
})
export class HomePageComponent {}



