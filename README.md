# 🧪 Chemistry Learning Platform

Ứng dụng học tập Hóa học với Angular + .NET Core, tích hợp AI Chatbot và mô phỏng 3D.

## 🚀 Quick Start

### 1. Khởi động Backend
```bash
cd backend/ChemistryAPI/ChemistryAPI
dotnet run
```

### 2. Khởi động Frontend
```bash
cd frontend/AngularChemistryWeb/AngularAtomic
npm start
```

### 3. Hoặc chạy cả hai
```bash
.\start-all.bat
```

## 📁 Cấu trúc Project

```
├── backend/ChemistryAPI/          # .NET Core API
├── frontend/AngularChemistryWeb/  # Angular Frontend
├── frontend/JS/                   # JavaScript test files
├── docs/                          # Documentation
└── start-all.bat                  # Quick start script
```

## ✨ Tính năng

- 🔐 **Authentication** - Đăng ký/Đăng nhập
- 💬 **AI Chatbot** - Trợ lý AI về Hóa học (Gemini API)
- 🧪 **Thí nghiệm** - Tạo và quản lý thí nghiệm
- 🌐 **3D Visualization** - Mô hình nguyên tử 3D với Three.js
- 📊 **Bảng tuần hoàn** - Thông tin chi tiết các nguyên tố

## 🔧 Cấu hình

### Backend (.env)
```env
GEMINI_API_KEY="your-api-key-here"
CONNECTION_STRING="your-db-connection"
```

### Frontend (.env)
```env
GEMINI_API_KEY=your-api-key-here
GEMINI_API_URL=https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent
```

## 📚 Documentation

- [Quick Start Guide](docs/QUICK-START.md)
- [Checklist](docs/CHECKLIST.md)
- [API Guide](docs/CHATBOX-DIRECT-API-GUIDE.md)

## 🛠️ Tech Stack

**Frontend:**
- Angular 18
- Three.js (3D visualization)
- Anime.js (animations)
- Bootstrap

**Backend:**
- .NET Core 8
- Entity Framework Core
- SQL Server
- Gemini AI API

## 📞 Support

Nếu gặp vấn đề, kiểm tra:
1. Backend console log
2. Frontend console (F12)
3. Network tab để xem API calls
4. File .env có đúng cấu hình không

---

**Made with ❤️ for Chemistry Learning**