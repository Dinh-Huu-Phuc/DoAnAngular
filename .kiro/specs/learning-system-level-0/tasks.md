# Implementation Plan: Learning System Level 0

## Overview

This implementation plan breaks down the Learning System Level 0 feature into incremental coding tasks. The approach follows Angular best practices with standalone components, signals for state management, and Tailwind CSS for styling. The implementation progresses from data models and services through to UI components, ensuring each step builds on previous work and integrates properly.

## Tasks

- [x] 1. Set up data models and course data structure
  - Create TypeScript interfaces for Course, Lesson, QuizQuestion, LessonStatus, and ProgressData models
  - Create the course data JSON file at `src/app/assets/courses/chemistry-basics-level-0.json` with 4 lessons (3 content + 1 quiz)
  - Add Vietnamese content for all lessons and quiz questions
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 8.2, 8.3_

- [ ] 2. Implement CourseDataService
  - [x] 2.1 Create CourseDataService with methods to load course JSON from assets
    - Implement `getCourse(courseId: string): Observable<Course>`
    - Implement `getAllCourses(): Observable<Course[]>`
    - Add in-memory caching for loaded courses
    - Add JSON schema validation
    - _Requirements: 5.1, 5.2, 8.1_
  
  - [ ]* 2.2 Write property test for course data loading
    - **Property 27: Course data loading**
    - **Validates: Requirements 8.1**
  
  - [ ]* 2.3 Write property test for course data structure validation
    - **Property 20: Course data structure validation**
    - **Validates: Requirements 5.1**
  
  - [ ]* 2.4 Write unit tests for error handling
    - Test missing file error handling
    - Test invalid JSON error handling
    - _Requirements: 8.4_

- [ ] 3. Implement ProgressService
  - [x] 3.1 Create ProgressService with LocalStorage operations
    - Implement `getProgress(courseId: string): Map<number, LessonStatus>`
    - Implement `setLessonStatus(courseId: string, lessonId: number, status: LessonStatus): void`
    - Implement `calculateProgressPercentage(courseId: string, totalLessons: number): number`
    - Implement `clearProgress(courseId: string): void`
    - Add error handling for LocalStorage quota and disabled storage
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_
  
  - [ ]* 3.2 Write property test for progress percentage calculation
    - **Property 2: Progress percentage calculation**
    - **Validates: Requirements 1.3, 3.4**
  
  - [ ]* 3.3 Write property test for progress persistence round-trip
    - **Property 14: Progress persistence round-trip**
    - **Validates: Requirements 3.5**
  
  - [ ]* 3.4 Write property test for progress data format validation
    - **Property 15: Progress data format validation**
    - **Validates: Requirements 3.6**
  
  - [ ]* 3.5 Write unit tests for LocalStorage error handling
    - Test storage quota exceeded
    - Test storage disabled scenario
    - Test corrupted data recovery
    - _Requirements: 3.5_

- [ ] 4. Implement NavigationService
  - [x] 4.1 Create NavigationService with lesson navigation logic
    - Implement `getNextLesson(courseId: string, currentLessonId: number): number | null`
    - Implement `getPreviousLesson(courseId: string, currentLessonId: number): number | null`
    - Implement `getFirstIncompleteLesson(courseId: string): number`
    - Implement `navigateToLesson(courseId: string, lessonId: number): void`
    - _Requirements: 2.9, 2.10, 6.2, 6.3_
  
  - [ ]* 4.2 Write property test for sequential navigation
    - **Property 9: Sequential lesson navigation**
    - **Validates: Requirements 2.9, 2.10**
  
  - [ ]* 4.3 Write property test for course redirect logic
    - **Property 24: Course redirect to first incomplete**
    - **Validates: Requirements 6.2**

- [x] 5. Checkpoint - Ensure all service tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 6. Create CourseOverviewPageComponent
  - [x] 6.1 Generate standalone component with routing
    - Create component at `src/app/pages/courses/course-overview-page.component.ts`
    - Set up component with signals for course and progress state
    - Inject CourseDataService and ProgressService
    - Implement course loading in ngOnInit
    - _Requirements: 1.1, 1.2, 1.3, 1.4_
  
  - [x] 6.2 Create component template with Tailwind CSS
    - Display course title and description
    - Display progress percentage with progress bar
    - Add "Bắt đầu" button with click handler
    - Add loading state display
    - Add error state display
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 7.3, 7.4_
  
  - [ ]* 6.3 Write property test for course description display
    - **Property 1: Course description display**
    - **Validates: Requirements 1.2**
  
  - [ ]* 6.4 Write property test for start button navigation
    - **Property 3: Start button navigation**
    - **Validates: Requirements 1.5**
  
  - [ ]* 6.5 Write unit tests for component
    - Test initial loading state
    - Test error state display
    - Test empty state display
    - _Requirements: 7.3, 7.4_

