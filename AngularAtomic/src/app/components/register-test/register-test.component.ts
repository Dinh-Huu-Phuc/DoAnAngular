import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-register-test',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="test-container">
      <h2>🧪 Register API Test</h2>
      
      <div class="info">
        <p><strong>Endpoint:</strong> {{ apiUrl }}/api/auth/register</p>
        <p><strong>Method:</strong> POST</p>
      </div>

      <button (click)="testRegister()" [disabled]="loading" class="test-btn">
        {{ loading ? 'Testing...' : 'Test Register API' }}
      </button>

      <div class="result" *ngIf="result">
        <h3>✅ Success:</h3>
        <pre>{{ result | json }}</pre>
      </div>

      <div class="error" *ngIf="error">
        <h3>❌ Error:</h3>
        <pre>{{ error | json }}</pre>
        
        <div class="troubleshoot">
          <h4>Possible solutions:</h4>
          <ul>
            <li>Check if backend is running on port 5150</li>
            <li>Verify CORS is enabled on backend</li>
            <li>Check if /api/auth/register endpoint exists</li>
            <li>Try restarting Angular dev server with: <code>npm start</code></li>
          </ul>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .test-container {
      max-width: 600px;
      margin: 20px auto;
      padding: 20px;
      border: 1px solid #ddd;
      border-radius: 8px;
    }

    .info {
      background: #f8f9fa;
      padding: 15px;
      border-radius: 4px;
      margin: 15px 0;
    }

    .test-btn {
      background: #007bff;
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 16px;
    }

    .test-btn:hover {
      background: #0056b3;
    }

    .test-btn:disabled {
      background: #6c757d;
      cursor: not-allowed;
    }

    .result {
      margin: 20px 0;
      padding: 15px;
      background: #d4edda;
      border: 1px solid #c3e6cb;
      border-radius: 4px;
    }

    .error {
      margin: 20px 0;
      padding: 15px;
      background: #f8d7da;
      border: 1px solid #f5c6cb;
      border-radius: 4px;
    }

    pre {
      background: #f8f9fa;
      padding: 10px;
      border-radius: 4px;
      overflow-x: auto;
      white-space: pre-wrap;
    }

    .troubleshoot {
      margin-top: 15px;
    }

    .troubleshoot ul {
      margin: 10px 0;
      padding-left: 20px;
    }

    code {
      background: #e9ecef;
      padding: 2px 4px;
      border-radius: 3px;
      font-family: monospace;
    }
  `]
})
export class RegisterTestComponent {
  apiUrl = ''; // Sử dụng proxy, không cần base URL
  loading = false;
  result: any = null;
  error: any = null;

  constructor(private http: HttpClient) {}

  testRegister() {
    this.loading = true;
    this.result = null;
    this.error = null;

    const testData = {
      fullName: 'Test User',
      username: 'testuser' + Date.now(),
      email: 'test' + Date.now() + '@example.com',
      phoneNumber: '1234567890',
      password: 'TestPassword123',
      confirmPassword: 'TestPassword123'
    };

    console.log('Testing register with:', testData);

    this.http.post(`${this.apiUrl}/api/auth/register`, testData).subscribe({
      next: (response) => {
        this.loading = false;
        this.result = response;
        console.log('Register success:', response);
      },
      error: (err) => {
        this.loading = false;
        this.error = {
          status: err.status,
          statusText: err.statusText,
          message: err.message,
          error: err.error,
          url: err.url
        };
        console.error('Register error:', err);
      }
    });
  }
}