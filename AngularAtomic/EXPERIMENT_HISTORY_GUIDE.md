# 📊 Hướng Dẫn Sử Dụng Trang Lịch Sử Thí Nghiệm

## Tổng Quan

Trang **Lịch Sử Thí Nghiệm** cho phép bạn xem và quản lý tất cả các thí nghiệm đã được lưu trong database, bao gồm:

- ✅ Các thí nghiệm tự tạo
- ✅ Kết quả mô phỏng đã chạy
- ✅ Thống kê hiệu suất
- ✅ Xuất dữ liệu
- ✅ Quản lý thí nghiệm

## Cách Truy Cập

### 1. Từ Navbar
- Đăng nhập vào tài khoản
- Click vào **"Lịch sử thí nghiệm"** trên thanh điều hướng
- Hoặc **"Lịch sử"** trên mobile

### 2. Từ Trang Mô Phỏng
- Vào trang **Thí nghiệm mô phỏng**
- Click nút **"📊 Xem lịch sử thí nghiệm"** ở góc phải trên

### 3. URL Trực Tiếp
```
/experiment-history
```

## Tính Năng Chính

### 📈 Thống Kê Tổng Quan
- **Tổng thí nghiệm**: Số lượng thí nghiệm đã tạo
- **Tổng lần chạy**: Số lần đã thực hiện mô phỏng
- **Hiệu suất trung bình**: Hiệu suất trung bình của tất cả thí nghiệm

### 🔍 Bộ Lọc & Tìm Kiếm
- **Tìm kiếm**: Tìm theo tên hoặc mô tả thí nghiệm
- **Cấp học**: Lọc theo THCS, THPT, Đại học
- **Loại thí nghiệm**: Lọc theo loại (acid-base, đốt cháy, v.v.)
- **Sắp xếp**: Theo ngày tạo, hiệu suất, số lần chạy
- **Thứ tự**: Tăng dần hoặc giảm dần

### 📋 Danh Sách Thí Nghiệm
Mỗi thí nghiệm hiển thị:
- **Tên và mô tả** thí nghiệm
- **Cấp học** và **loại thí nghiệm**
- **Hiệu suất trung bình** với màu sắc phân loại:
  - 🟢 Xanh lá: ≥90% (Xuất sắc)
  - 🔵 Xanh dương: 70-89% (Tốt)
  - 🟡 Vàng: 50-69% (Trung bình)
  - 🔴 Đỏ: <50% (Cần cải thiện)
- **Số lần chạy** thí nghiệm
- **Hiệu suất tốt nhất** đạt được
- **Thời gian chạy cuối cùng**

### 📊 Chi Tiết Thí Nghiệm
Khi click vào một thí nghiệm, bạn sẽ thấy:

#### Thông Tin Cơ Bản
- Tên và mô tả chi tiết
- Cấp học và loại thí nghiệm
- Ngày tạo và cập nhật cuối
- Tags (nếu có)

#### Phương Trình & Hiện Tượng
- **Phương trình phản ứng**: Các phương trình hóa học
- **Hiện tượng quan sát**: Các hiện tượng có thể quan sát được

#### Kết Quả Mô Phỏng
- Danh sách tất cả lần chạy thí nghiệm
- Thời gian chạy và hiệu suất từng lần
- Ngày thực hiện mô phỏng

### 🔍 Chi Tiết Kết Quả
Khi click vào một kết quả cụ thể:
- **Thông số đầu vào**: Nhiệt độ, nồng độ, thể tích, thời gian
- **Kết quả đầu ra**: pH, thể tích khí, khối lượng, hiệu suất
- **Thời gian thực hiện**: Ngày giờ chạy thí nghiệm

## Thao Tác Quản Lý

### 📥 Xuất Dữ Liệu
- Click biểu tượng **📥** bên cạnh thí nghiệm
- Tải file JSON chứa:
  - Thông tin thí nghiệm
  - Tất cả kết quả mô phỏng
  - Thống kê tổng hợp

### 🗑️ Xóa Thí Nghiệm
- Click biểu tượng **🗑️** bên cạnh thí nghiệm
- Xác nhận xóa (sẽ xóa cả tất cả kết quả liên quan)
- **Lưu ý**: Chỉ xóa được thí nghiệm tự tạo

### 🔄 Làm Mới Dữ Liệu
- Click nút **"🔄 Làm mới"** ở góc phải trên
- Tải lại dữ liệu mới nhất từ database

## Dữ Liệu Được Lưu

### Khi Tạo Thí Nghiệm Mới
Hệ thống tự động lưu:
- Thông tin thí nghiệm (tên, mô tả, cấp học)
- Thông số mô phỏng (nhiệt độ, nồng độ, v.v.)
- Phương trình phản ứng
- Hiện tượng quan sát

### Khi Chạy Mô Phỏng
Hệ thống tự động lưu:
- Thông số đầu vào đã sử dụng
- Kết quả thu được (pH, hiệu suất, v.v.)
- Thời gian chạy thí nghiệm
- Thời điểm thực hiện

## Trạng Thái Kết Nối

### 🟢 Database Connected
- Tất cả dữ liệu được đồng bộ với database
- Có thể xem lịch sử đầy đủ
- Dữ liệu được lưu vĩnh viễn

### 🟡 Offline Mode
- Chỉ hiển thị dữ liệu trong phiên làm việc hiện tại
- Không thể tải lịch sử từ database
- Dữ liệu sẽ mất khi tải lại trang

## Mẹo Sử Dụng

### 1. Theo Dõi Hiệu Suất
- Sử dụng bộ lọc "Sắp xếp theo hiệu suất" để tìm thí nghiệm tốt nhất
- So sánh hiệu suất giữa các lần chạy để tối ưu thông số

### 2. Quản Lý Thí Nghiệm
- Đặt tên thí nghiệm có ý nghĩa để dễ tìm kiếm
- Sử dụng tags để phân loại thí nghiệm
- Xuất dữ liệu định kỳ để backup

### 3. Phân Tích Kết Quả
- Xem chi tiết từng lần chạy để hiểu xu hướng
- So sánh thông số đầu vào với kết quả đầu ra
- Sử dụng dữ liệu để cải thiện thí nghiệm

## Khắc Phục Sự Cố

### Không Thấy Dữ Liệu
1. Kiểm tra trạng thái kết nối database
2. Đảm bảo đã đăng nhập đúng tài khoản
3. Click "Làm mới" để tải lại dữ liệu

### Dữ Liệu Không Đầy Đủ
1. Kiểm tra xem thí nghiệm đã được chạy hoàn thành chưa
2. Đảm bảo kết nối database ổn định khi chạy thí nghiệm
3. Thử chạy lại thí nghiệm nếu cần

### Lỗi Xuất Dữ Liệu
1. Kiểm tra trình duyệt có cho phép tải file không
2. Thử với trình duyệt khác
3. Đảm bảo có đủ dung lượng lưu trữ

## Bảo Mật & Quyền Riêng Tư

- ✅ Chỉ bạn mới có thể xem thí nghiệm của mình
- ✅ Dữ liệu được mã hóa khi truyền tải
- ✅ Có thể xóa dữ liệu bất kỳ lúc nào
- ✅ Không chia sẻ dữ liệu với bên thứ ba

---

**Lưu ý**: Trang này chỉ hiển thị cho người dùng đã đăng nhập. Hãy đăng nhập để truy cập đầy đủ tính năng!