- [ ] 7. Create LessonSidebarComponent
  - [x] 7.1 Generate standalone component
    - Create component at `src/app/pages/courses/lesson-sidebar.component.ts`
    - Define inputs for lessons, currentLessonId, and lessonStatuses
    - Define output for lessonSelected event
    - _Requirements: 2.1, 2.2_
  
  - [x] 7.2 Create sidebar template with lesson list
    - Display all lessons with numbers and titles
    - Show status icons (locked 🔒, in-progress ⏳, completed ✅)
    - Highlight current lesson
    - Add progress bar at top
    - Style with Tailwind CSS for responsive layout
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.11_
  
  - [ ]* 7.3 Write property test for sidebar lesson list completeness
    - **Property 4: Sidebar lesson list completeness**
    - **Validates: Requirements 2.1**
  
  - [ ]* 7.4 Write property test for lesson item information completeness
    - **Property 5: Lesson item information completeness**
    - **Validates: Requirements 2.2**
  
  - [ ]* 7.5 Write property test for lesson status icon mapping
    - **Property 6: Lesson status icon mapping**
    - **Validates: Requirements 2.3, 2.4, 2.5**

- [x] 8. Create LessonContentComponent
  - [x] 8.1 Generate standalone component for content display
    - Create component at `src/app/pages/courses/lesson-content.component.ts`
    - Define input for lesson data
    - Inject MarkdownService for content rendering
    - _Requirements: 2.6_
  
  - [x] 8.2 Create content template with markdown support
    - Display lesson title
    - Render lesson content with markdown (use existing MarkdownKatexPipe)
    - Support image display
    - Style with Tailwind CSS
    - _Requirements: 2.6_
  
  - [ ]* 8.3 Write property test for content lesson display
    - **Property 7: Content lesson display**
    - **Validates: Requirements 2.6**

- [x] 9. Create QuizComponent
  - [x] 9.1 Generate standalone component for quiz functionality
    - Create component at `src/app/pages/courses/quiz.component.ts`
    - Define input for quiz questions
    - Define output for quizCompleted event
    - Set up signals for selectedAnswers, isSubmitted, score, and results
    - _Requirements: 4.1, 4.2, 4.3_
  
  - [x] 9.2 Implement quiz logic methods
    - Implement `selectAnswer(questionIndex: number, answerIndex: number): void`
    - Implement `submitQuiz(): void` with scoring logic
    - Implement `gradeQuiz(): QuizResult` to compare answers
    - _Requirements: 4.3, 4.4, 4.5, 4.6_
  
  - [x] 9.3 Create quiz template
    - Display all questions with multiple choice options
    - Add radio buttons for answer selection
    - Add "Nộp bài" submit button
    - Display results with score format "X/3 correct"
    - Show correct/incorrect indicators for each question
    - Display explanations after submission
    - Style with Tailwind CSS
    - _Requirements: 4.1, 4.2, 4.4, 4.5, 4.6_
  
  - [ ]* 9.4 Write property test for quiz content completeness
    - **Property 16: Quiz content completeness**
    - **Validates: Requirements 4.1, 4.2**
  
  - [ ]* 9.5 Write property test for quiz scoring
    - **Property 17: Quiz scoring on submission**
    - **Validates: Requirements 4.3**
  
  - [ ]* 9.6 Write property test for quiz score format
    - **Property 18: Quiz score format**
    - **Validates: Requirements 4.4**
  
  - [ ]* 9.7 Write property test for quiz results completeness
    - **Property 19: Quiz results completeness**
    - **Validates: Requirements 4.5, 4.6**
  
  - [ ]* 9.8 Write unit tests for quiz edge cases
    - Test incomplete answer submission
    - Test all correct answers
    - Test all incorrect answers
    - _Requirements: 4.3_

- [x] 10. Checkpoint - Ensure all component tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 11. Create LessonViewerPageComponent
  - [x] 11.1 Generate standalone component with routing
    - Create component at `src/app/pages/courses/lesson-viewer-page.component.ts`
    - Set up route parameter subscriptions for courseId and lessonId
    - Inject CourseDataService, ProgressService, and NavigationService
    - Set up signals for course, currentLesson, lessonStatuses, progress, canGoNext, canGoPrevious
    - _Requirements: 2.1, 2.6, 2.7, 2.8, 2.9, 2.10, 2.11_
  
  - [x] 11.2 Implement lesson loading and navigation methods
    - Implement `loadLesson(lessonId: number): void`
    - Implement `navigateNext(): void` with progress update
    - Implement `navigatePrevious(): void`
    - Implement `markLessonInProgress(): void`
    - Implement `markLessonCompleted(): void`
    - Handle quiz completion event
    - _Requirements: 2.9, 2.10, 3.1, 3.2, 3.3, 4.7_
  
  - [x] 11.3 Create lesson viewer template
    - Add LessonSidebarComponent to left side
    - Add content area with LessonContentComponent or QuizComponent based on lesson type
    - Add "Quay lại" button (conditional on lesson position)
    - Add "Tiếp theo" button (conditional on lesson position)
    - Add progress bar at top
    - Add loading state
    - Style with Tailwind CSS for responsive layout
    - _Requirements: 2.1, 2.6, 2.7, 2.8, 2.11, 7.3_
  
  - [ ]* 11.4 Write property test for navigation button visibility
    - **Property 8: Navigation button visibility**
    - **Validates: Requirements 2.7, 2.8**
  
  - [ ]* 11.5 Write property test for progress bar presence
    - **Property 10: Progress bar presence**
    - **Validates: Requirements 2.11**
  
  - [ ]* 11.6 Write property test for first lesson open marks in-progress
    - **Property 11: First lesson open marks in-progress**
    - **Validates: Requirements 3.1**
  
  - [ ]* 11.7 Write property test for content lesson completion
    - **Property 12: Content lesson completion on next**
    - **Validates: Requirements 3.2**
  
  - [ ]* 11.8 Write property test for quiz completion
    - **Property 13: Quiz completion marks completed**
    - **Validates: Requirements 3.3, 4.7**
  
  - [ ]* 11.9 Write integration tests
    - Test complete flow: open lesson → navigate → complete
    - Test progress persistence across component reload
    - _Requirements: 3.1, 3.2, 3.3_

