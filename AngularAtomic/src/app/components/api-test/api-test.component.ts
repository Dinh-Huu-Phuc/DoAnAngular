import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService, User } from '../../services/data.service';

@Component({
  selector: 'app-api-test',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="api-test-container">
      <h2>API Test Component</h2>
      
      <div class="test-section">
        <button (click)="testGetUsers()" class="test-btn">Test Get Users</button>
        <button (click)="testCreateUser()" class="test-btn">Test Create User</button>
      </div>

      <div class="results" *ngIf="loading">
        <p>Loading...</p>
      </div>

      <div class="results" *ngIf="error">
        <p class="error">Error: {{ error }}</p>
      </div>

      <div class="results" *ngIf="users.length > 0">
        <h3>Users:</h3>
        <ul>
          <li *ngFor="let user of users">
            {{ user.name }} - {{ user.email }}
          </li>
        </ul>
      </div>
    </div>
  `,
  styles: [`
    .api-test-container {
      padding: 20px;
      max-width: 600px;
      margin: 0 auto;
    }

    .test-section {
      margin: 20px 0;
    }

    .test-btn {
      background: #007bff;
      color: white;
      border: none;
      padding: 10px 20px;
      margin: 5px;
      border-radius: 4px;
      cursor: pointer;
    }

    .test-btn:hover {
      background: #0056b3;
    }

    .results {
      margin: 20px 0;
      padding: 15px;
      border: 1px solid #ddd;
      border-radius: 4px;
    }

    .error {
      color: red;
    }

    ul {
      list-style-type: none;
      padding: 0;
    }

    li {
      padding: 5px 0;
      border-bottom: 1px solid #eee;
    }
  `]
})
export class ApiTestComponent implements OnInit {
  users: User[] = [];
  loading = false;
  error: string | null = null;

  constructor(private dataService: DataService) {}

  ngOnInit() {
    // Có thể gọi API ngay khi component load
  }

  testGetUsers() {
    this.loading = true;
    this.error = null;
    
    this.dataService.getUsers().subscribe({
      next: (response) => {
        this.loading = false;
        if (response.success) {
          this.users = response.data;
        } else {
          this.error = response.message || 'Unknown error';
        }
      },
      error: (err) => {
        this.loading = false;
        this.error = err;
        console.error('API Error:', err);
      }
    });
  }

  testCreateUser() {
    this.loading = true;
    this.error = null;

    const newUser = {
      name: 'Test User',
      email: 'test@example.com'
    };

    this.dataService.createUser(newUser).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.success) {
          console.log('User created:', response.data);
          // Refresh danh sách users
          this.testGetUsers();
        } else {
          this.error = response.message || 'Failed to create user';
        }
      },
      error: (err) => {
        this.loading = false;
        this.error = err;
        console.error('API Error:', err);
      }
    });
  }
}