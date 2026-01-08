import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-routing-test',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="routing-test">
      <h2>🧭 Routing Test</h2>
      <p>Test các routes của Angular:</p>
      
      <div class="links">
        <a routerLink="/" class="test-link">🏠 Home</a>
        <a routerLink="/login" class="test-link">🔐 Login</a>
        <a routerLink="/register" class="test-link">📝 Register</a>
        <a routerLink="/elements" class="test-link">⚛️ Elements</a>
        <a routerLink="/about" class="test-link">ℹ️ About</a>
        <a routerLink="/register-test" class="test-link">🧪 Register Test</a>
        <a routerLink="/backend-test" class="test-link">🔧 Backend Test</a>
      </div>

      <div class="info">
        <h3>✅ Nếu các link trên hoạt động:</h3>
        <ul>
          <li>Angular routing đã được fix</li>
          <li>Proxy chỉ áp dụng cho API calls</li>
          <li>Trang login/register sẽ hoạt động bình thường</li>
        </ul>

        <h3>❌ Nếu vẫn lỗi 404:</h3>
        <ul>
          <li>Cần restart Angular dev server</li>
          <li>Kiểm tra proxy.conf.json</li>
          <li>Xem console có lỗi gì không</li>
        </ul>
      </div>
    </div>
  `,
  styles: [`
    .routing-test {
      max-width: 800px;
      margin: 20px auto;
      padding: 20px;
      border: 1px solid #ddd;
      border-radius: 8px;
    }

    .links {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin: 20px 0;
    }

    .test-link {
      display: inline-block;
      padding: 10px 15px;
      background: #007bff;
      color: white;
      text-decoration: none;
      border-radius: 4px;
      transition: background 0.2s;
    }

    .test-link:hover {
      background: #0056b3;
    }

    .info {
      margin-top: 30px;
      padding: 20px;
      background: #f8f9fa;
      border-radius: 4px;
    }

    .info h3 {
      margin-top: 0;
    }

    .info ul {
      margin: 10px 0;
      padding-left: 20px;
    }

    .info li {
      margin: 5px 0;
    }
  `]
})
export class RoutingTestComponent {}