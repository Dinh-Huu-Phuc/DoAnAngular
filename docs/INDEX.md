# 📚 Index - Tài liệu Project

## 🚀 Bắt đầu nhanh

| File | Mô tả | Dành cho |
|------|-------|----------|
| [README.md](README.md) | Tổng quan project | Tất cả mọi người |
| [QUICK-START.md](QUICK-START.md) | Hướng dẫn khởi động nhanh (3 bước) | Người mới |
| [START-HERE.md](START-HERE.md) | Hướng dẫn chi tiết từng bước | Người mới |

## 🔧 Kỹ thuật

| File | Mô tả | Dành cho |
|------|-------|----------|
| [AUTH-API-SUMMARY.md](AUTH-API-SUMMARY.md) | Tóm tắt API Authentication | Developer |
| [README-STRUCTURE.md](README-STRUCTURE.md) | Cấu trúc thư mục project | Developer |
| [SUMMARY.md](SUMMARY.md) | Tóm tắt những gì đã làm | Developer |

## 🐛 Troubleshooting

| File | Mô tả | Dành cho |
|------|-------|----------|
| [FIX-AUTH-GUIDE.md](FIX-AUTH-GUIDE.md) | Hướng dẫn fix lỗi authentication | Khi gặp lỗi |
| [CHECKLIST.md](CHECKLIST.md) | Checklist kiểm tra từng bước | Testing |

## 🧪 Scripts

### Khởi động
| File | Lệnh | Mô tả |
|------|------|-------|
| `start-all.bat` | `start-all.bat` | Chạy cả frontend và backend |
| `backend/run-backend.bat` | `cd backend && run-backend.bat` | Chỉ chạy backend |
| `frontend/run-frontend.bat` | `cd frontend && run-frontend.bat` | Chỉ chạy frontend |

### Testing
| File | Lệnh | Mô tả |
|------|------|-------|
| `test-auth-api.ps1` | `.\test-auth-api.ps1` | Test API với PowerShell |
| `test-auth-api.js` | `node test-auth-api.js` | Test API với Node.js |

### Utilities
| File | Lệnh | Mô tả |
|------|------|-------|
| `cleanup-old-folders.bat` | `cleanup-old-folders.bat` | Xóa thư mục cũ |

## 📖 Hướng dẫn theo tình huống

### Tình huống 1: Lần đầu setup project
1. Đọc [QUICK-START.md](QUICK-START.md)
2. Chạy `start-all.bat`
3. Mở http://localhost:4200
4. Nếu lỗi → Xem [FIX-AUTH-GUIDE.md](FIX-AUTH-GUIDE.md)

### Tình huống 2: Backend không chạy
1. Đọc [FIX-AUTH-GUIDE.md](FIX-AUTH-GUIDE.md) - Bước 1
2. Kiểm tra SQL Server
3. Kiểm tra connection string
4. Chạy `cd backend/ChemistryAPI/ChemistryAPI && dotnet run`

### Tình huống 3: Frontend không kết nối Backend
1. Đọc [FIX-AUTH-GUIDE.md](FIX-AUTH-GUIDE.md) - Bước 4
2. Kiểm tra proxy config
3. Kiểm tra backend đang chạy
4. Restart frontend với `npm start`

### Tình huống 4: Register/Login lỗi
1. Đọc [FIX-AUTH-GUIDE.md](FIX-AUTH-GUIDE.md)
2. Chạy `.\test-auth-api.ps1`
3. Kiểm tra Network tab trong DevTools (F12)
4. Xem [CHECKLIST.md](CHECKLIST.md)

### Tình huống 5: Muốn hiểu API
1. Đọc [AUTH-API-SUMMARY.md](AUTH-API-SUMMARY.md)
2. Mở Swagger: http://localhost:5150/swagger
3. Xem code: `backend/ChemistryAPI/ChemistryAPI/Controllers/AuthController.cs`

### Tình huống 6: Muốn test API
1. Chạy `.\test-auth-api.ps1` (PowerShell)
2. Hoặc `node test-auth-api.js` (Node.js)
3. Hoặc mở Swagger: http://localhost:5150/swagger
4. Hoặc test qua UI: http://localhost:4200

## 🗂️ Cấu trúc thư mục

