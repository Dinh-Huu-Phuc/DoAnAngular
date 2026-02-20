# Requirements Document

## Introduction

Hệ thống Learning System Level 0 hiện tại đang sử dụng JSON files tĩnh để lưu trữ dữ liệu khóa học. Tính năng này sẽ chuyển đổi hệ thống sang kiến trúc client-server, cho phép lấy dữ liệu từ backend API và đồng bộ tiến độ học tập lên server. Điều này tạo nền tảng cho các tính năng nâng cao như đồng bộ đa thiết bị, phân tích học tập, và quản lý nội dung động.

## Glossary

- **Learning_System**: Hệ thống học tập trực tuyến cho phép người dùng học các khóa học và theo dõi tiến độ
- **Backend_API**: RESTful API được xây dựng bằng C# .NET để cung cấp dữ liệu và quản lý tiến độ học tập
- **Frontend**: Ứng dụng Angular hiện có đang sử dụng JSON files tĩnh
- **CourseDataService**: Service Angular chịu trách nhiệm tải dữ liệu khóa học
- **ProgressService**: Service Angular quản lý tiến độ học tập của người dùng
- **LocalStorage**: Bộ nhớ trình duyệt để lưu trữ dữ liệu cục bộ
- **Authenticated_User**: Người dùng đã đăng nhập vào hệ thống
- **Anonymous_User**: Người dùng chưa đăng nhập, sử dụng LocalStorage để lưu tiến độ
- **Offline_Mode**: Chế độ hoạt động khi không có kết nối mạng hoặc API không khả dụng
- **Progress_Sync**: Quá trình đồng bộ tiến độ học tập giữa LocalStorage và server

## Requirements

### Requirement 1: Backend API Endpoints

**User Story:** Là một developer, tôi muốn có các API endpoints để quản lý dữ liệu khóa học và tiến độ, để Frontend có thể tương tác với backend.

#### Acceptance Criteria

1. THE Backend_API SHALL provide a GET endpoint at /api/lessons that returns all lessons
2. THE Backend_API SHALL provide a GET endpoint at /api/lessons/{id} that returns a specific lesson by ID
3. WHEN a lesson ID does not exist, THE Backend_API SHALL return HTTP 404 status code
4. THE Backend_API SHALL provide a POST endpoint at /api/progress that accepts progress data
5. THE Backend_API SHALL provide a GET endpoint at /api/progress/{userId} that returns user progress
6. WHEN an unauthenticated request is made to progress endpoints, THE Backend_API SHALL return HTTP 401 status code
7. THE Backend_API SHALL validate all incoming request data and return HTTP 400 for invalid data
8. THE Backend_API SHALL return responses in JSON format with appropriate Content-Type headers

### Requirement 2: Database Schema

**User Story:** Là một system architect, tôi muốn có database schema rõ ràng để lưu trữ dữ liệu khóa học và tiến độ, để đảm bảo tính toàn vẹn dữ liệu.

#### Acceptance Criteria

1. THE Backend_API SHALL use a Lessons table with columns: id, title, type, content, order
2. THE Backend_API SHALL enforce that lesson type must be either 'content' or 'quiz'
3. THE Backend_API SHALL use a QuizQuestions table with columns: id, lessonId, question, options, correctAnswer, explanation
4. THE Backend_API SHALL store quiz options as JSON array in the options column
5. THE Backend_API SHALL use a LearningProgress table with columns: id, userId, lessonId, status, completedAt
6. THE Backend_API SHALL enforce foreign key constraints between tables
7. THE Backend_API SHALL enforce that progress status must be 'not-started', 'in-progress', or 'completed'
8. THE Backend_API SHALL create appropriate indexes on frequently queried columns

### Requirement 3: Frontend API Integration

**User Story:** Là một user, tôi muốn ứng dụng tải dữ liệu từ server, để có được nội dung khóa học mới nhất.

#### Acceptance Criteria

1. WHEN CourseDataService loads a course, THE Frontend SHALL call the Backend_API instead of loading JSON files
2. WHEN the API request succeeds, THE Frontend SHALL cache the response data
3. WHEN the API request fails, THE Frontend SHALL display an appropriate error message to the user
4. THE Frontend SHALL include authentication token in API requests when user is authenticated
5. THE Frontend SHALL set appropriate HTTP headers including Content-Type and Accept
6. THE Frontend SHALL handle HTTP timeout errors gracefully
7. WHEN receiving API responses, THE Frontend SHALL validate the data structure before using it
8. THE Frontend SHALL maintain the same data validation logic as the current JSON-based implementation

### Requirement 4: Progress Synchronization

**User Story:** Là một authenticated user, tôi muốn tiến độ học tập được lưu lên server, để có thể truy cập từ nhiều thiết bị.

#### Acceptance Criteria

1. WHEN an Authenticated_User completes a lesson, THE ProgressService SHALL save progress to both LocalStorage and Backend_API
2. WHEN an Anonymous_User completes a lesson, THE ProgressService SHALL save progress only to LocalStorage
3. WHEN saving progress to API fails, THE ProgressService SHALL keep the LocalStorage data and retry later
4. WHEN an Authenticated_User loads a course, THE ProgressService SHALL fetch progress from Backend_API
5. WHEN API progress data conflicts with LocalStorage data, THE ProgressService SHALL use the most recent data based on timestamps
6. THE ProgressService SHALL implement exponential backoff for retry attempts
7. WHEN network is unavailable, THE ProgressService SHALL queue progress updates for later synchronization
8. WHEN an Anonymous_User logs in, THE ProgressService SHALL sync their LocalStorage progress to the server

