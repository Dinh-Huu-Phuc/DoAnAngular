# 🚀 Chatbox Direct API - Hướng Dẫn

## 🎯 Thay Đổi

**Trước:** Frontend → Backend → Gemini API → Backend → Frontend
**Sau:** Frontend → Gemini API trực tiếp + Backend (chỉ lưu lịch sử)

## ✅ Đã Tạo/Sửa

### Frontend Files:
1. **`.env`** - Chứa Gemini API key
2. **`environment.ts`** - Thêm Gemini API config
3. **`gemini.service.ts`** - Service gọi Gemini API trực tiếp
4. **`chat-history.service.ts`** - Service lưu lịch sử chat
5. **`chat.service.ts`** - Cập nhật để dùng GeminiService

### Backend Files:
1. **`ChatHistoryController.cs`** - API endpoints cho lịch sử chat
2. **`CreateChatHistoryDto.cs`** - DTO cho tạo lịch sử chat
3. **`ChatHistory.cs`** - Sửa model (ConversationId nullable)

## 🔧 Cách Hoạt Động

### 1. Chat Flow:
```
User gửi tin nhắn
    ↓
Frontend gọi ChatService.chatWithAI()
    ↓
ChatService gọi GeminiService (trực tiếp)
    ↓
Gemini API trả response
    ↓
ChatService lưu vào DB qua ChatHistoryService
    ↓
Hiển thị response cho user
```

### 2. API Endpoints:

**Frontend → Gemini API:**
```
POST https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=API_KEY
```

**Frontend → Backend (lưu lịch sử):**
```
POST /api/chathistory
GET /api/chathistory/user/{userId}
GET /api/chathistory/user/{userId}/conversation/{conversationId}
DELETE /api/chathistory/{id}
```

## 🚀 Cách Sử Dụng

### 1. Khởi động Backend:
```bash
cd backend/ChemistryAPI/ChemistryAPI
dotnet run
```

### 2. Khởi động Frontend:
```bash
cd frontend/AngularChemistryWeb/AngularAtomic
npm start
```

### 3. Test Chatbox:
1. Đăng nhập vào ứng dụng
2. Vào trang Chatbox
3. Gửi tin nhắn: "Xin chào"
4. Test với hình ảnh (click icon 📷)

## 🔍 Debug

### Frontend Console:
```
🚀 ChatService: Starting chat with AI
💬 ChatService: Calling Gemini API with text only
✅ ChatService: Got response from Gemini API
💾 ChatService: Saved to database
```

### Backend Console:
```
POST /api/chathistory - 201 Created
```

### Network Tab (F12):
- **Gemini API call:** `generativelanguage.googleapis.com`
- **Save history call:** `localhost:5150/api/chathistory`

## 📊 Ưu Điểm

### ✅ Pros:
- **Nhanh hơn:** Không qua backend proxy
- **Ít lỗi:** Không phụ thuộc backend cho AI response
- **Bảo mật:** API key ở frontend environment (không expose)
- **Đơn giản:** Backend chỉ lo lưu lịch sử

### ⚠️ Lưu Ý:
- **API key trong frontend:** Có thể xem được qua DevTools
- **CORS:** Gemini API phải cho phép CORS từ localhost:4200
- **Rate limiting:** Gemini API có giới hạn request/phút

## 🔐 Bảo Mật API Key

### Development:
- API key trong `environment.ts` (OK cho dev)
- Không commit API key lên Git

### Production:
- Dùng environment variables
- Build time injection
- Hoặc proxy qua backend (như cũ)

## 🐛 Troubleshooting

### 1. "CORS error"
**Nguyên nhân:** Gemini API không cho phép CORS từ localhost
**Fix:** Gemini API mặc định cho phép CORS, kiểm tra API key

### 2. "API key invalid"
**Nguyên nhân:** API key sai hoặc hết hạn
**Fix:** Tạo API key mới tại https://makersuite.google.com/app/apikey

### 3. "Failed to save to database"
**Nguyên nhân:** Backend không chạy hoặc DB lỗi
**Fix:** Kiểm tra backend console, vẫn nhận được AI response

### 4. "Model not found"
**Nguyên nhân:** Model name sai
**Fix:** Dùng `gemini-1.5-flash` (stable)

## 📝 Files Structure

```
frontend/
├── .env (API key)
├── src/environments/environment.ts (config)
├── src/app/services/
│   ├── gemini.service.ts (gọi Gemini API)
│   ├── chat-history.service.ts (lưu lịch sử)
│   └── chat.service.ts (orchestrator)

backend/
├── Controllers/ChatHistoryController.cs
├── DTOs/CreateChatHistoryDto.cs
└── Models/ChatHistory.cs (updated)
```

## 🎉 Kết Luận

Chatbox giờ gọi Gemini API trực tiếp từ frontend, nhanh hơn và ít lỗi hơn. Backend chỉ lo lưu lịch sử chat vào database.

**Test ngay:** Restart cả frontend và backend, rồi thử gửi tin nhắn! 🚀