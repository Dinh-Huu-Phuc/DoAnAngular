# Chemistry Learning Platform 🧪

Nền tảng học tập Hóa học với AI chatbot và mô phỏng thí nghiệm.

## 🚀 Quick Start

### Cách nhanh nhất (1 lệnh)
```bash
start-all.bat
```

### Hoặc chạy riêng từng service

**Terminal 1 - Backend:**
```bash
cd backend
run-backend.bat
```

**Terminal 2 - Frontend:**
```bash
cd frontend
run-frontend.bat
```

## 📁 Cấu trúc Project

```
AngularProject3/
├── frontend/               # Angular application
│   ├── AngularAtomic/
│   └── run-frontend.bat
├── backend/                # .NET API
│   ├── ChemistryAPI/
│   └── run-backend.bat
├── start-all.bat          # Chạy cả hai cùng lúc
└── test-auth-api.ps1      # Test API
```

## 🌐 URLs

| Service | URL | Mô tả |
|---------|-----|-------|
| Frontend | http://localhost:4200 | Angular UI |
| Backend | http://localhost:5150 | REST API |
| Swagger | http://localhost:5150/swagger | API Docs |

## 🔑 Features

- ✅ User Authentication (Register/Login)
- ✅ AI Chatbot (Gemini API)
- ✅ Chemistry Experiments Simulation
- ✅ Experiment History
- ✅ User Profile Management

## 📚 Documentation

- [QUICK-START.md](QUICK-START.md) - Hướng dẫn khởi động nhanh
- [AUTH-API-SUMMARY.md](AUTH-API-SUMMARY.md) - Tóm tắt API Authentication
- [FIX-AUTH-GUIDE.md](FIX-AUTH-GUIDE.md) - Hướng dẫn fix lỗi
- [START-HERE.md](START-HERE.md) - Hướng dẫn chi tiết

## 🧪 Testing

### Test API với PowerShell
```powershell
.\test-auth-api.ps1
```

### Test API với Node.js
```bash
node test-auth-api.js
```

### Test qua Swagger UI
Mở: http://localhost:5150/swagger

## 🔧 Requirements

- .NET SDK 10.0 (hoặc 8.0)
- Node.js và npm
- SQL Server (SQLEXPRESS)

## 🐛 Troubleshooting

Nếu gặp lỗi đăng ký/đăng nhập, xem: [FIX-AUTH-GUIDE.md](FIX-AUTH-GUIDE.md)

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/login` - Đăng nhập
- `GET /api/auth/user/{id}` - Lấy thông tin user

### Chat
- `POST /api/chat/send` - Gửi tin nhắn
- `GET /api/chat/history/{userId}` - Lịch sử chat

### Experiments
- `GET /api/experiments` - Danh sách thí nghiệm
- `POST /api/experiments` - Tạo thí nghiệm mới
- `POST /api/experiments/{id}/results` - Lưu kết quả

## 🔒 Security

- Passwords được hash với SHA256
- CORS được cấu hình cho localhost:4200
- SQL injection protection với Entity Framework

## 🗄️ Database

### Connection String
```
Server=TANTHUYHOANG\SQLEXPRESS;
Database=ChemistryAngularDB;
User Id=sa;
Password=123;
TrustServerCertificate=True;
```

### Tạo Database
```sql
CREATE DATABASE ChemistryAngularDB;
```

## 🎯 Development

### Backend
```bash
cd backend/ChemistryAPI/ChemistryAPI
dotnet watch run
```

### Frontend
```bash
cd frontend/AngularAtomic
npm start
```

## 📦 Build

### Backend
```bash
cd backend/ChemistryAPI/ChemistryAPI
dotnet publish -c Release
```

### Frontend
```bash
cd frontend/AngularAtomic
npm run build
```

## 🧹 Cleanup

Xóa thư mục cũ (sau khi test xong):
```bash
cleanup-old-folders.bat
```

## 📄 License

MIT

## 👥 Contributors

- Tân Thủy Hoàng

---

**Bắt đầu ngay:** Chạy `start-all.bat` và mở http://localhost:4200
