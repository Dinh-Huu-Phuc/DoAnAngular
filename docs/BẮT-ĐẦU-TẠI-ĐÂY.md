# 🎯 BẮT ĐẦU TẠI ĐÂY

## 👋 Chào bạn!

Project của bạn đã được tổ chức lại hoàn chỉnh và sẵn sàng sử dụng!

## ⚡ Khởi động nhanh (3 bước)

### Bước 1: Mở Terminal
Nhấn `Ctrl + ~` trong VS Code hoặc mở Command Prompt

### Bước 2: Chạy lệnh
```bash
start-all.bat
```

### Bước 3: Mở Browser
Truy cập: http://localhost:4200

**Xong! Bạn đã sẵn sàng! 🎉**

---

## 📁 Cấu trúc mới

```
AngularProject3/
├── frontend/           ← Angular application
├── backend/            ← .NET API
└── [tài liệu]          ← Các file hướng dẫn
```

---

## 🔑 Đăng ký & Đăng nhập

### Đăng ký user mới
1. Mở http://localhost:4200
2. Click "Đăng ký"
3. Điền thông tin
4. Click "Đăng ký"

### Đăng nhập
1. Click "Đăng nhập"
2. Nhập username và password
3. Click "Đăng nhập"

---

## 🧪 Test API

### Cách 1: PowerShell (Khuyến nghị)
```powershell
.\test-auth-api.ps1
```

### Cách 2: Swagger UI
Mở: http://localhost:5150/swagger

---

## 📚 Tài liệu

### Cho người mới
- [QUICK-START.md](QUICK-START.md) - Hướng dẫn khởi động nhanh
- [INDEX.md](INDEX.md) - Danh mục tài liệu

### Khi gặp lỗi
- [FIX-AUTH-GUIDE.md](FIX-AUTH-GUIDE.md) - Hướng dẫn fix lỗi
- [CHECKLIST.md](CHECKLIST.md) - Checklist kiểm tra

### Cho developer
- [AUTH-API-SUMMARY.md](AUTH-API-SUMMARY.md) - Tóm tắt API
- [ARCHITECTURE.md](ARCHITECTURE.md) - Kiến trúc hệ thống
- [COMMANDS.md](COMMANDS.md) - Tổng hợp lệnh

---

## ❓ Câu hỏi thường gặp

### Backend không chạy?
```bash
cd backend/ChemistryAPI/ChemistryAPI
dotnet run
```

### Frontend không kết nối Backend?
1. Kiểm tra backend đang chạy
2. Restart frontend: `npm start`

### Lỗi đăng ký/đăng nhập?
1. Chạy: `.\test-auth-api.ps1`
2. Xem: [FIX-AUTH-GUIDE.md](FIX-AUTH-GUIDE.md)

---

## 🌐 URLs quan trọng

| Service | URL |
|---------|-----|
| Frontend | http://localhost:4200 |
| Backend | http://localhost:5150 |
| Swagger | http://localhost:5150/swagger |

---

## 🎯 Bước tiếp theo

1. ✅ Khởi động project: `start-all.bat`
2. ✅ Test API: `.\test-auth-api.ps1`
3. ✅ Đăng ký user mới
4. ✅ Đăng nhập
5. ✅ Bắt đầu phát triển!

---

## 💡 Tips

### Chạy riêng từng service
```bash
# Backend
cd backend && run-backend.bat

# Frontend
cd frontend && run-frontend.bat
```

### Xem tất cả lệnh
Đọc: [COMMANDS.md](COMMANDS.md)

### Hiểu kiến trúc
Đọc: [ARCHITECTURE.md](ARCHITECTURE.md)

---

## 🆘 Cần trợ giúp?

1. Xem [INDEX.md](INDEX.md) - Danh mục tài liệu
2. Xem [FIX-AUTH-GUIDE.md](FIX-AUTH-GUIDE.md) - Fix lỗi
3. Chạy `.\test-auth-api.ps1` - Test API

---

## ✅ Checklist

- [ ] Đã chạy `start-all.bat`
- [ ] Backend chạy thành công (port 5150)
- [ ] Frontend chạy thành công (port 4200)
- [ ] Đã test API với `.\test-auth-api.ps1`
- [ ] Đã đăng ký user mới
- [ ] Đã đăng nhập thành công

---

**Chúc bạn code vui vẻ! 🚀**

Nếu mọi thứ hoạt động tốt, bạn có thể xóa thư mục cũ:
```bash
cleanup-old-folders.bat
```
