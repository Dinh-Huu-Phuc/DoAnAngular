import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { Router, NavigationStart, NavigationEnd } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class AnimationService {
  private anime: any = null;
  private skipRoutes = ['/login', '/register'];

  constructor(private router: Router, @Inject(PLATFORM_ID) private platformId: Object) {
    if (!isPlatformBrowser(this.platformId)) return;
    // dynamic import animejs only in browser
    // @ts-ignore - provide our local ambient declaration in src/animejs.d.ts
    import('animejs').then(mod => {
      this.anime = mod.default || mod;
      this.hookRouter();
    }).catch(() => {
      // ignore if anime not available
    });
  }

  private hookRouter() {
    this.router.events.subscribe(evt => {
      if (evt instanceof NavigationStart) {
        const url = evt.url;
        if (this.shouldSkip(url)) return;
        const el = document.getElementById('page-root');
        if (!el || !this.anime) return;
        // fade & slide up current content
        this.anime({
          targets: el,
          opacity: [1, 0],
          translateY: [0, -12],
          easing: 'easeInQuad',
          duration: 220
        });
      }
      if (evt instanceof NavigationEnd) {
        const url = evt.urlAfterRedirects || '';
        if (this.shouldSkip(url)) return;
        const el = document.getElementById('page-root');
        if (!el || !this.anime) return;
        // prepare initial state then animate in
        el.style.opacity = '0';
        el.style.transform = 'translateY(8px)';
        this.anime({
          targets: el,
          opacity: [0, 1],
          translateY: [8, 0],
          easing: 'spring(1, 80, 12, 0)',
          duration: 600
        });
      }
    });
  }

  private shouldSkip(url: string | null) {
    if (!url) return false;
    return this.skipRoutes.some(r => url.startsWith(r));
  }
}


