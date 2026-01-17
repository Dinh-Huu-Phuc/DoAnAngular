# 🎮 Commands Reference - Tổng hợp lệnh thường dùng

## 🚀 Khởi động

### Cách 1: Tự động (Khuyến nghị)
```bash
# Chạy cả frontend và backend
start-all.bat
```

### Cách 2: Riêng từng service
```bash
# Terminal 1 - Backend
cd backend
run-backend.bat

# Terminal 2 - Frontend
cd frontend
run-frontend.bat
```

### Cách 3: Trực tiếp
```bash
# Backend
cd backend/ChemistryAPI/ChemistryAPI
dotnet run

# Frontend
cd frontend/AngularAtomic
npm start
```

---

## 🔧 Backend Commands

### Build & Run
```bash
# Navigate to project
cd backend/ChemistryAPI/ChemistryAPI

# Restore dependencies
dotnet restore

# Build project
dotnet build

# Run project
dotnet run

# Run with watch (auto-reload)
dotnet watch run

# Run with specific profile
dotnet run --launch-profile https
```

### Database
```bash
# Create migration
dotnet ef migrations add InitialCreate

# Update database
dotnet ef database update

# Drop database
dotnet ef database drop

# List migrations
dotnet ef migrations list

# Remove last migration
dotnet ef migrations remove
```

### Testing
```bash
# Run all tests
dotnet test

# Run with coverage
dotnet test /p:CollectCoverage=true

# Run specific test
dotnet test --filter "FullyQualifiedName~AuthControllerTests"
```

### Publish
```bash
# Publish for production
dotnet publish -c Release

# Publish to folder
dotnet publish -c Release -o ./publish

# Publish self-contained
dotnet publish -c Release -r win-x64 --self-contained
```

---

## 🎨 Frontend Commands

### Development
```bash
# Navigate to project
cd frontend/AngularAtomic

# Install dependencies
npm install

# Start dev server
npm start

# Start with specific port
ng serve --port 4300

# Start with proxy
ng serve --proxy-config proxy.conf.json

# Start with open browser
ng serve --open
```

### Build
```bash
# Build for development
ng build

# Build for production
ng build --configuration production

# Build with optimization
ng build --prod --optimization

# Build and watch
ng build --watch
```

### Testing
```bash
# Run unit tests
ng test

# Run unit tests once
ng test --watch=false

# Run e2e tests
ng e2e

# Run with coverage
ng test --code-coverage
```

### Code Generation
```bash
# Generate component
ng generate component components/my-component

# Generate service
ng generate service services/my-service

# Generate module
ng generate module modules/my-module

# Generate guard
ng generate guard guards/auth-guard

# Generate interceptor
ng generate interceptor interceptors/api-interceptor
```

### Linting & Formatting
```bash
# Lint code
ng lint

# Fix lint errors
ng lint --fix

# Format code (if prettier installed)
npm run format
```

---

## 🗄️ Database Commands

### SQL Server Management Studio
```sql
-- Create database
CREATE DATABASE ChemistryAngularDB;

-- Use database
USE ChemistryAngularDB;

-- List all tables
SELECT * FROM INFORMATION_SCHEMA.TABLES;

-- View Users table
SELECT * FROM Users;

-- Delete all users
DELETE FROM Users;

-- Delete specific user
DELETE FROM Users WHERE Username = 'testuser';

-- Count users
SELECT COUNT(*) FROM Users;

-- Find user by username
SELECT * FROM Users WHERE Username = 'testuser';

-- Update user
UPDATE Users SET FullName = 'New Name' WHERE Id = 1;
```

### Command Line (sqlcmd)
```bash
# Connect to SQL Server
sqlcmd -S TANTHUYHOANG\SQLEXPRESS -U sa -P 123

# Run query
sqlcmd -S TANTHUYHOANG\SQLEXPRESS -U sa -P 123 -Q "SELECT * FROM ChemistryAngularDB.dbo.Users"

# Run script file
sqlcmd -S TANTHUYHOANG\SQLEXPRESS -U sa -P 123 -i script.sql
```

---

## 🧪 Testing Commands

### PowerShell Test
```powershell
# Test authentication API
.\test-auth-api.ps1

# Test with verbose output
.\test-auth-api.ps1 -Verbose
```

### Node.js Test
```bash
# Test authentication API
node test-auth-api.js

# Test with debug
node --inspect test-auth-api.js
```

### cURL Tests
```bash
# Test Register
curl -X POST http://localhost:5150/api/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"fullName\":\"Test User\",\"username\":\"testuser\",\"password\":\"Test123!\",\"confirmPassword\":\"Test123!\",\"email\":\"test@example.com\",\"phoneNumber\":\"0123456789\"}"

# Test Login
curl -X POST http://localhost:5150/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"username\":\"testuser\",\"password\":\"Test123!\"}"

# Test Get User
curl http://localhost:5150/api/auth/user/1
```

