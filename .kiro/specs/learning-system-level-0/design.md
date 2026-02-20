# Design Document: Learning System Level 0

## Overview

The Learning System Level 0 is a client-side chemistry learning platform built with Angular 21 standalone components. The system provides a structured course experience with lesson navigation, progress tracking via LocalStorage, and interactive quizzes. The architecture follows Angular best practices with standalone components, signals for reactive state management, and Tailwind CSS for styling consistency.

The system consists of three main pages:
1. **Course Overview Page** - Entry point showing course information and progress
2. **Lesson Viewer Page** - Main learning interface with sidebar navigation and content display
3. **Quiz Component** - Embedded assessment tool with instant grading

All data is stored client-side using LocalStorage for progress tracking and static JSON files for course content, eliminating backend dependencies for Level 0.

## Architecture

### Component Hierarchy

```
AppComponent
├── HomePageComponent (updated with /courses link)
├── CourseOverviewPageComponent (/courses)
│   └── CourseCardComponent (displays course info)
├── LessonViewerPageComponent (/courses/:courseId/lesson/:lessonId)
│   ├── LessonSidebarComponent (navigation)
│   ├── LessonContentComponent (content display)
│   └── QuizComponent (quiz display and grading)
└── Services
    ├── CourseDataService (loads course JSON)
    ├── ProgressService (manages LocalStorage)
    └── NavigationService (handles lesson routing)
```

### Data Flow

1. **Course Loading**: CourseDataService loads course data from static JSON file on initialization
2. **Progress Tracking**: ProgressService reads/writes to LocalStorage using course and lesson IDs as keys
3. **State Management**: Angular Signals propagate progress updates to UI components
4. **Navigation**: Angular Router handles page transitions with route parameters

### Technology Stack

- **Framework**: Angular 21 with standalone components
- **State Management**: Angular Signals
- **Routing**: Angular Router with lazy loading
- **Styling**: Tailwind CSS
- **Storage**: Browser LocalStorage API
- **Data Format**: JSON for course content

## Components and Interfaces

### 1. CourseOverviewPageComponent

**Purpose**: Display course information and provide entry point to lessons

**Inputs**: None (loads from route parameter)

**Outputs**: Navigation to first lesson

**State**:
```typescript
interface CourseOverviewState {
  course: Signal<Course | null>;
  progress: Signal<number>;
  isLoading: Signal<boolean>;
}
```

**Key Methods**:
- `loadCourse()`: Fetches course data from CourseDataService
- `calculateProgress()`: Computes completion percentage from ProgressService
- `startCourse()`: Navigates to first incomplete lesson

### 2. LessonViewerPageComponent

**Purpose**: Main learning interface with sidebar and content area

**Inputs**: Route parameters (courseId, lessonId)

**Outputs**: Navigation events, progress updates

**State**:
```typescript
interface LessonViewerState {
  course: Signal<Course | null>;
  currentLesson: Signal<Lesson | null>;
  lessonStatuses: Signal<Map<number, LessonStatus>>;
  progress: Signal<number>;
  canGoNext: Signal<boolean>;
  canGoPrevious: Signal<boolean>;
}
```

**Key Methods**:
- `loadLesson(lessonId: number)`: Loads and displays specified lesson
- `navigateNext()`: Moves to next lesson and updates progress
- `navigatePrevious()`: Moves to previous lesson
- `markLessonInProgress()`: Updates progress when lesson is opened
- `markLessonCompleted()`: Updates progress when lesson is finished

### 3. LessonSidebarComponent

**Purpose**: Display lesson list with status indicators

**Inputs**:
```typescript
@Input() lessons: Lesson[];
@Input() currentLessonId: number;
@Input() lessonStatuses: Map<number, LessonStatus>;
```

**Outputs**:
```typescript
@Output() lessonSelected = new EventEmitter<number>();
```

**UI Elements**:
- Lesson list with numbers and titles
- Status icons (locked 🔒, in-progress ⏳, completed ✅)
- Active lesson highlighting
- Progress bar at top

### 4. LessonContentComponent

**Purpose**: Display lesson text and images

**Inputs**:
```typescript
@Input() lesson: Lesson;
```

**Features**:
- Markdown rendering support (using existing MarkdownService)
- Image display
- Responsive layout
- Smooth transitions

