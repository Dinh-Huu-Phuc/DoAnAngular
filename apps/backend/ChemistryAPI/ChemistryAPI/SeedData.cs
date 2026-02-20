using ChemistryAPI.Data;
using ChemistryAPI.Models;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using System.Security.Cryptography;
using System.Text;

namespace ChemistryAPI;

public static class SeedData
{
    public static async Task SeedAdminUserAsync(ChemistryDbContext context)
    {
        // Read admin credentials from environment variables
        var adminEmail = Environment.GetEnvironmentVariable("ADMIN_EMAIL");
        var adminUsername = Environment.GetEnvironmentVariable("ADMIN_USERNAME");
        var adminPassword = Environment.GetEnvironmentVariable("ADMIN_PASSWORD");
        var adminFullName = Environment.GetEnvironmentVariable("ADMIN_FULLNAME");

        if (string.IsNullOrEmpty(adminEmail) || string.IsNullOrEmpty(adminPassword))
        {
            Console.WriteLine("Admin credentials not found in environment variables. Skipping admin seed.");
            return;
        }

        // Check if admin already exists
        if (await context.Users.AnyAsync(u => u.Email == adminEmail))
        {
            Console.WriteLine($"Admin user '{adminEmail}' already exists. Skipping seed.");
            return;
        }

        var adminUser = new User
        {
            FullName = adminFullName ?? "Admin",
            Username = adminUsername ?? "admin",
            Email = adminEmail,
            PhoneNumber = "",
            PasswordHash = HashPassword(adminPassword),
            Role = "Admin",
            CreatedAt = DateTime.UtcNow
        };

        context.Users.Add(adminUser);
        await context.SaveChangesAsync();

        Console.WriteLine($"Successfully seeded admin user '{adminEmail}'");
    }

    private static string HashPassword(string password)
    {
        using var sha256 = SHA256.Create();
        var bytes = Encoding.UTF8.GetBytes(password);
        var hashBytes = sha256.ComputeHash(bytes);
        return Convert.ToHexString(hashBytes);
    }