### Browser Console Tests
```javascript
// Test Register
fetch('/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    fullName: 'Test User',
    username: 'testuser',
    password: 'Test123!',
    confirmPassword: 'Test123!',
    email: 'test@example.com',
    phoneNumber: '0123456789'
  })
}).then(r => r.json()).then(console.log);

// Test Login
fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'testuser',
    password: 'Test123!'
  })
}).then(r => r.json()).then(console.log);
```

---

## 🧹 Cleanup Commands

### Remove node_modules
```bash
# Windows
cd frontend/AngularAtomic
rmdir /s /q node_modules

# PowerShell
Remove-Item -Recurse -Force node_modules
```

### Remove bin/obj
```bash
# Windows
cd backend/ChemistryAPI/ChemistryAPI
rmdir /s /q bin
rmdir /s /q obj

# PowerShell
Remove-Item -Recurse -Force bin,obj
```

### Clean build
```bash
# Backend
dotnet clean

# Frontend
ng cache clean
```

### Remove old folders
```bash
# Run cleanup script
cleanup-old-folders.bat
```

---

## 🔍 Debugging Commands

### Backend Debugging
```bash
# Run with verbose logging
dotnet run --verbosity detailed

# Run with specific environment
$env:ASPNETCORE_ENVIRONMENT="Development"
dotnet run

# Attach debugger
dotnet run --no-build
```

### Frontend Debugging
```bash
# Run with source maps
ng serve --source-map

# Run with verbose output
ng serve --verbose

# Run with specific configuration
ng serve --configuration development
```

### Network Debugging
```bash
# Check if port is in use
netstat -ano | findstr :5150
netstat -ano | findstr :4200

# Kill process on port
taskkill /PID <process_id> /F

# Test connection
curl http://localhost:5150/swagger
curl http://localhost:4200
```

---

## 📦 Package Management

### Backend (NuGet)
```bash
# List packages
dotnet list package

# Add package
dotnet add package Microsoft.EntityFrameworkCore

# Remove package
dotnet remove package PackageName

# Update package
dotnet add package PackageName --version 1.2.3

# Restore packages
dotnet restore
```

### Frontend (npm)
```bash
# List packages
npm list

# Install package
npm install package-name

# Install dev dependency
npm install --save-dev package-name

# Remove package
npm uninstall package-name

# Update package
npm update package-name

# Update all packages
npm update

# Check outdated packages
npm outdated

# Audit security
npm audit

# Fix security issues
npm audit fix
```

---

## 🔐 Environment & Configuration

### Set Environment Variables
```bash
# Windows CMD
set ASPNETCORE_ENVIRONMENT=Development
set DB_CONNECTION_STRING=Server=...

# PowerShell
$env:ASPNETCORE_ENVIRONMENT="Development"
$env:DB_CONNECTION_STRING="Server=..."

# Linux/Mac
export ASPNETCORE_ENVIRONMENT=Development
export DB_CONNECTION_STRING="Server=..."
```

### Create .env file
```bash
# Backend
cd backend/ChemistryAPI/ChemistryAPI
echo DB_CONNECTION_STRING=Server=TANTHUYHOANG\SQLEXPRESS;Database=ChemistryAngularDB;User Id=sa;Password=123;TrustServerCertificate=True; > .env
echo GEMINI_API_KEY=your_api_key_here >> .env
```

---

## 📊 Monitoring Commands

### Check Logs
```bash
# Backend logs
cd backend/ChemistryAPI/ChemistryAPI
type logs\app.log

# Frontend logs (browser console)
# Open DevTools (F12) → Console tab
```

### Check Process
```bash
# List running processes
tasklist | findstr dotnet
tasklist | findstr node

# Check port usage
netstat -ano | findstr :5150
netstat -ano | findstr :4200
```

### Performance
```bash
# Backend performance
dotnet run --configuration Release

# Frontend performance
ng build --prod --stats-json
```

---

## 🚀 Quick Commands

### Full Reset
```bash
# Stop all processes
taskkill /F /IM dotnet.exe
taskkill /F /IM node.exe

# Clean backend
cd backend/ChemistryAPI/ChemistryAPI
dotnet clean
rmdir /s /q bin
rmdir /s /q obj

# Clean frontend
cd frontend/AngularAtomic
rmdir /s /q node_modules
rmdir /s /q dist

# Reinstall
cd backend/ChemistryAPI/ChemistryAPI
dotnet restore

cd frontend/AngularAtomic
npm install

# Restart
start-all.bat
```

### Quick Test
```bash
# Test everything
.\test-auth-api.ps1

# Open Swagger
start http://localhost:5150/swagger

# Open Frontend
start http://localhost:4200
```

---

## 📚 Help Commands

### Backend Help
```bash
dotnet --help
dotnet run --help
dotnet build --help
dotnet ef --help
```

### Frontend Help
```bash
ng help
ng serve --help
ng build --help
ng test --help
```

---

**Last Updated:** 2026-01-16

**Version:** 1.0
