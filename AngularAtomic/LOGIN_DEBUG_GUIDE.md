# Hướng Dẫn Debug Lỗi Đăng Nhập

## ✅ ĐÃ SỬA

### Vấn đề gốc
- **Lỗi**: 401 Unauthorized khi đăng nhập
- **Nguyên nhân**: API Interceptor đang thêm Authorization header cho tất cả requests, kể cả login
- **Giải pháp**: Sửa interceptor để bỏ qua auth headers cho `/api/auth/login` và `/api/auth/register`

### Thay đổi trong `src/app/interceptors/api.interceptor.ts`
```typescript
// Chỉ thêm Authorization header cho các requests KHÔNG phải login/register
const isAuthEndpoint = req.url.includes('/api/auth/login') || req.url.includes('/api/auth/register');

if (!isAuthEndpoint) {
  // Thêm auth headers...
} else {
  console.log('🔑 Auth endpoint - skipping auth headers');
}
```

## 🧪 TEST CREDENTIALS

### Credentials hoạt động
- **Username**: `test`
- **Password**: `test`
- **User ID**: 1

### Credentials khác có thể thử
- admin/admin (không hoạt động)
- Hoặc account mới bạn vừa tạo

## 🔧 CÁCH TEST

### Bước 1: Kiểm tra Backend
```bash
node test-login-simple.js
```
**Kết quả mong đợi**: ✅ Đăng nhập thành công với test/test

### Bước 2: Test trên Web
1. Mở http://localhost:4200
2. Vào trang đăng nhập
3. Nhập: `test` / `test`
4. Bấm đăng nhập

**Kết quả mong đợi**: 
- Không còn lỗi 401
- Đăng nhập thành công
- Redirect về trang chính

### Bước 3: Kiểm tra Console
Mở Developer Tools > Console, sẽ thấy:
```
🔑 Auth endpoint - skipping auth headers
✅ Login successful! User info: ...
```

## 🐛 NẾU VẪN LỖI

### Lỗi 401 vẫn xuất hiện
1. **Clear cache**: Ctrl+F5 hoặc hard refresh
2. **Clear localStorage**: 
   ```javascript
   localStorage.clear()
   ```
3. **Restart Angular dev server**:
   ```bash
   npm run start -- --port 4200
   ```

### Lỗi CORS
- Kiểm tra backend có chạy trên port 5150 không
- Kiểm tra proxy.conf.json có đúng không

### Lỗi Network
- Kiểm tra backend server status
- Test API trực tiếp: `node test-login-simple.js`

## 📋 CHECKLIST DEBUG

- [ ] API interceptor đã được sửa
- [ ] Angular dev server đã restart
- [ ] Browser cache đã clear
- [ ] Backend server đang chạy
- [ ] Test API trực tiếp thành công
- [ ] Credentials đúng (test/test)

## 🎯 EXPECTED FLOW

### Đăng nhập thành công
1. User nhập test/test
2. Frontend gửi POST /api/auth/login (không có auth headers)
3. Backend trả về user info
4. AuthService lưu user info vào localStorage
5. Redirect về trang chính
6. Các API calls khác sẽ có X-User-ID header

### Sau khi đăng nhập
- `authService.isAuthenticated()` = true
- `authService.currentUser()` = user object
- `authService.token()` = null (backend không trả token)
- Các API calls khác sẽ có `X-User-ID: 1` header

---

**🔧 Trạng thái**: Đã sửa API interceptor
**📅 Cập nhật**: January 9, 2026
**✅ Test**: API login hoạt động với test/test