### 5. QuizComponent

**Purpose**: Interactive assessment with instant grading

**Inputs**:
```typescript
@Input() questions: QuizQuestion[];
```

**Outputs**:
```typescript
@Output() quizCompleted = new EventEmitter<QuizResult>();
```

**State**:
```typescript
interface QuizState {
  selectedAnswers: Signal<Map<number, number>>;
  isSubmitted: Signal<boolean>;
  score: Signal<number>;
  results: Signal<QuestionResult[]>;
}
```

**Key Methods**:
- `selectAnswer(questionIndex: number, answerIndex: number)`: Records user selection
- `submitQuiz()`: Calculates score and displays results
- `gradeQuiz()`: Compares answers with correct answers
- `showExplanations()`: Displays feedback for each question

### 6. CourseDataService

**Purpose**: Load and manage course data from JSON files

**Methods**:
```typescript
getCourse(courseId: string): Observable<Course>
getAllCourses(): Observable<Course[]>
```

**Implementation**:
- Uses HttpClient to load JSON from assets folder
- Caches course data in memory
- Validates course structure

### 7. ProgressService

**Purpose**: Manage lesson progress in LocalStorage

**Methods**:
```typescript
getProgress(courseId: string): Map<number, LessonStatus>
setLessonStatus(courseId: string, lessonId: number, status: LessonStatus): void
calculateProgressPercentage(courseId: string, totalLessons: number): number
clearProgress(courseId: string): void
```

**Storage Format**:
```typescript
// LocalStorage key: `course_progress_${courseId}`
{
  "1": "completed",
  "2": "in-progress",
  "3": "not-started",
  "4": "not-started"
}
```

### 8. NavigationService

**Purpose**: Handle lesson navigation logic

**Methods**:
```typescript
getNextLesson(courseId: string, currentLessonId: number): number | null
getPreviousLesson(courseId: string, currentLessonId: number): number | null
getFirstIncompleteLesson(courseId: string): number
navigateToLesson(courseId: string, lessonId: number): void
```

## Data Models

### Course Model

```typescript
interface Course {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
}
```

### Lesson Model

```typescript
interface Lesson {
  id: number;
  title: string;
  type: 'content' | 'quiz';
  content?: string;  // For content lessons
  questions?: QuizQuestion[];  // For quiz lessons
}
```

### QuizQuestion Model

```typescript
interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;  // Index of correct option
  explanation: string;
}
```

### LessonStatus Type

```typescript
type LessonStatus = 'not-started' | 'in-progress' | 'completed';
```

### QuizResult Model

```typescript
interface QuizResult {
  score: number;
  totalQuestions: number;
  questionResults: QuestionResult[];
}

interface QuestionResult {
  questionId: number;
  isCorrect: boolean;
  selectedAnswer: number;
  correctAnswer: number;
  explanation: string;
}
```

### Progress Data Model

```typescript
interface ProgressData {
  [lessonId: string]: LessonStatus;
}
```

## Routing Configuration

```typescript
// Add to app.routes.ts
{
  path: 'courses',
  component: CourseOverviewPageComponent
},
{
  path: 'courses/:courseId',
  redirectTo: 'courses/:courseId/lesson/1',  // Redirect to first lesson
  pathMatch: 'full'
},
{
  path: 'courses/:courseId/lesson/:lessonId',
  component: LessonViewerPageComponent
}
```

## Course Data JSON Structure

