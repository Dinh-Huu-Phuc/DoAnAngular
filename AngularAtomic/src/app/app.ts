import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';
import { FloatingChatboxComponent } from './components/floating-chatbox/floating-chatbox.component';
import { AnimationService } from './services/animation.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, FloatingChatboxComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  constructor(private animationService: AnimationService) {}
}
