# Hướng dẫn khởi động Project

## ✅ Cấu trúc đã được tổ chức lại

Project của bạn đã được tổ chức thành 2 thư mục chính:

- **frontend/** - Chứa Angular application (AngularAtomic)
- **backend/** - Chứa .NET API (ChemistryAPI)

## 🚀 Cách chạy nhanh

### Option 1: Sử dụng batch files (Đơn giản nhất)

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

### Option 2: Chạy trực tiếp

**Terminal 1 - Backend:**
```bash
cd backend/ChemistryAPI/ChemistryAPI
dotnet run
```

**Terminal 2 - Frontend:**
```bash
cd frontend/AngularAtomic
npm start
```

## 📝 Lưu ý quan trọng

### Backend
- ✅ Project đã build thành công
- 📍 Path đúng: `backend/ChemistryAPI/ChemistryAPI/ChemistryAPI.csproj`
- 🌐 URL: `https://localhost:7240` hoặc `http://localhost:5240`
- ⚙️ Kiểm tra file `.env` để cấu hình database connection string

### Frontend
- 📍 Path: `frontend/AngularAtomic`
- 🌐 URL: `http://localhost:4200`
- 🔗 Proxy config đã được cấu hình để kết nối với backend

## 🔧 Troubleshooting

### Nếu backend không chạy:
```bash
cd backend/ChemistryAPI/ChemistryAPI
dotnet restore
dotnet build
dotnet run
```

### Nếu frontend không chạy:
```bash
cd frontend/AngularAtomic
npm install
npm start
```

### Kiểm tra kết nối:
1. Chạy backend trước
2. Mở browser: `https://localhost:7240/swagger` để xem API docs
3. Chạy frontend
4. Mở browser: `http://localhost:4200`

## 📂 Thư mục cũ

Các thư mục gốc (`AngularAtomic` và `API_Angular`) vẫn còn ở root directory. Sau khi xác nhận mọi thứ hoạt động tốt, bạn có thể xóa chúng để tiết kiệm dung lượng.