```json
{
  "id": "chemistry-basics-level-0",
  "title": "Hóa học cơ bản - Level 0",
  "description": "Khóa học làm quen với hóa học cơ bản dành cho người mới bắt đầu",
  "lessons": [
    {
      "id": 1,
      "title": "Giới thiệu về Hóa học",
      "type": "content",
      "content": "# Giới thiệu về Hóa học\n\nHóa học là khoa học nghiên cứu về cấu trúc, tính chất và sự biến đổi của vật chất..."
    },
    {
      "id": 2,
      "title": "Nguyên tử và Phân tử",
      "type": "content",
      "content": "# Nguyên tử và Phân tử\n\nNguyên tử là đơn vị cơ bản của vật chất..."
    },
    {
      "id": 3,
      "title": "Bảng tuần hoàn",
      "type": "content",
      "content": "# Bảng tuần hoàn các nguyên tố hóa học\n\nBảng tuần hoàn sắp xếp các nguyên tố theo số hiệu nguyên tử..."
    },
    {
      "id": 4,
      "title": "Kiểm tra kiến thức",
      "type": "quiz",
      "questions": [
        {
          "id": 1,
          "question": "Hóa học là khoa học nghiên cứu về điều gì?",
          "options": [
            "Nghiên cứu về sinh vật",
            "Nghiên cứu về vật chất và sự biến đổi của nó",
            "Nghiên cứu về vũ trụ",
            "Nghiên cứu về con người"
          ],
          "correctAnswer": 1,
          "explanation": "Hóa học là khoa học nghiên cứu về cấu trúc, tính chất và sự biến đổi của vật chất."
        },
        {
          "id": 2,
          "question": "Đơn vị cơ bản của vật chất là gì?",
          "options": [
            "Phân tử",
            "Nguyên tử",
            "Electron",
            "Proton"
          ],
          "correctAnswer": 1,
          "explanation": "Nguyên tử là đơn vị cơ bản cấu tạo nên vật chất."
        },
        {
          "id": 3,
          "question": "Bảng tuần hoàn sắp xếp các nguyên tố theo tiêu chí nào?",
          "options": [
            "Theo khối lượng nguyên tử",
            "Theo tên nguyên tố",
            "Theo số hiệu nguyên tử",
            "Theo màu sắc"
          ],
          "correctAnswer": 2,
          "explanation": "Bảng tuần hoàn sắp xếp các nguyên tố theo số hiệu nguyên tử tăng dần."
        }
      ]
    }
  ]
}
```

File location: `frontend/AngularChemistryWeb/AngularAtomic/src/app/assets/courses/chemistry-basics-level-0.json`


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Course description display

*For any* course with a description field, when the course overview is rendered, the description text should appear in the rendered output.

**Validates: Requirements 1.2**

### Property 2: Progress percentage calculation

*For any* course with N total lessons and M completed lessons, the displayed progress percentage should equal (M / N) × 100.

**Validates: Requirements 1.3, 3.4**

### Property 3: Start button navigation

*For any* course, when the "Bắt đầu" button is clicked, the system should navigate to the route `/courses/:courseId/lesson/:firstLessonId`.

**Validates: Requirements 1.5**

### Property 4: Sidebar lesson list completeness

*For any* course with N lessons, when the lesson viewer is rendered, the sidebar should display exactly N lesson items.

**Validates: Requirements 2.1**

### Property 5: Lesson item information completeness

*For any* lesson in the sidebar, the rendered lesson item should contain the lesson number, lesson title, and a status icon.

**Validates: Requirements 2.2**

### Property 6: Lesson status icon mapping

*For any* lesson with a given status (not-started, in-progress, or completed), the displayed icon should correctly correspond to that status (locked for not-started, in-progress indicator for in-progress, checkmark for completed).

**Validates: Requirements 2.3, 2.4, 2.5**

### Property 7: Content lesson display

*For any* content-type lesson, when rendered in the lesson viewer, both the lesson title and lesson content should appear in the main content area.

**Validates: Requirements 2.6**

### Property 8: Navigation button visibility

*For any* lesson at position P in a course with N lessons, the "Quay lại" button should be visible if P > 1, and the "Tiếp theo" button should be visible if P < N.

**Validates: Requirements 2.7, 2.8**

### Property 9: Sequential lesson navigation

*For any* lesson at position P in a course, clicking "Tiếp theo" should navigate to lesson P+1, and clicking "Quay lại" should navigate to lesson P-1 (when those buttons are visible).

**Validates: Requirements 2.9, 2.10**

### Property 10: Progress bar presence

*For any* lesson being viewed, the lesson viewer should display a progress bar showing the overall course completion percentage.

**Validates: Requirements 2.11**

### Property 11: First lesson open marks in-progress

*For any* lesson that has not been opened before, when a student opens that lesson, the Progress_Tracker should set that lesson's status to "in-progress" in LocalStorage.

**Validates: Requirements 3.1**

### Property 12: Content lesson completion on next

*For any* content-type lesson, when a student clicks "Tiếp theo", the Progress_Tracker should mark that lesson as "completed" in LocalStorage.

**Validates: Requirements 3.2**

### Property 13: Quiz completion marks completed

