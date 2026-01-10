# Requirements Document

## Introduction

The Angular application currently has authentication functionality but fails to properly integrate authenticated user information with backend API calls. The system hardcodes user ID as `1` instead of using the actual authenticated user's ID, causing 500 Internal Server Error with "No authentication" messages when trying to save experiments or simulation results.

## Glossary

- **Auth_Service**: Angular service managing user authentication state and tokens
- **API_Interceptor**: HTTP interceptor that modifies outgoing requests
- **Experiment_Service**: Service handling experiment and simulation result operations
- **Simulations_Page**: Component where users run simulations and save results
- **User_ID**: Unique identifier for authenticated users from the backend
- **Authentication_Token**: JWT or session token proving user identity

## Requirements

### Requirement 1

**User Story:** As a logged-in user, I want my API requests to include proper authentication credentials, so that the backend can identify me and authorize my actions.

#### Acceptance Criteria

1. WHEN a user is authenticated, THE API_Interceptor SHALL include authentication headers in all API requests
2. WHEN authentication credentials are missing, THE API_Interceptor SHALL handle the request appropriately
3. WHEN authentication tokens expire, THE System SHALL handle token refresh or redirect to login
4. THE API_Interceptor SHALL add Authorization header with Bearer token format when available
5. THE API_Interceptor SHALL maintain backward compatibility with existing request handling

### Requirement 2

**User Story:** As a developer, I want components to use the actual authenticated user's ID, so that data operations are performed for the correct user.

#### Acceptance Criteria

1. WHEN a user is authenticated, THE Simulations_Page SHALL retrieve the user ID from Auth_Service
2. WHEN a user is authenticated, THE Experiment_History_Page SHALL retrieve the user ID from Auth_Service  
3. WHEN no user is authenticated, THE System SHALL prevent data operations and show appropriate messages
4. THE System SHALL replace all hardcoded user ID values with dynamic retrieval from Auth_Service
5. WHEN user authentication state changes, THE Components SHALL update their user ID references accordingly

### Requirement 3

**User Story:** As a user, I want to see clear feedback when authentication issues occur, so that I understand what actions I need to take.

#### Acceptance Criteria

1. WHEN API requests fail due to authentication, THE System SHALL display user-friendly error messages
2. WHEN a user is not logged in, THE System SHALL prompt them to log in before performing protected actions
3. WHEN authentication tokens are invalid, THE System SHALL redirect users to the login page
4. THE System SHALL distinguish between network errors and authentication errors in user feedback
5. WHEN authentication is required, THE System SHALL provide clear guidance on how to authenticate

### Requirement 4

**User Story:** As a system administrator, I want proper error handling for authentication failures, so that the system remains stable and provides useful debugging information.

#### Acceptance Criteria

1. WHEN authentication fails, THE System SHALL log detailed error information for debugging
2. WHEN backend returns authentication errors, THE System SHALL handle them gracefully without crashing
3. THE System SHALL provide fallback behavior for offline scenarios when authentication cannot be verified
4. WHEN multiple authentication errors occur, THE System SHALL prevent infinite retry loops
5. THE Error_Handler SHALL categorize authentication errors separately from other API errors