import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-backend-test',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="test-container">
      <h2>🔧 Backend Connection Test</h2>
      
      <div class="info-section">
        <p><strong>API URL:</strong> {{ apiUrl }}</p>
        <p><strong>Status:</strong> 
          <span [class]="statusClass">{{ status }}</span>
        </p>
      </div>

      <div class="button-section">
        <button (click)="testConnection()" [disabled]="loading" class="test-btn">
          {{ loading ? 'Testing...' : 'Test Connection' }}
        </button>
        <button (click)="openSwagger()" class="swagger-btn">
          Open Swagger UI
        </button>
      </div>

      <div class="result-section" *ngIf="result">
        <h3>Result:</h3>
        <pre>{{ result | json }}</pre>
      </div>

      <div class="error-section" *ngIf="error">
        <h3>Error:</h3>
        <p class="error-text">{{ error }}</p>
        
        <div class="troubleshoot">
          <h4>Troubleshooting:</h4>
          <ul>
            <li>Đảm bảo backend đang chạy trên port 5150</li>
            <li>Kiểm tra CORS configuration trên backend</li>
            <li>Thử truy cập trực tiếp: <a href="http://localhost:5150/swagger" target="_blank">http://localhost:5150/swagger</a></li>
            <li>Restart Angular dev server với proxy: <code>npm start</code></li>
          </ul>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .test-container {
      max-width: 800px;
      margin: 20px auto;
      padding: 20px;
      border: 1px solid #ddd;
      border-radius: 8px;
      font-family: Arial, sans-serif;
    }

    .info-section {
      background: #f5f5f5;
      padding: 15px;
      border-radius: 4px;
      margin: 15px 0;
    }

    .button-section {
      margin: 20px 0;
    }

    .test-btn, .swagger-btn {
      background: #007bff;
      color: white;
      border: none;
      padding: 10px 20px;
      margin: 5px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
    }

    .test-btn:hover, .swagger-btn:hover {
      background: #0056b3;
    }

    .test-btn:disabled {
      background: #6c757d;
      cursor: not-allowed;
    }

    .swagger-btn {
      background: #28a745;
    }

    .swagger-btn:hover {
      background: #1e7e34;
    }

    .result-section, .error-section {
      margin: 20px 0;
      padding: 15px;
      border-radius: 4px;
    }

    .result-section {
      background: #d4edda;
      border: 1px solid #c3e6cb;
    }

    .error-section {
      background: #f8d7da;
      border: 1px solid #f5c6cb;
    }

    .error-text {
      color: #721c24;
      font-weight: bold;
    }

    .status-connected {
      color: #28a745;
      font-weight: bold;
    }

    .status-disconnected {
      color: #dc3545;
      font-weight: bold;
    }

    .status-testing {
      color: #ffc107;
      font-weight: bold;
    }

    pre {
      background: #f8f9fa;
      padding: 10px;
      border-radius: 4px;
      overflow-x: auto;
    }

    .troubleshoot {
      margin-top: 15px;
    }

    .troubleshoot ul {
      margin: 10px 0;
      padding-left: 20px;
    }

    .troubleshoot li {
      margin: 5px 0;
    }

    code {
      background: #e9ecef;
      padding: 2px 4px;
      border-radius: 3px;
      font-family: monospace;
    }

    a {
      color: #007bff;
      text-decoration: none;
    }

    a:hover {
      text-decoration: underline;
    }
  `]
})
export class BackendTestComponent implements OnInit {
  apiUrl = ''; // Sử dụng proxy, không cần base URL
  status = 'Not tested';
  statusClass = 'status-disconnected';
  loading = false;
  result: any = null;
  error: string | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    // Auto test on load
    setTimeout(() => this.testConnection(), 1000);
  }

  testConnection() {
    this.loading = true;
    this.status = 'Testing...';
    this.statusClass = 'status-testing';
    this.result = null;
    this.error = null;

    // Test với một endpoint đơn giản
    this.http.get(`${this.apiUrl}/health`, { observe: 'response' }).subscribe({
      next: (response) => {
        this.loading = false;
        this.status = 'Connected';
        this.statusClass = 'status-connected';
        this.result = {
          status: response.status,
          statusText: response.statusText,
          body: response.body
        };
      },
      error: (err) => {
        this.loading = false;
        this.status = 'Connection Failed';
        this.statusClass = 'status-disconnected';
        this.error = `${err.status || 'Unknown'}: ${err.message || err.error?.message || 'Connection refused'}`;
        
        // Thử test với endpoint khác
        this.testAlternativeEndpoint();
      }
    });
  }

  testAlternativeEndpoint() {
    // Thử với endpoint swagger
    this.http.get('http://localhost:5150/swagger/v1/swagger.json', { observe: 'response' }).subscribe({
      next: (response) => {
        this.status = 'Connected (Swagger)';
        this.statusClass = 'status-connected';
        this.result = {
          message: 'Backend is running, but /api/health endpoint not found',
          swagger: 'Available',
          status: response.status
        };
        this.error = null;
      },
      error: (err) => {
        console.error('Alternative test failed:', err);
      }
    });
  }

  openSwagger() {
    window.open(environment.swaggerUrl, '_blank');
  }
}