*For any* quiz lesson, when a student completes the quiz (submits answers), the Progress_Tracker should mark that lesson as "completed" in LocalStorage.

**Validates: Requirements 3.3, 4.7**

### Property 14: Progress persistence round-trip

*For any* course progress state (set of lesson statuses), saving the progress to LocalStorage and then loading it back should produce an equivalent progress state.

**Validates: Requirements 3.5**

### Property 15: Progress data format validation

*For any* progress data stored in LocalStorage, the data should be a valid JSON object where keys are lesson IDs (as strings) and values are one of "completed", "in-progress", or "not-started".

**Validates: Requirements 3.6**

### Property 16: Quiz content completeness

*For any* quiz lesson with N questions, when the quiz is rendered, all N questions should be displayed, and for each question, all answer options should be visible.

**Validates: Requirements 4.1, 4.2**

### Property 17: Quiz scoring on submission

*For any* quiz with selected answers, when the student clicks "Nộp bài", the system should immediately calculate and display a score.

**Validates: Requirements 4.3**

### Property 18: Quiz score format

*For any* quiz result with score S out of total T questions, the displayed score should match the format "S/T correct".

**Validates: Requirements 4.4**

### Property 19: Quiz results completeness

*For any* completed quiz, the results display should show for each question: whether the answer was correct or incorrect, and the explanation text.

**Validates: Requirements 4.5, 4.6**

### Property 20: Course data structure validation

*For any* course object loaded by the system, it should contain the required fields: id (string), title (string), description (string), and lessons (array).

**Validates: Requirements 5.1**

### Property 21: Lesson data structure validation

*For any* lesson object in a course, it should contain the required fields: id (number), title (string), and type (either "content" or "quiz").

**Validates: Requirements 5.2**

### Property 22: Lesson type-specific fields

*For any* lesson, if its type is "content", it should have a content field (string), and if its type is "quiz", it should have a questions field (array).

**Validates: Requirements 5.3, 5.4**

### Property 23: Quiz question data structure validation

*For any* quiz question object, it should contain the required fields: question (string), options (array of strings), correctAnswer (number), and explanation (string).

**Validates: Requirements 5.5**

### Property 24: Course redirect to first incomplete

*For any* course with a given progress state, when navigating to `/courses/:courseId`, the system should redirect to the first lesson that is not marked as "completed".

**Validates: Requirements 6.2**

### Property 25: Lesson route parameter handling

*For any* valid lesson ID in a course, when navigating to `/courses/:courseId/lesson/:lessonId`, the lesson viewer should display the lesson with that ID.

**Validates: Requirements 6.3**

### Property 26: Loading state display

*For any* asynchronous data loading operation (course loading, lesson loading), while the operation is in progress, a loading indicator should be visible.

**Validates: Requirements 7.3**

### Property 27: Course data loading

*For any* valid course JSON file, the CourseDataService should successfully load and parse the data into a Course object.

**Validates: Requirements 8.1**

### Property 28: Error handling for invalid data

*For any* failed course data loading operation (missing file, invalid JSON, network error), the system should display an error message to the user.

**Validates: Requirements 8.4**

## Error Handling

### Client-Side Errors

1. **Course Data Loading Failures**
   - Missing JSON file: Display "Không thể tải khóa học. Vui lòng thử lại sau."
   - Invalid JSON format: Display "Dữ liệu khóa học không hợp lệ."
   - Network errors: Display "Lỗi kết nối. Vui lòng kiểm tra kết nối mạng."

2. **LocalStorage Errors**
   - Storage quota exceeded: Clear old progress data and retry
   - Storage disabled: Display warning and continue without progress saving
   - Corrupted data: Clear corrupted data and start fresh

3. **Navigation Errors**
   - Invalid lesson ID: Redirect to first lesson
   - Invalid course ID: Redirect to course overview
   - Missing route parameters: Redirect to home page

4. **Quiz Submission Errors**
   - Incomplete answers: Display warning "Vui lòng trả lời tất cả câu hỏi"
   - Invalid answer format: Log error and use default value

### Error Recovery Strategies

1. **Graceful Degradation**: If LocalStorage is unavailable, continue without progress tracking
2. **Automatic Retry**: Retry failed HTTP requests once before showing error
3. **User Feedback**: Always inform users of errors with clear Vietnamese messages
4. **Fallback Content**: If course data fails to load, show cached data if available

