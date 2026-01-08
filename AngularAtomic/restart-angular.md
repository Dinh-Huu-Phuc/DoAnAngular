# 🔄 Restart Angular Dev Server

## Vấn đề:
Proxy config `/*` đã redirect tất cả requests (kể cả Angular routes) tới backend, khiến `/login` không hoạt động.

## ✅ Đã sửa:
- Cập nhật proxy.conf.json chỉ redirect `/api/*` và `/swagger/*`
- Angular routes sẽ hoạt động bình thường

## 🚀 Cần làm ngay:

### 1. Dừng Angular dev server:
```
Ctrl + C (trong terminal đang chạy Angular)
```

### 2. Khởi chạy lại:
```bash
npm start
```

### 3. Test:
- ✅ `/login` - Sẽ hiển thị trang đăng nhập Angular
- ✅ `/register` - Sẽ hiển thị trang đăng ký Angular  
- ✅ API calls sẽ được proxy tới backend

## 💡 Giải thích:
- Proxy `/*` = redirect TẤT CẢ requests tới backend
- Proxy `/api/*` = chỉ redirect API calls tới backend
- Angular routes như `/login`, `/register` sẽ được xử lý bởi Angular Router

Sau khi restart, trang `/login` sẽ hoạt động bình thường!