- [ ] 12. Update routing configuration
  - [x] 12.1 Add course routes to app.routes.ts
    - Add route for `/courses` → CourseOverviewPageComponent
    - Add route for `/courses/:courseId` with redirect to first incomplete lesson
    - Add route for `/courses/:courseId/lesson/:lessonId` → LessonViewerPageComponent
    - _Requirements: 6.1, 6.2, 6.3_
  
  - [ ]* 12.2 Write property test for lesson route parameter handling
    - **Property 25: Lesson route parameter handling**
    - **Validates: Requirements 6.3**
  
  - [ ]* 12.3 Write unit tests for route guards and redirects
    - Test invalid course ID redirect
    - Test invalid lesson ID redirect
    - _Requirements: 6.2, 6.3_

- [ ] 13. Update HomePageComponent
  - [x] 13.1 Update home page "Bắt đầu học ngay" button
    - Change button route from `/login` to `/courses`
    - Update button text if needed
    - _Requirements: 6.4_
  
  - [ ]* 13.2 Write unit test for home page navigation
    - Test button click navigates to `/courses`
    - _Requirements: 6.4_

- [ ] 14. Add error handling and loading states
  - [x] 14.1 Implement error handling across all components
    - Add error state displays for CourseOverviewPageComponent
    - Add error state displays for LessonViewerPageComponent
    - Add error messages in Vietnamese
    - Implement graceful degradation for LocalStorage failures
    - _Requirements: 8.4_
  
  - [x] 14.2 Implement loading states
    - Add loading indicators to CourseOverviewPageComponent
    - Add loading indicators to LessonViewerPageComponent
    - Add smooth transitions between loading and loaded states
    - _Requirements: 7.3_
  
  - [ ]* 14.3 Write property test for loading state display
    - **Property 26: Loading state display**
    - **Validates: Requirements 7.3**
  
  - [ ]* 14.4 Write property test for error handling
    - **Property 28: Error handling for invalid data**
    - **Validates: Requirements 8.4**

- [ ] 15. Create property-based test generators
  - [ ] 15.1 Set up fast-check library
    - Install fast-check: `npm install --save-dev fast-check`
    - Create test utilities file for generators
    - _Requirements: All_
  
  - [ ] 15.2 Create data generators for property tests
    - Create `courseArbitrary` generator for random courses
    - Create `lessonArbitrary` generator for random lessons
    - Create `progressStateArbitrary` generator for random progress states
    - Create `quizQuestionArbitrary` generator for random quiz questions
    - _Requirements: All_

- [ ]* 16. Run all property-based tests
  - Execute all property tests with 100 iterations each
  - Verify all 28 correctness properties pass
  - Fix any failing properties
  - _Requirements: All_

- [ ] 17. Final integration and polish
  - [x] 17.1 Test complete user flows
    - Test flow: home → courses → start → complete all lessons → quiz
    - Test progress persistence across page reloads
    - Test navigation between all lesson types
    - Test responsive layout on mobile and desktop
    - _Requirements: All_
  
  - [x] 17.2 Add smooth transitions and animations
    - Add transition animations between lessons
    - Add fade-in animations for content loading
    - Ensure animations match existing app style
    - _Requirements: 7.5_
  
  - [x] 17.3 Verify Tailwind CSS styling consistency
    - Ensure all components match existing app design
    - Verify responsive breakpoints work correctly
    - Test dark mode compatibility if applicable
    - _Requirements: 7.1, 7.2_

- [x] 18. Final checkpoint - Ensure all tests pass
  - Run all unit tests and property tests
  - Verify code coverage meets 80% minimum
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Property tests validate universal correctness properties with 100+ iterations
- Unit tests validate specific examples, edge cases, and error conditions
- The implementation follows Angular 21 standalone component patterns
- All text content is in Vietnamese to match the target audience
- LocalStorage is used for client-side persistence (no backend required for Level 0)