### Validation

1. **Input Validation**
   - Validate course ID format before loading
   - Validate lesson ID is within valid range
   - Validate quiz answers are within valid option indices

2. **Data Validation**
   - Validate course JSON schema on load
   - Validate progress data format before saving
   - Validate lesson types match expected values

## Testing Strategy

### Dual Testing Approach

The testing strategy employs both unit tests and property-based tests to ensure comprehensive coverage:

- **Unit tests**: Verify specific examples, edge cases, and error conditions
- **Property tests**: Verify universal properties across all inputs
- Both approaches are complementary and necessary for complete validation

### Property-Based Testing

**Library**: fast-check (for TypeScript/Angular)

**Configuration**:
- Minimum 100 iterations per property test
- Each test tagged with feature name and property reference
- Tag format: `Feature: learning-system-level-0, Property {N}: {property text}`

**Property Test Coverage**:
- Each correctness property (1-28) should have a corresponding property-based test
- Tests should generate random valid inputs (courses, lessons, progress states)
- Tests should verify the property holds for all generated inputs

**Example Property Test Structure**:
```typescript
import * as fc from 'fast-check';

describe('Feature: learning-system-level-0, Property 2: Progress percentage calculation', () => {
  it('should calculate progress as (completed / total) * 100', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 20 }), // total lessons
        fc.integer({ min: 0, max: 20 }), // completed lessons
        (total, completed) => {
          fc.pre(completed <= total); // precondition
          const expected = (completed / total) * 100;
          const actual = calculateProgress(completed, total);
          return Math.abs(actual - expected) < 0.01; // floating point tolerance
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

### Unit Testing

**Framework**: Jasmine + Karma (Angular default)

**Unit Test Focus Areas**:

1. **Component Tests**
   - CourseOverviewPageComponent: Test initial state, button clicks
   - LessonViewerPageComponent: Test lesson loading, navigation
   - QuizComponent: Test answer selection, submission, results display
   - LessonSidebarComponent: Test lesson list rendering, status icons

2. **Service Tests**
   - CourseDataService: Test JSON loading, caching, error handling
   - ProgressService: Test LocalStorage operations, progress calculations
   - NavigationService: Test lesson navigation logic, edge cases

3. **Integration Tests**
   - Test complete user flows: start course → complete lessons → take quiz
   - Test progress persistence across page reloads
   - Test navigation between all lesson types

4. **Edge Cases**
   - Empty course (no lessons)
   - Single lesson course
   - All lessons completed
   - LocalStorage disabled
   - Invalid course data

5. **Error Conditions**
   - Missing course file
   - Corrupted LocalStorage data
   - Invalid lesson IDs
   - Network failures

### Test Data Generators

For property-based testing, create generators for:

```typescript
// Course generator
const courseArbitrary = fc.record({
  id: fc.string(),
  title: fc.string(),
  description: fc.string(),
  lessons: fc.array(lessonArbitrary, { minLength: 1, maxLength: 10 })
});

// Lesson generator
const lessonArbitrary = fc.oneof(
  fc.record({
    id: fc.integer({ min: 1 }),
    title: fc.string(),
    type: fc.constant('content'),
    content: fc.string()
  }),
  fc.record({
    id: fc.integer({ min: 1 }),
    title: fc.string(),
    type: fc.constant('quiz'),
    questions: fc.array(quizQuestionArbitrary, { minLength: 1, maxLength: 5 })
  })
);

// Progress state generator
const progressStateArbitrary = fc.dictionary(
  fc.string(),
  fc.oneof(
    fc.constant('not-started'),
    fc.constant('in-progress'),
    fc.constant('completed')
  )
);
```

### Testing Priorities

1. **Critical Path** (Must have 100% coverage):
   - Progress tracking and persistence
   - Quiz grading logic
   - Navigation between lessons
   - Course data loading

2. **Important** (Should have high coverage):
   - UI component rendering
   - Error handling
   - Route guards and redirects

3. **Nice to Have**:
   - Animation timing
   - Loading state transitions
   - Responsive layout breakpoints

### Continuous Testing

- Run unit tests on every commit
- Run property tests in CI/CD pipeline
- Maintain minimum 80% code coverage
- Review test failures before merging
