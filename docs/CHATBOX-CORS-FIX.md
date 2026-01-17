# 🚨 Fix CORS Error - Chatbox

## ❌ Vấn đề

**Gemini API không cho phép CORS từ browser!** Đây là hạn chế bảo mật của Google.

```
Access to fetch at 'https://generativelanguage.googleapis.com/...' 
from origin 'http://localhost:4200' has been blocked by CORS policy
```

## ✅ Giải pháp

**Quay lại dùng Backend Proxy** (như cũ) nhưng với backend đã fix.

### Đã sửa:
1. ✅ **ChatService** - Gọi backend thay vì Gemini API trực tiếp
2. ✅ **Backend API key** - Đã cấu hình đúng trong `.env`
3. ✅ **Backend model** - Đã sửa từ `gemini-2.5-flash` → `gemini-1.5-flash`
4. ✅ **Backend API version** - Đã sửa từ `v1beta` → `v1`

## 🚀 Cách sử dụng

### 1. Restart Backend:
```bash
cd backend/ChemistryAPI/ChemistryAPI
# Stop nếu đang chạy (Ctrl+C)
dotnet run
```

**Kiểm tra:** Thấy `Now listening on: http://localhost:5150`

### 2. Restart Frontend:
```bash
cd frontend/AngularChemistryWeb/AngularAtomic
# Stop nếu đang chạy (Ctrl+C)
npm start
```

### 3. Test Chatbox:
1. Đăng nhập vào ứng dụng
2. Vào trang Chatbox
3. Gửi tin nhắn: "Xin chào"

## 🔍 Debug

### Test Backend API:
```powershell
$body = @{ question = "Hello" } | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:5150/api/chat/ask" -Method Post -ContentType "application/json" -Body $body
```

**Kết quả mong đợi:** Response từ Gemini AI

### Kiểm tra Backend Console:
```
info: Microsoft.AspNetCore.Hosting.Diagnostics[1]
      Request starting HTTP/1.1 POST http://localhost:5150/api/chat/ask
```

### Kiểm tra Frontend Console:
```
🚀 ChatService: Starting chat with AI via backend
💬 ChatService: Calling backend with text only
✅ ChatService: Got response from backend
💾 ChatService: Saved to database
```

## 📊 Luồng hoạt động

```
User gửi tin nhắn
    ↓
Frontend → Backend (/api/chat/ask)
    ↓
Backend → Gemini API (với API key)
    ↓
Gemini API → Backend (response)
    ↓
Backend → Frontend (response)
    ↓
Frontend → Backend (/api/chathistory) - Lưu lịch sử
    ↓
Hiển thị cho user
```

## 🔐 Bảo mật

✅ **API key an toàn** - Chỉ ở backend, không lộ ra frontend
✅ **Không CORS** - Backend proxy giải quyết vấn đề CORS
✅ **Rate limiting** - Backend có thể control rate limiting

## 🐛 Troubleshooting

### 1. "Không thể kết nối đến server"
**Fix:** Restart backend, kiểm tra port 5150

### 2. "Lỗi server 500"
**Fix:** Kiểm tra backend console log, có thể là API key hoặc model sai

### 3. "CORS error"
**Fix:** Đã fix bằng cách dùng backend proxy

## 🎉 Kết luận

Chatbox giờ hoạt động qua backend proxy, tránh được CORS error và bảo mật API key.

**Restart cả backend và frontend để test!** 🚀