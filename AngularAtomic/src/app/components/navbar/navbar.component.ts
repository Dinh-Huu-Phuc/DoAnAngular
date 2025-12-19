import { Component, inject } from '@angular/core';
import { NgIf } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, NgIf],
  templateUrl: './navbar.component.html'
})
export class NavbarComponent {
  isMenuOpen = false;
  isUserMenuOpen = false;

  readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  get userInitials(): string {
    const user = this.auth.currentUser();
    const nameSource = user?.fullName?.trim() || user?.username?.trim();
    if (!nameSource) {
      return 'U';
    }
    const parts = nameSource.split(/\s+/);
    if (parts.length === 1) {
      return parts[0].charAt(0).toUpperCase();
    }
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  navigateToSimulations() {
    console.log('Navigating to simulations...');
    this.router.navigateByUrl('/simulations');
    this.isMenuOpen = false;
  }

  toggleUserMenu() {
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }

  goToAccount() {
    this.isUserMenuOpen = false;
    this.router.navigateByUrl('/account');
  }

  logout() {
    this.auth.logout();
    this.isUserMenuOpen = false;
    this.isMenuOpen = false;
    this.router.navigateByUrl('/login');
  }
}


