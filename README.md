# 🧪 Hóa Học 3D - Interactive Chemistry Learning Platform

<div align="center">

![Chemistry 3D](https://img.shields.io/badge/Chemistry-3D-blue?style=for-the-badge)
![Angular](https://img.shields.io/badge/Angular-21.0-red?style=for-the-badge&logo=angular)
![.NET](https://img.shields.io/badge/.NET-10.0-purple?style=for-the-badge&logo=dotnet)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

**Nền tảng học tập Hóa học tương tác với mô hình phân tử 3D**

[Demo](#) • [Tài liệu](#) • [Báo lỗi](https://github.com/DINH-Huu-Phuc/issues)

</div>

---

## 📖 Giới thiệu

**Hóa học 3D** là nền tảng học tập tương tác giúp bạn khám phá thế giới Hóa học một cách trực quan và sinh động nhất. Với công nghệ mô hình phân tử 3D, bạn có thể xoay, phóng to và quan sát chi tiết cấu trúc các phân tử, giúp việc học trở nên dễ hiểu và ghi nhớ lâu hơn.

### ✨ Tính năng chính

- 🎓 **Học bài theo chủ đề** - Nội dung được tổ chức khoa học theo từng chủ đề
- 📝 **Bài tập & Quiz** - Hệ thống tự động chấm điểm và phản hồi ngay lập tức
- 📊 **Theo dõi tiến độ** - Quản lý quá trình học tập cá nhân
- ⚖️ **Cân bằng phương trình** - Công cụ tự động cân bằng phương trình hóa học
- 🧪 **Thí nghiệm mô phỏng** - Thực hành an toàn với các thí nghiệm ảo
- 🔬 **Bảng tuần hoàn tương tác** - Khám phá các nguyên tố hóa học
- 🤖 **Trợ lý AI** - Chatbot thông minh hỗ trợ giải đáp 24/7
- 🔐 **Xác thực người dùng** - Hệ thống đăng nhập/đăng ký an toàn
- 📜 **Lịch sử thí nghiệm** - Lưu trữ và xem lại các kết quả đã thực hiện

---

## 🏗️ Kiến trúc hệ thống

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend                              │
│  Angular 21 + Tailwind CSS + Three.js + Lucide Icons       │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTP/REST API
┌──────────────────────▼──────────────────────────────────────┐
│                        Backend                               │
│         ASP.NET Core 10.0 Web API + Entity Framework        │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                      Database                                │
│                   SQL Server 2022                            │
└─────────────────────────────────────────────────────────────┘
```

### 🛠️ Công nghệ sử dụng

#### Frontend
- **Framework**: Angular 21.0.3
- **Styling**: Tailwind CSS
- **3D Graphics**: Three.js
- **Icons**: Lucide Angular
- **State Management**: Angular Signals
- **HTTP Client**: Angular HttpClient
- **Testing**: Vitest

#### Backend
- **Framework**: ASP.NET Core 10.0
- **ORM**: Entity Framework Core
- **Authentication**: JWT Bearer Token
- **Database**: SQL Server 2022
- **API Documentation**: Swagger/OpenAPI

---

## 🚀 Cài đặt và chạy dự án

### Yêu cầu hệ thống

- **Node.js**: >= 18.x
- **npm**: >= 9.x
- **.NET SDK**: >= 10.0
- **SQL Server**: >= 2019
- **Angular CLI**: >= 21.0

### 1️⃣ Clone repository

```bash
git clone https://github.com/DINH-Huu-Phuc/chemistry-3d.git
cd chemistry-3d
```

### 2️⃣ Cài đặt Frontend

```bash
cd apps/frontend/AngularChemistryWeb/AngularAtomic
npm install
```

### 3️⃣ Cài đặt Backend

```bash
cd apps/backend/ChemistryAPI/ChemistryAPI
dotnet restore
```

### 4️⃣ Cấu hình Database

1. Tạo database trong SQL Server:
```sql
CREATE DATABASE ChemistryDB;
```

2. Cập nhật connection string trong `appsettings.json`:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=ChemistryDB;Trusted_Connection=True;TrustServerCertificate=True"
  }
}
```

3. Chạy migrations:
```bash
dotnet ef database update
```

### 5️⃣ Chạy ứng dụng

#### Chạy Backend (Terminal 1)
```bash
cd apps/backend/ChemistryAPI/ChemistryAPI
dotnet run
```
Backend sẽ chạy tại: `https://localhost:7001`

#### Chạy Frontend (Terminal 2)
```bash
cd apps/frontend/AngularChemistryWeb/AngularAtomic
ng serve
```
Frontend sẽ chạy tại: `http://localhost:4200`

---

## 📁 Cấu trúc thư mục

```
chemistry-3d/
├── apps/
│   ├── frontend/
│   │   └── AngularChemistryWeb/
│   │       └── AngularAtomic/          # Angular application
│   │           ├── src/
│   │           │   ├── app/
│   │           │   │   ├── components/ # Reusable components
│   │           │   │   ├── pages/      # Page components
│   │           │   │   ├── services/   # Services
│   │           │   │   ├── guards/     # Route guards
│   │           │   │   └── models/     # TypeScript models
│   │           │   └── assets/         # Static assets
│   │           └── package.json
│   │
│   └── backend/
│       └── ChemistryAPI/
│           └── ChemistryAPI/           # ASP.NET Core API
│               ├── Controllers/        # API Controllers
│               ├── Models/             # Entity models
│               ├── Services/           # Business logic
│               ├── Data/               # DbContext
│               ├── DTOs/               # Data transfer objects
│               └── Migrations/         # EF migrations
│
└── README.md
```

---

## 🎯 Tính năng chi tiết

### 🏠 Trang chủ
- Giới thiệu tổng quan về nền tảng
- Hiển thị các tính năng nổi bật
- Điều hướng nhanh đến các module

### 📚 Học tập
- Danh sách khóa học theo chủ đề
- Nội dung bài học với markdown và LaTeX
- Bài tập tự luyện với feedback tức thì
- Quiz đánh giá kiến thức

### 🧪 Thí nghiệm mô phỏng
- Mô phỏng các phản ứng hóa học
- Điều chỉnh thông số (nhiệt độ, nồng độ, thể tích)
- Quan sát kết quả trực quan
- Lưu lịch sử thí nghiệm

### 🔬 Bảng tuần hoàn
- Hiển thị đầy đủ 118 nguyên tố
- Thông tin chi tiết từng nguyên tố
- Mô hình 3D cấu trúc nguyên tử
- Tìm kiếm và lọc nguyên tố

### ⚖️ Cân bằng phương trình
- Nhập phương trình hóa học
- Tự động cân bằng hệ số
- Hiển thị các bước giải
- Lưu lịch sử phương trình

### 💬 Chatbot AI
- Hỗ trợ giải đáp thắc mắc
- Render công thức hóa học (LaTeX)
- Giới hạn 10 câu hỏi/60 phút
- Lưu lịch sử hội thoại

### 👤 Quản lý tài khoản
- Đăng ký/Đăng nhập
- Xác thực JWT
- Theo dõi tiến độ học tập
- Quản lý lịch sử thí nghiệm

---

## 🧪 Testing

### Frontend Testing
```bash
cd apps/frontend/AngularChemistryWeb/AngularAtomic
npm test
```

### Backend Testing
```bash
cd apps/backend/ChemistryAPI/ChemistryAPI
dotnet test
```

---

## 📦 Build Production

### Build Frontend
```bash
cd apps/frontend/AngularChemistryWeb/AngularAtomic
ng build --configuration production
```

### Build Backend
```bash
cd apps/backend/ChemistryAPI/ChemistryAPI
dotnet publish -c Release
```

---

## 🤝 Đóng góp

Chúng tôi luôn chào đón mọi đóng góp! Nếu bạn muốn đóng góp:

1. Fork repository
2. Tạo branch mới (`git checkout -b feature/AmazingFeature`)
3. Commit thay đổi (`git commit -m 'Add some AmazingFeature'`)
4. Push lên branch (`git push origin feature/AmazingFeature`)
5. Tạo Pull Request

---

## 📝 License

Dự án này được phân phối dưới giấy phép MIT. Xem file `LICENSE` để biết thêm chi tiết.

---

## 👨‍💻 Tác giả

**Đinh Hữu Phúc**

- Facebook: [@A.I.2302](https://web.facebook.com/A.I.2302)
- GitHub: [@DINH-Huu-Phuc](https://github.com/DINH-Huu-Phuc)

---

## 🙏 Lời cảm ơn

- Angular Team
- ASP.NET Core Team
- Three.js Community
- Tailwind CSS Team
- Lucide Icons

---

<div align="center">

**⭐ Nếu bạn thấy dự án hữu ích, hãy cho chúng tôi một star! ⭐**

Made with ❤️ by Đinh Hữu Phúc

</div>
