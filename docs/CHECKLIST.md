# ✅ Checklist - Kiểm tra Authentication

## 📋 Trước khi bắt đầu

- [ ] Đã cài đặt .NET SDK 10.0 (hoặc 8.0)
- [ ] Đã cài đặt Node.js và npm
- [ ] SQL Server đang chạy
- [ ] Database `ChemistryAngularDB` đã được tạo

## 🔧 Kiểm tra Backend

### 1. Kiểm tra cấu trúc thư mục
- [ ] Thư mục `backend/ChemistryAPI/ChemistryAPI` tồn tại
- [ ] File `backend/ChemistryAPI/ChemistryAPI/ChemistryAPI.csproj` tồn tại
- [ ] File `backend/ChemistryAPI/ChemistryAPI/Controllers/AuthController.cs` tồn tại

### 2. Kiểm tra cấu hình
- [ ] File `appsettings.json` có connection string đúng
- [ ] Connection string trỏ đến SQL Server đúng
- [ ] Database name là `ChemistryAngularDB`

### 3. Build và chạy Backend
```bash
cd backend/ChemistryAPI/ChemistryAPI
dotnet build
```
- [ ] Build thành công (không có error)
- [ ] Có thể có warning (OK)

```bash
dotnet run
```
- [ ] Backend chạy thành công
- [ ] Thấy message: `Now listening on: http://localhost:5150`
- [ ] Thấy message: `Now listening on: https://localhost:7081`

### 4. Test Backend API
Mở browser: `http://localhost:5150/swagger`
- [ ] Swagger UI hiển thị
- [ ] Thấy endpoint `/api/auth/register`
- [ ] Thấy endpoint `/api/auth/login`
- [ ] Thấy endpoint `/api/auth/user/{id}`

## 🎨 Kiểm tra Frontend

### 1. Kiểm tra cấu trúc thư mục
- [ ] Thư mục `frontend/AngularAtomic` tồn tại
- [ ] File `frontend/AngularAtomic/package.json` tồn tại
- [ ] File `frontend/AngularAtomic/proxy.conf.json` tồn tại

### 2. Kiểm tra cấu hình
Mở file `frontend/AngularAtomic/proxy.conf.json`:
- [ ] Target là `http://localhost:5150`
- [ ] Path là `/api/*`

Mở file `frontend/AngularAtomic/package.json`:
- [ ] Script `start` có `--proxy-config proxy.conf.json`

### 3. Install và chạy Frontend
```bash
cd frontend/AngularAtomic
npm install
```
- [ ] Install thành công (không có error)

```bash
npm start
```
- [ ] Frontend chạy thành công
- [ ] Thấy message: `Angular Live Development Server is listening on localhost:4200`
- [ ] Không có error trong console

### 4. Test Frontend UI
Mở browser: `http://localhost:4200`
- [ ] Trang web hiển thị
- [ ] Có nút "Đăng ký" hoặc "Register"
- [ ] Có nút "Đăng nhập" hoặc "Login"

## 🧪 Test Authentication Flow

### 1. Test với Script
```powershell
.\test-auth-api.ps1
```
- [ ] Script chạy thành công
- [ ] Test Register: ✅ SUCCESS
- [ ] Test Login: ✅ SUCCESS
- [ ] Test Get User: ✅ SUCCESS

### 2. Test qua UI - Register
1. Mở `http://localhost:4200`
2. Click "Đăng ký" / "Register"
3. Điền form:
   - Full Name: `Test User`
   - Username: `testuser123`
   - Email: `test@example.com`
   - Phone: `0123456789`
   - Password: `Test123!`
   - Confirm Password: `Test123!`
4. Click "Đăng ký"

Checklist:
- [ ] Form submit thành công
- [ ] Không có error trong console (F12)
- [ ] Redirect đến trang login hoặc home
- [ ] Thấy thông báo thành công

### 3. Test qua UI - Login
1. Mở `http://localhost:4200`
2. Click "Đăng nhập" / "Login"
3. Điền form:
   - Username: `testuser123`
   - Password: `Test123!`
4. Click "Đăng nhập"

Checklist:
- [ ] Login thành công
- [ ] Không có error trong console (F12)
- [ ] Redirect đến trang home
- [ ] Thấy tên user trên navbar
- [ ] LocalStorage có `auth_user`

### 4. Test qua Browser Console
Mở DevTools (F12) và chạy:

```javascript
// Test Register
fetch('/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    fullName: 'Console Test',
    username: 'consoletest',
    password: 'Test123!',
    confirmPassword: 'Test123!',
    email: 'console@test.com',
    phoneNumber: '0987654321'
  })
})
.then(r => r.json())
.then(d => console.log('Register:', d))
.catch(e => console.error('Error:', e));
```

Checklist:
- [ ] Request thành công (status 200)
- [ ] Response có user data
- [ ] Không có CORS error

```javascript
// Test Login
fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'consoletest',
    password: 'Test123!'
  })
})
.then(r => r.json())
.then(d => console.log('Login:', d))
.catch(e => console.error('Error:', e));
```

Checklist:
- [ ] Request thành công (status 200)
- [ ] Response có user data
- [ ] Không có CORS error

## 🔍 Kiểm tra Database

Mở SQL Server Management Studio:

```sql
USE ChemistryAngularDB;

-- Kiểm tra table Users tồn tại
SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Users';

-- Kiểm tra users đã tạo
SELECT Id, FullName, Username, Email, Role, CreatedAt FROM Users;
```

Checklist:
- [ ] Table `Users` tồn tại
- [ ] Có ít nhất 1 user trong table
- [ ] User có đầy đủ thông tin (FullName, Username, Email, etc.)
- [ ] PasswordHash không phải plain text

## 🐛 Troubleshooting

### Nếu Backend không chạy
- [ ] Kiểm tra .NET SDK: `dotnet --version`
- [ ] Kiểm tra SQL Server đang chạy
- [ ] Kiểm tra connection string
- [ ] Xem logs trong terminal

### Nếu Frontend không kết nối Backend
- [ ] Backend đang chạy ở port 5150
- [ ] Proxy config đúng
- [ ] Frontend chạy với proxy: `npm start`
- [ ] Không có CORS error trong console

### Nếu Register/Login lỗi
- [ ] Kiểm tra Network tab trong DevTools (F12)
- [ ] Xem request URL có đúng không
- [ ] Xem response status code
- [ ] Xem response body có error message
- [ ] Chạy test script: `.\test-auth-api.ps1`

## 💬 Kiểm tra Chatbox

### 1. Cấu hình Gemini API Key
Mở file `backend/ChemistryAPI/ChemistryAPI/.env`:
- [ ] `GEMINI_API_KEY` có giá trị thật (không phải "APICUATOI")
- [ ] Lấy API key tại: https://makersuite.google.com/app/apikey

### 2. Test Chatbox qua UI
1. Đăng nhập vào ứng dụng
2. Vào trang Chatbox
3. Gửi tin nhắn: "Xin chào"

Checklist:
- [ ] Chatbox hiển thị
- [ ] Gửi tin nhắn thành công
- [ ] Nhận được response từ AI
- [ ] Không có error trong console

### 3. Test Chat với Hình Ảnh
1. Click icon 📷 trong chatbox
2. Chọn một file hình ảnh
3. Gửi tin nhắn kèm hình

Checklist:
- [ ] Upload hình ảnh thành công
- [ ] Preview hình ảnh hiển thị
- [ ] Gửi thành công
- [ ] AI phản hồi về nội dung hình ảnh

### 4. Test Backend Chatbox API
```bash
# Test text chat
curl -X POST http://localhost:5150/api/chat/ask ^
  -H "Content-Type: application/json" ^
  -d "{\"question\":\"Hello\"}"
```

Checklist:
- [ ] Request thành công (status 200)
- [ ] Response có nội dung từ Gemini AI
- [ ] Không có error

## ✅ Kết luận

Nếu tất cả các mục trên đều ✅, authentication và chatbox đã hoạt động hoàn hảo!

### Các file hỗ trợ:
- [QUICK-START.md](QUICK-START.md) - Hướng dẫn khởi động
- [FIX-AUTH-GUIDE.md](FIX-AUTH-GUIDE.md) - Hướng dẫn fix lỗi authentication
- [FIX-CHATBOX-GUIDE.md](FIX-CHATBOX-GUIDE.md) - Hướng dẫn fix chatbox
- [AUTH-API-SUMMARY.md](AUTH-API-SUMMARY.md) - Tóm tắt fix chatbox

### Test scripts:
- `.\test-auth-api.ps1` - PowerShell test
- `node test-auth-api.js` - Node.js test
- `start-all.bat` - Chạy cả frontend và backend

---

**Ngày kiểm tra:** _______________

**Người kiểm tra:** _______________

**Kết quả:** [ ] PASS  [ ] FAIL

**Ghi chú:** _______________________________________________