### Requirement 5: Authentication Token Management

**User Story:** Là một authenticated user, tôi muốn hệ thống tự động gửi authentication token với mỗi request, để không phải đăng nhập lại liên tục.

#### Acceptance Criteria

1. THE Frontend SHALL retrieve authentication token from the authentication service
2. WHEN making API requests, THE Frontend SHALL include the token in the Authorization header
3. WHEN the token is expired, THE Frontend SHALL attempt to refresh the token automatically
4. WHEN token refresh fails, THE Frontend SHALL redirect user to login page
5. THE Frontend SHALL handle HTTP 401 responses by triggering token refresh
6. THE Frontend SHALL not include authentication token for anonymous user requests
7. WHEN user logs out, THE Frontend SHALL clear the stored authentication token

### Requirement 6: Offline Mode Support

**User Story:** Là một user, tôi muốn ứng dụng vẫn hoạt động khi mất kết nối mạng, để có thể tiếp tục học tập.

#### Acceptance Criteria

1. WHEN the Backend_API is unreachable, THE Frontend SHALL enter Offline_Mode
2. WHILE in Offline_Mode, THE Frontend SHALL use cached data from previous API calls
3. WHILE in Offline_Mode, THE Frontend SHALL save progress only to LocalStorage
4. WHEN network connection is restored, THE Frontend SHALL exit Offline_Mode automatically
5. WHEN exiting Offline_Mode, THE Frontend SHALL sync queued progress updates to Backend_API
6. THE Frontend SHALL display a visual indicator when in Offline_Mode
7. WHEN no cached data is available in Offline_Mode, THE Frontend SHALL display an appropriate message

### Requirement 7: Backward Compatibility

**User Story:** Là một developer, tôi muốn đảm bảo hệ thống mới tương thích với dữ liệu cũ, để không làm gián đoạn trải nghiệm người dùng hiện tại.

#### Acceptance Criteria

1. THE Frontend SHALL continue to support LocalStorage-based progress for Anonymous_Users
2. THE Frontend SHALL maintain the same data models and interfaces as the current implementation
3. THE Frontend SHALL preserve existing LocalStorage data during the migration
4. WHEN API integration is disabled, THE Frontend SHALL fallback to JSON file loading
5. THE Frontend SHALL maintain the same validation rules for course and lesson data
6. THE Frontend SHALL preserve the same error messages and user feedback mechanisms
7. THE Frontend SHALL maintain the same caching behavior for course data

### Requirement 8: Error Handling and Resilience

**User Story:** Là một user, tôi muốn ứng dụng xử lý lỗi một cách graceful, để không bị gián đoạn khi có sự cố.

#### Acceptance Criteria

1. WHEN an API request fails, THE Frontend SHALL log detailed error information for debugging
2. WHEN an API returns HTTP 5xx error, THE Frontend SHALL retry the request with exponential backoff
3. WHEN maximum retry attempts are reached, THE Frontend SHALL display an error message and fallback to cached data
4. WHEN API returns invalid data, THE Frontend SHALL reject the data and use cached data if available
5. THE Frontend SHALL implement request timeout of 30 seconds for all API calls
6. WHEN a timeout occurs, THE Frontend SHALL treat it as a network error and enter Offline_Mode
7. THE Backend_API SHALL return structured error responses with error codes and messages
8. THE Frontend SHALL map API error codes to user-friendly Vietnamese error messages

### Requirement 9: Performance and Caching

**User Story:** Là một user, tôi muốn ứng dụng tải nhanh và mượt mà, để có trải nghiệm học tập tốt.

#### Acceptance Criteria

1. THE Frontend SHALL cache API responses in memory for the duration of the session
2. THE Frontend SHALL implement HTTP caching headers (ETag, Cache-Control) for lesson data
3. WHEN lesson data has not changed, THE Backend_API SHALL return HTTP 304 Not Modified
4. THE Frontend SHALL prefetch the next lesson when user is viewing current lesson
5. THE Frontend SHALL debounce progress save operations to avoid excessive API calls
6. THE Frontend SHALL batch multiple progress updates into a single API request when possible
7. THE Backend_API SHALL respond to lesson list requests within 200ms under normal load
8. THE Backend_API SHALL respond to progress save requests within 100ms under normal load

### Requirement 10: Data Migration

**User Story:** Là một developer, tôi muốn có công cụ để migrate dữ liệu từ JSON files sang database, để không phải nhập lại dữ liệu thủ công.

#### Acceptance Criteria

1. THE Backend_API SHALL provide a migration script that reads JSON files from a specified directory
2. THE migration script SHALL validate JSON data before inserting into database
3. WHEN duplicate data is detected, THE migration script SHALL skip the duplicate and log a warning
4. THE migration script SHALL preserve lesson order from JSON files
5. THE migration script SHALL create quiz questions with proper foreign key relationships
6. THE migration script SHALL provide a dry-run mode that validates without inserting data
7. THE migration script SHALL log all migration operations with timestamps
8. WHEN migration fails, THE migration script SHALL rollback all changes and report the error
