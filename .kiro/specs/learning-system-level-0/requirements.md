# Requirements Document

## Introduction

This document specifies the requirements for a beginner-friendly chemistry learning system (Level 0). The system enables students to access structured chemistry courses with lessons, progress tracking, and quizzes without requiring authentication. The system uses LocalStorage for client-side data persistence and provides an intuitive interface for navigating through course content.

## Glossary

- **Learning_System**: The complete course delivery platform including course overview, lesson viewer, and quiz components
- **Course**: A structured collection of lessons with a title, description, and progress tracking
- **Lesson**: An individual learning unit containing educational content or a quiz
- **Content_Lesson**: A lesson that displays text and images for learning
- **Quiz_Lesson**: A lesson that contains multiple-choice questions for assessment
- **Progress_Tracker**: The component responsible for storing and calculating lesson completion status
- **LocalStorage**: Browser-based persistent storage mechanism for saving user progress
- **Lesson_Viewer**: The page component that displays lesson content with sidebar navigation
- **Course_Overview**: The page component that displays course information and entry point
- **Quiz_Component**: The interactive assessment component with instant grading
- **Navigation_Controls**: The buttons and UI elements for moving between lessons

## Requirements

### Requirement 1: Course Overview Display

**User Story:** As a student, I want to view course information and my progress, so that I can understand what I will learn and track my advancement.

#### Acceptance Criteria

1. WHEN a student navigates to the course overview page, THE Learning_System SHALL display the course title "Hóa học cơ bản - Level 0"
2. WHEN displaying the course overview, THE Learning_System SHALL show the course description
3. WHEN displaying the course overview, THE Learning_System SHALL calculate and display progress as a percentage based on completed lessons
4. WHEN a student has not started any lessons, THE Learning_System SHALL display 0% progress
5. WHEN a student clicks the "Bắt đầu" button, THE Learning_System SHALL navigate to the first lesson in the course

### Requirement 2: Lesson Navigation and Display

**User Story:** As a student, I want to navigate through lessons with a clear sidebar and content area, so that I can easily move between topics and see my current position.

#### Acceptance Criteria

1. WHEN a student opens a lesson, THE Lesson_Viewer SHALL display a sidebar containing all lessons in the course
2. WHEN displaying the lesson sidebar, THE Lesson_Viewer SHALL show each lesson's number, title, and status icon
3. WHEN a lesson has not been started, THE Lesson_Viewer SHALL display a locked icon for that lesson
4. WHEN a lesson is currently being viewed, THE Lesson_Viewer SHALL display an in-progress icon for that lesson
5. WHEN a lesson has been completed, THE Lesson_Viewer SHALL display a done icon for that lesson
6. WHEN displaying a content lesson, THE Lesson_Viewer SHALL show the lesson title and content in the main area
7. WHEN a student is viewing any lesson except the first, THE Lesson_Viewer SHALL display a "Quay lại" button
8. WHEN a student is viewing any lesson except the last, THE Lesson_Viewer SHALL display a "Tiếp theo" button
9. WHEN a student clicks "Tiếp theo", THE Lesson_Viewer SHALL navigate to the next lesson in sequence
10. WHEN a student clicks "Quay lại", THE Lesson_Viewer SHALL navigate to the previous lesson in sequence
11. WHEN displaying any lesson, THE Lesson_Viewer SHALL show a progress bar at the top indicating overall course completion

### Requirement 3: Progress Tracking and Persistence

**User Story:** As a student, I want my progress to be saved automatically, so that I can continue where I left off when I return to the course.

#### Acceptance Criteria

