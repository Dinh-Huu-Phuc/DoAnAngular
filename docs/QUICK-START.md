# 🚀 Quick Start Guide - Chemistry Learning Platform

## 📋 Yêu cầu

- ✅ .NET SDK 10.0 (hoặc 8.0)
- ✅ Node.js và npm
- ✅ SQL Server (SQLEXPRESS)
- ✅ Git

## 🎯 Khởi động nhanh (3 bước)

### 1️⃣ Khởi động Backend

Mở Terminal 1:
```bash
cd backend/ChemistryAPI/ChemistryAPI
dotnet run
```

Đợi thấy:
```
Now listening on: http://localhost:5150
Now listening on: https://localhost:7081
```

✅ Backend đã sẵn sàng!

### 2️⃣ Khởi động Frontend

Mở Terminal 2:
```bash
cd frontend/AngularAtomic
npm start
```

Đợi thấy:
```
Angular Live Development Server is listening on localhost:4200
```

✅ Frontend đã sẵn sàng!

### 3️⃣ Mở Browser

Truy cập: `http://localhost:4200`

✅ Bắt đầu sử dụng!

---

## 🧪 Test API (Optional)

### Cách 1: PowerShell (Windows)
```powershell
.\test-auth-api.ps1
```

### Cách 2: Node.js
```bash
node test-auth-api.js
```

### Cách 3: Swagger UI
Mở browser: `http://localhost:5150/swagger`

---

## 🔧 Cấu hình Database

### Option 1: Sử dụng appsettings.json (Mặc định)

File: `backend/ChemistryAPI/ChemistryAPI/appsettings.json`
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=TANTHUYHOANG\\SQLEXPRESS;Database=ChemistryAngularDB;User Id=sa;Password=123;TrustServerCertificate=True;"
  }
}
```

### Option 2: Sử dụng .env file (Khuyến nghị)

Tạo file: `backend/ChemistryAPI/ChemistryAPI/.env`
```env
DB_CONNECTION_STRING=Server=TANTHUYHOANG\SQLEXPRESS;Database=ChemistryAngularDB;User Id=sa;Password=123;TrustServerCertificate=True;
GEMINI_API_KEY=your_gemini_api_key_here
```

### Tạo Database

Mở SQL Server Management Studio và chạy:
```sql
CREATE DATABASE ChemistryAngularDB;
```

Hoặc để backend tự động tạo khi chạy lần đầu.

---

## 📁 Cấu trúc Project

```
AngularProject3/
├── frontend/
│   ├── AngularAtomic/          # Angular application
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── services/
│   │   │   │   │   └── auth.service.ts    # Authentication service
│   │   │   │   ├── pages/
│   │   │   │   │   ├── auth/
│   │   │   │   │   │   ├── login-page.component.ts
│   │   │   │   │   │   └── register-page.component.ts
│   │   │   └── environments/
│   │   │       └── environment.ts
│   │   ├── proxy.conf.json     # Proxy configuration
│   │   └── package.json
│   └── run-frontend.bat
│
├── backend/
│   ├── ChemistryAPI/
│   │   └── ChemistryAPI/
│   │       ├── Controllers/
│   │       │   └── AuthController.cs      # Auth API endpoints
│   │       ├── Services/
│   │       ├── Models/
│   │       ├── DTOs/
│   │       ├── Data/
│   │       ├── appsettings.json
│   │       └── Program.cs
│   └── run-backend.bat
│
├── start-all.bat               # Chạy cả frontend và backend
├── test-auth-api.ps1           # Test API với PowerShell
├── test-auth-api.js            # Test API với Node.js
├── FIX-AUTH-GUIDE.md           # Hướng dẫn fix lỗi chi tiết
└── QUICK-START.md              # File này
```

---

## 🌐 URLs

| Service | URL | Mô tả |
|---------|-----|-------|
| Frontend | http://localhost:4200 | Angular application |
| Backend API | http://localhost:5150 | REST API |
| Backend HTTPS | https://localhost:7081 | REST API (HTTPS) |
| Swagger UI | http://localhost:5150/swagger | API Documentation |

---

## 🔑 API Endpoints

### Authentication

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "fullName": "Nguyễn Văn A",
  "username": "nguyenvana",
  "password": "Password123!",
  "confirmPassword": "Password123!",
  "email": "nguyenvana@example.com",
  "phoneNumber": "0123456789"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "nguyenvana",
  "password": "Password123!"
}
```

#### Get User
```http
GET /api/auth/user/{id}
```

---

## 🐛 Troubleshooting

### Backend không chạy được

**Lỗi**: `Couldn't find a project to run`

**Giải pháp**: Đảm bảo đang ở đúng thư mục
```bash
cd backend/ChemistryAPI/ChemistryAPI
dotnet run
```

### Frontend không kết nối được Backend

**Lỗi**: `Registration error: Error: Đã xảy ra lỗi`

**Giải pháp**:
1. Kiểm tra backend đang chạy
2. Kiểm tra proxy config: `frontend/AngularAtomic/proxy.conf.json`
3. Restart frontend với proxy: `npm start`

### Database connection failed

**Lỗi**: `Cannot open database`

**Giải pháp**:
1. Kiểm tra SQL Server đang chạy
2. Kiểm tra connection string trong `appsettings.json`
3. Tạo database: `CREATE DATABASE ChemistryAngularDB;`

### Port đã được sử dụng

**Lỗi**: `Address already in use`

**Giải pháp**:
```bash
# Tìm process đang dùng port
netstat -ano | findstr :5150
netstat -ano | findstr :4200

# Kill process
taskkill /PID <process_id> /F
```

---

## 📚 Tài liệu thêm

- [FIX-AUTH-GUIDE.md](FIX-AUTH-GUIDE.md) - Hướng dẫn fix lỗi authentication chi tiết
- [README-STRUCTURE.md](README-STRUCTURE.md) - Mô tả cấu trúc project
- [START-HERE.md](START-HERE.md) - Hướng dẫn tổng quan

---

## 💡 Tips

### Chạy cả hai cùng lúc
```bash
start-all.bat
```

### Dọn dẹp thư mục cũ
```bash
cleanup-old-folders.bat
```

### Test API nhanh
```powershell
.\test-auth-api.ps1
```

### Xem logs chi tiết
```bash
# Backend
cd backend/ChemistryAPI/ChemistryAPI
dotnet run --verbosity detailed

# Frontend
cd frontend/AngularAtomic
npm start -- --verbose
```

---

## ✅ Checklist khởi động

- [ ] SQL Server đang chạy
- [ ] Database `ChemistryAngularDB` đã tạo
- [ ] Backend chạy thành công ở port 5150
- [ ] Frontend chạy thành công ở port 4200
- [ ] Test API thành công
- [ ] Có thể đăng ký user mới
- [ ] Có thể đăng nhập

---

## 🆘 Cần trợ giúp?

Nếu gặp vấn đề:
1. Đọc [FIX-AUTH-GUIDE.md](FIX-AUTH-GUIDE.md)
2. Chạy test script: `.\test-auth-api.ps1`
3. Kiểm tra logs trong console
4. Kiểm tra browser DevTools (F12)

---

**Chúc bạn code vui vẻ! 🎉**