    public static async Task SeedCoursesAsync(ChemistryDbContext context)
    {
        // Check if course already exists
        if (await context.Courses.AnyAsync(c => c.CourseId == "chemistry-basics-level-0"))
        {
            Console.WriteLine("Course 'chemistry-basics-level-0' already exists. Skipping seed.");
            return;
        }

        var course = new Course
        {
            CourseId = "chemistry-basics-level-0",
            Title = "Hóa học cơ bản - Level 0",
            Description = "Khóa học làm quen với hóa học cơ bản dành cho người mới bắt đầu. Tìm hiểu về nguyên tử, phân tử, bảng tuần hoàn và các khái niệm nền tảng của hóa học.",
            Order = 1,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        // Lesson 1: Giới thiệu về Hóa học
        var lesson1 = new CourseLesson
        {
            LessonNumber = 1,
            Title = "Giới thiệu về Hóa học",
            Type = "content",
            Content = @"# Giới thiệu về Hóa học

## Hóa học là gì?

Hóa học là khoa học nghiên cứu về **cấu trúc, tính chất và sự biến đổi của vật chất**. Hóa học giúp chúng ta hiểu được thế giới xung quanh, từ không khí chúng ta hít thở, nước chúng ta uống, đến thức ăn chúng ta ăn.

## Tại sao học Hóa học?

Hóa học có mặt ở khắp mọi nơi trong cuộc sống hàng ngày:

- **Nấu ăn**: Các phản ứng hóa học xảy ra khi bạn nấu thức ăn
- **Y học**: Thuốc men được tạo ra nhờ hiểu biết về hóa học
- **Môi trường**: Hóa học giúp chúng ta bảo vệ môi trường
- **Công nghệ**: Pin, máy tính, điện thoại đều dựa trên các nguyên lý hóa học

## Ba trạng thái của vật chất

Vật chất tồn tại ở ba trạng thái chính:

1. **Rắn**: Có hình dạng và thể tích xác định (ví dụ: đá, gỗ)
2. **Lỏng**: Có thể tích xác định nhưng hình dạng thay đổi (ví dụ: nước, dầu)
3. **Khí**: Không có hình dạng và thể tích xác định (ví dụ: không khí, hơi nước)

## Kết luận

Hóa học là một môn khoa học thú vị và hữu ích. Trong các bài học tiếp theo, chúng ta sẽ tìm hiểu sâu hơn về nguyên tử, phân tử và bảng tuần hoàn các nguyên tố hóa học.",
            Order = 1
        };

        // Lesson 2: Nguyên tử và Phân tử
        var lesson2 = new CourseLesson
        {
            LessonNumber = 2,
            Title = "Nguyên tử và Phân tử",
            Type = "content",
            Content = @"# Nguyên tử và Phân tử

## Nguyên tử là gì?

**Nguyên tử** là đơn vị cơ bản nhỏ nhất của vật chất. Mọi thứ xung quanh chúng ta đều được tạo thành từ nguyên tử.

### Cấu trúc của nguyên tử

Nguyên tử gồm ba loại hạt cơ bản:

1. **Proton** (+): Mang điện tích dương, nằm trong hạt nhân
2. **Neutron** (0): Không mang điện, nằm trong hạt nhân
3. **Electron** (-): Mang điện tích âm, chuyển động xung quanh hạt nhân

### Số hiệu nguyên tử

**Số hiệu nguyên tử** là số proton trong hạt nhân của một nguyên tử. Mỗi nguyên tố hóa học có một số hiệu nguyên tử riêng biệt.

Ví dụ:
- Hydro (H): Số hiệu nguyên tử = 1 (1 proton)
- Carbon (C): Số hiệu nguyên tử = 6 (6 proton)
- Oxygen (O): Số hiệu nguyên tử = 8 (8 proton)

## Phân tử là gì?

**Phân tử** là nhóm hai hoặc nhiều nguyên tử liên kết với nhau. Phân tử là đơn vị nhỏ nhất của một hợp chất hóa học.

### Ví dụ về phân tử

- **H₂O** (Nước): 2 nguyên tử Hydro + 1 nguyên tử Oxygen
- **CO₂** (Carbon dioxide): 1 nguyên tử Carbon + 2 nguyên tử Oxygen
- **O₂** (Oxygen): 2 nguyên tử Oxygen

## Nguyên tố và Hợp chất

- **Nguyên tố**: Chất được tạo thành từ một loại nguyên tử (ví dụ: O₂, H₂)
- **Hợp chất**: Chất được tạo thành từ hai hoặc nhiều loại nguyên tử khác nhau (ví dụ: H₂O, CO₂)

## Kết luận

Nguyên tử và phân tử là những khái niệm nền tảng trong hóa học. Hiểu được cấu trúc của chúng giúp chúng ta hiểu được cách các chất tương tác và biến đổi.",
            Order = 2
        };

        // Lesson 3: Bảng tuần hoàn
        var lesson3 = new CourseLesson
        {
            LessonNumber = 3,
            Title = "Bảng tuần hoàn",
            Type = "content",
            Content = @"# Bảng tuần hoàn các nguyên tố hóa học

## Bảng tuần hoàn là gì?

**Bảng tuần hoàn** là cách sắp xếp tất cả các nguyên tố hóa học theo **số hiệu nguyên tử tăng dần**. Bảng tuần hoàn được phát minh bởi nhà hóa học người Nga Dmitri Mendeleev vào năm 1869.

## Cấu trúc của Bảng tuần hoàn

### Chu kỳ (Hàng ngang)

Mỗi **chu kỳ** là một hàng ngang trong bảng tuần hoàn. Các nguyên tố trong cùng một chu kỳ có cùng số lớp electron.

- Chu kỳ 1: H, He (2 nguyên tố)
- Chu kỳ 2: Li, Be, B, C, N, O, F, Ne (8 nguyên tố)
- Chu kỳ 3: Na, Mg, Al, Si, P, S, Cl, Ar (8 nguyên tố)

### Nhóm (Cột dọc)

Mỗi **nhóm** là một cột dọc trong bảng tuần hoàn. Các nguyên tố trong cùng một nhóm có tính chất hóa học tương tự nhau.

Ví dụ:
- **Nhóm 1** (Kim loại kiềm): Li, Na, K, Rb, Cs, Fr
- **Nhóm 17** (Halogen): F, Cl, Br, I, At
- **Nhóm 18** (Khí hiếm): He, Ne, Ar, Kr, Xe, Rn

## Các loại nguyên tố

Bảng tuần hoàn chia nguyên tố thành ba loại chính:

1. **Kim loại**: Dẫn điện, dẫn nhiệt tốt, có ánh kim (ví dụ: Fe, Cu, Au)
2. **Phi kim**: Không dẫn điện, không có ánh kim (ví dụ: C, N, O)
3. **Á kim**: Có tính chất trung gian giữa kim loại và phi kim (ví dụ: Si, Ge)

## Thông tin trên Bảng tuần hoàn

Mỗi ô trong bảng tuần hoàn thường hiển thị:

- **Ký hiệu hóa học**: Ví dụ H, C, O
- **Số hiệu nguyên tử**: Số proton trong hạt nhân
- **Tên nguyên tố**: Ví dụ Hydro, Carbon, Oxygen
- **Khối lượng nguyên tử**: Khối lượng trung bình của nguyên tử

## Tại sao Bảng tuần hoàn quan trọng?

Bảng tuần hoàn giúp:

- Dự đoán tính chất của các nguyên tố
- Hiểu được mối quan hệ giữa các nguyên tố
- Tìm kiếm và nghiên cứu các nguyên tố mới
- Ứng dụng trong nghiên cứu và công nghiệp

## Kết luận

Bảng tuần hoàn là một trong những công cụ quan trọng nhất trong hóa học. Nó tổ chức tất cả các nguyên tố một cách có hệ thống và giúp chúng ta hiểu được thế giới vi mô của vật chất.",
            Order = 3
        };

        // Lesson 4: Quiz
        var lesson4 = new CourseLesson
        {
            LessonNumber = 4,
            Title = "Kiểm tra kiến thức",
            Type = "quiz",
            Order = 4
        };

        // Quiz questions
        var question1 = new LessonQuizQuestion
        {
            QuestionNumber = 1,
            Question = "Hóa học là khoa học nghiên cứu về điều gì?",
            Options = JsonSerializer.Serialize(new List<string>
            {
                "Nghiên cứu về sinh vật sống",
                "Nghiên cứu về cấu trúc, tính chất và sự biến đổi của vật chất",
                "Nghiên cứu về vũ trụ và các hành tinh",
                "Nghiên cứu về con người và xã hội"
            }),
            CorrectAnswer = 1,
            Explanation = "Hóa học là khoa học nghiên cứu về cấu trúc, tính chất và sự biến đổi của vật chất. Đây là định nghĩa cơ bản và quan trọng nhất của hóa học.",
            Order = 1
        };

        var question2 = new LessonQuizQuestion
        {
            QuestionNumber = 2,
            Question = "Đơn vị cơ bản nhỏ nhất của vật chất là gì?",
            Options = JsonSerializer.Serialize(new List<string>
            {
                "Phân tử",
                "Nguyên tử",
                "Electron",
                "Proton"
            }),
            CorrectAnswer = 1,
            Explanation = "Nguyên tử là đơn vị cơ bản nhỏ nhất của vật chất. Mọi thứ xung quanh chúng ta đều được tạo thành từ nguyên tử. Phân tử là nhóm các nguyên tử liên kết với nhau.",
            Order = 2
        };

        var question3 = new LessonQuizQuestion
        {
            QuestionNumber = 3,
            Question = "Bảng tuần hoàn sắp xếp các nguyên tố theo tiêu chí nào?",
            Options = JsonSerializer.Serialize(new List<string>
            {
                "Theo khối lượng nguyên tử giảm dần",
                "Theo tên nguyên tố theo thứ tự bảng chữ cái",
                "Theo số hiệu nguyên tử tăng dần",
                "Theo màu sắc của nguyên tố"
            }),
            CorrectAnswer = 2,
            Explanation = "Bảng tuần hoàn sắp xếp các nguyên tố theo số hiệu nguyên tử tăng dần. Số hiệu nguyên tử là số proton trong hạt nhân của nguyên tử, và đây là đặc trưng duy nhất của mỗi nguyên tố.",
            Order = 3
        };

        lesson4.QuizQuestions.Add(question1);
        lesson4.QuizQuestions.Add(question2);
        lesson4.QuizQuestions.Add(question3);

        course.Lessons.Add(lesson1);
        course.Lessons.Add(lesson2);
        course.Lessons.Add(lesson3);
        course.Lessons.Add(lesson4);

        context.Courses.Add(course);
        await context.SaveChangesAsync();

        Console.WriteLine("Successfully seeded course 'chemistry-basics-level-0'");
    }
}