1. WHEN a student opens a lesson for the first time, THE Progress_Tracker SHALL mark that lesson as "in-progress" in LocalStorage
2. WHEN a student clicks "Tiếp theo" on a content lesson, THE Progress_Tracker SHALL mark that lesson as "completed" in LocalStorage
3. WHEN a student completes a quiz, THE Progress_Tracker SHALL mark that quiz lesson as "completed" in LocalStorage
4. WHEN calculating progress percentage, THE Progress_Tracker SHALL divide the number of completed lessons by total lessons and multiply by 100
5. WHEN a student returns to the course, THE Progress_Tracker SHALL retrieve progress data from LocalStorage and restore lesson statuses
6. WHEN storing progress data, THE Progress_Tracker SHALL use the format `{ lessonId: 'completed' | 'in-progress' }`

### Requirement 4: Quiz Functionality

**User Story:** As a student, I want to take a quiz at the end of the course with instant feedback, so that I can assess my understanding of the material.

#### Acceptance Criteria

1. WHEN a student opens the quiz lesson, THE Quiz_Component SHALL display 3 multiple-choice questions
2. WHEN displaying quiz questions, THE Quiz_Component SHALL show all answer options for each question
3. WHEN a student selects answers and clicks "Nộp bài", THE Quiz_Component SHALL calculate the score immediately
4. WHEN displaying quiz results, THE Quiz_Component SHALL show the score in the format "X/3 correct"
5. WHEN displaying quiz results, THE Quiz_Component SHALL indicate which answers were correct and which were incorrect
6. WHEN displaying quiz results, THE Quiz_Component SHALL show explanations for each question
7. WHEN a student completes the quiz, THE Quiz_Component SHALL trigger the Progress_Tracker to mark the quiz lesson as completed

### Requirement 5: Course Data Structure

**User Story:** As a developer, I want a well-defined JSON structure for course data, so that courses can be easily created and maintained.

#### Acceptance Criteria

1. THE Learning_System SHALL define courses with the following properties: id, title, description, and lessons array
2. THE Learning_System SHALL define lessons with the following properties: id, title, type, and content or questions
3. WHEN a lesson type is "content", THE Learning_System SHALL include a content property containing the lesson text
4. WHEN a lesson type is "quiz", THE Learning_System SHALL include a questions array containing quiz questions
5. THE Learning_System SHALL define quiz questions with properties for question text, answer options, correct answer, and explanation

### Requirement 6: Routing and Navigation

**User Story:** As a student, I want clear URLs for different pages, so that I can bookmark specific lessons and navigate directly to them.

#### Acceptance Criteria

1. WHEN a student navigates to `/courses`, THE Learning_System SHALL display the course overview page
2. WHEN a student navigates to `/courses/:courseId`, THE Learning_System SHALL redirect to the first incomplete lesson
3. WHEN a student navigates to `/courses/:courseId/lesson/:lessonId`, THE Learning_System SHALL display the specified lesson in the Lesson_Viewer
4. WHEN a student clicks "Bắt đầu học ngay" on the home page, THE Learning_System SHALL navigate to `/courses`

### Requirement 7: User Interface and Experience

**User Story:** As a student, I want a modern, responsive interface that matches the existing application design, so that I have a consistent and pleasant learning experience.

#### Acceptance Criteria

1. THE Learning_System SHALL use Tailwind CSS for styling to match the existing application design
2. WHEN displaying any page, THE Learning_System SHALL render a responsive layout that works on mobile and desktop devices
3. WHEN content is loading, THE Learning_System SHALL display loading states to indicate progress
4. WHEN no courses are available, THE Learning_System SHALL display an empty state message
5. WHEN transitioning between lessons, THE Learning_System SHALL apply smooth animations
6. THE Learning_System SHALL use Angular Signals for reactive state management

### Requirement 8: Course Data Management

**User Story:** As a developer, I want the course data to be stored in a JSON file, so that Level 0 courses can be delivered without backend dependencies.

#### Acceptance Criteria

1. THE Learning_System SHALL load course data from a static JSON file
2. THE Learning_System SHALL include a default course with id "chemistry-basics-level-0"
3. THE Learning_System SHALL include 4 lessons in the default course: 3 content lessons and 1 quiz lesson
4. WHEN the course data file is missing or invalid, THE Learning_System SHALL display an error message to the user