```
AngularProject3/
│
├── 📁 frontend/                    # Angular application
│   ├── AngularAtomic/
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── services/
│   │   │   │   │   └── auth.service.ts
│   │   │   │   ├── pages/
│   │   │   │   │   └── auth/
│   │   │   │   │       ├── login-page.component.ts
│   │   │   │   │       └── register-page.component.ts
│   │   │   └── environments/
│   │   ├── proxy.conf.json
│   │   └── package.json
│   └── run-frontend.bat
│
├── 📁 backend/                     # .NET API
│   ├── ChemistryAPI/
│   │   └── ChemistryAPI/
│   │       ├── Controllers/
│   │       │   └── AuthController.cs
│   │       ├── Services/
│   │       ├── Models/
│   │       ├── DTOs/
│   │       ├── Data/
│   │       ├── appsettings.json
│   │       └── Program.cs
│   └── run-backend.bat
│
├── 📄 README.md                    # Tổng quan
├── 📄 QUICK-START.md               # Khởi động nhanh
├── 📄 START-HERE.md                # Hướng dẫn chi tiết
├── 📄 AUTH-API-SUMMARY.md          # Tóm tắt API
├── 📄 FIX-AUTH-GUIDE.md            # Fix lỗi
├── 📄 CHECKLIST.md                 # Checklist
├── 📄 SUMMARY.md                   # Tóm tắt
├── 📄 INDEX.md                     # File này
├── 📄 README-STRUCTURE.md          # Cấu trúc
│
├── 🔧 start-all.bat                # Chạy tất cả
├── 🧪 test-auth-api.ps1            # Test PowerShell
├── 🧪 test-auth-api.js             # Test Node.js
└── 🧹 cleanup-old-folders.bat      # Dọn dẹp
```

## 🎯 Quick Links

### URLs
- Frontend: http://localhost:4200
- Backend: http://localhost:5150
- Swagger: http://localhost:5150/swagger

### API Endpoints
- Register: `POST /api/auth/register`
- Login: `POST /api/auth/login`
- Get User: `GET /api/auth/user/{id}`

### Important Files
- Backend Controller: `backend/ChemistryAPI/ChemistryAPI/Controllers/AuthController.cs`
- Frontend Service: `frontend/AngularAtomic/src/app/services/auth.service.ts`
- Proxy Config: `frontend/AngularAtomic/proxy.conf.json`
- Database Config: `backend/ChemistryAPI/ChemistryAPI/appsettings.json`

## 📊 Workflow

```
1. Setup
   ├── Đọc QUICK-START.md
   ├── Chạy start-all.bat
   └── Mở http://localhost:4200

2. Development
   ├── Backend: cd backend/ChemistryAPI/ChemistryAPI && dotnet watch run
   ├── Frontend: cd frontend/AngularAtomic && npm start
   └── Test: .\test-auth-api.ps1

3. Testing
   ├── Unit Tests: dotnet test
   ├── API Tests: .\test-auth-api.ps1
   ├── UI Tests: Manual testing
   └── Checklist: CHECKLIST.md

4. Troubleshooting
   ├── Đọc FIX-AUTH-GUIDE.md
   ├── Chạy test scripts
   ├── Kiểm tra logs
   └── Xem DevTools (F12)
```

## 🔍 Tìm kiếm nhanh

### Tôi muốn...

**...khởi động project**
→ [QUICK-START.md](QUICK-START.md) hoặc chạy `start-all.bat`

**...hiểu API hoạt động như thế nào**
→ [AUTH-API-SUMMARY.md](AUTH-API-SUMMARY.md)

**...fix lỗi đăng ký/đăng nhập**
→ [FIX-AUTH-GUIDE.md](FIX-AUTH-GUIDE.md)

**...test API**
→ Chạy `.\test-auth-api.ps1` hoặc mở http://localhost:5150/swagger

**...xem cấu trúc project**
→ [README-STRUCTURE.md](README-STRUCTURE.md)

**...kiểm tra từng bước**
→ [CHECKLIST.md](CHECKLIST.md)

**...biết đã làm những gì**
→ [SUMMARY.md](SUMMARY.md)

## 📞 Support

Nếu cần hỗ trợ:
1. Tìm tài liệu phù hợp trong index này
2. Chạy test scripts để kiểm tra
3. Xem logs trong console
4. Kiểm tra browser DevTools (F12)

---

**Last Updated:** 2026-01-16

**Version:** 1.0
