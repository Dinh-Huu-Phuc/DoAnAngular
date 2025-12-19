import { Component, inject, OnInit, OnDestroy, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-floating-chatbox',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './floating-chatbox.component.html',
  styleUrls: ['./floating-chatbox.component.css']
})
export class FloatingChatboxComponent implements OnInit, OnDestroy {
  readonly router = inject(Router); // Public để dùng trong template
  private readonly platformId = inject(PLATFORM_ID);
  readonly auth = inject(AuthService); // Public để dùng trong template
  private readonly destroy$ = new Subject<void>();

  isVisible = false; // Chỉ hiển thị khi đã đăng nhập
  position = { left: 0, bottom: 0 }; // 0 means use default (right: 24, bottom: 24)
  isDragging = false;
  dragOffset = { x: 0, y: 0 };

  // Arrow functions để bind đúng context
  private onMouseMoveBound = (event: MouseEvent) => {
    if (!this.isDragging || !isPlatformBrowser(this.platformId)) return;
    
    event.preventDefault();
    const chatboxSize = 80; // Approximate size
    const newLeft = event.clientX - this.dragOffset.x;
    const newBottom = window.innerHeight - (event.clientY - this.dragOffset.y);
    
    // Giới hạn trong viewport
    const maxLeft = window.innerWidth - chatboxSize;
    const maxBottom = window.innerHeight - chatboxSize;
    
    this.position = {
      left: Math.max(0, Math.min(newLeft, maxLeft)),
      bottom: Math.max(0, Math.min(newBottom, maxBottom))
    };
  };

  private onMouseUpBound = () => {
    if (!isPlatformBrowser(this.platformId)) return;
    
    this.isDragging = false;
    // Lưu vị trí vào localStorage
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('chatbox_position', JSON.stringify(this.position));
    }
    
    // Xóa event listeners
    document.removeEventListener('mousemove', this.onMouseMoveBound);
    document.removeEventListener('mouseup', this.onMouseUpBound);
  };

  ngOnInit() {
    // Kiểm tra đăng nhập và URL để hiển thị chatbox
    this.updateVisibility();
    
    // Lắng nghe thay đổi route
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.updateVisibility();
      });

    // Load vị trí từ localStorage
    if (isPlatformBrowser(this.platformId)) {
      const saved = localStorage.getItem('chatbox_position');
      if (saved) {
        try {
          const pos = JSON.parse(saved);
          this.position = pos;
        } catch (e) {
          // Default position
          this.position = { left: 0, bottom: 0 };
        }
      }
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    
    // Cleanup event listeners nếu còn
    if (isPlatformBrowser(this.platformId)) {
      document.removeEventListener('mousemove', this.onMouseMoveBound);
      document.removeEventListener('mouseup', this.onMouseUpBound);
    }
  }

  private updateVisibility() {
    const isOnChatboxPage = this.router.url === '/chatbox';
    
    // Hiển thị trên tất cả các trang trừ trang chatbox
    this.isVisible = !isOnChatboxPage;
  }

  openChatbox() {
    // Nếu chưa đăng nhập, chuyển đến trang đăng nhập
    if (!this.auth.currentUser()) {
      this.router.navigate(['/login']);
      return;
    }
    
    // Nếu đã đăng nhập, mở chatbox
    this.router.navigate(['/chatbox']);
  }

  onMouseDown(event: MouseEvent) {
    if (!isPlatformBrowser(this.platformId)) return;
    
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    this.dragOffset = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
    
    // Thêm event listeners toàn cục
    document.addEventListener('mousemove', this.onMouseMoveBound);
    document.addEventListener('mouseup', this.onMouseUpBound);
  }


}
