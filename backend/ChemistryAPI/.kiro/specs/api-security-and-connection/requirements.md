# Requirements Document

## Introduction

This specification addresses two critical issues in the ChemistryAPI application: securing sensitive API keys by moving them to environment variables, and resolving connection issues between the Angular frontend and the .NET backend API.

## Glossary

- **API_Key**: Sensitive authentication token for external services (Gemini API)
- **Environment_Variables**: System-level configuration values stored outside source code
- **Backend_API**: The ChemistryAPI .NET application running on localhost:5150
- **Frontend_App**: The Angular application attempting to connect to the backend
- **Connection_Health_Check**: API endpoint to verify backend availability

## Requirements

### Requirement 1: Secure API Key Management

**User Story:** As a developer, I want to store sensitive API keys in environment variables, so that they are not exposed in source code or version control.

#### Acceptance Criteria

1. WHEN the application starts, THE Backend_API SHALL read the Gemini API key from environment variables
2. WHEN the appsettings.json file is accessed, THE API_Key SHALL not be present in plain text
3. WHEN environment variables are not set, THE Backend_API SHALL provide clear error messages indicating missing configuration
4. THE Backend_API SHALL support both development and production environment variable configurations
5. WHEN deploying the application, THE API_Key SHALL remain secure and not be committed to version control

### Requirement 2: Backend API Connection Resolution

**User Story:** As a user, I want the Angular frontend to successfully connect to the backend API, so that I can access chemistry data and functionality.

#### Acceptance Criteria

1. WHEN the Backend_API starts, THE Backend_API SHALL listen on the correct port (5150)
2. WHEN the Frontend_App makes requests to health check endpoints, THE Backend_API SHALL respond successfully
3. WHEN the Backend_API is not running, THE Frontend_App SHALL display appropriate error messages
4. THE Backend_API SHALL handle CORS properly to allow frontend connections
5. WHEN database connections fail, THE Backend_API SHALL still respond to health checks with appropriate status codes

### Requirement 3: Environment Configuration Setup

**User Story:** As a developer, I want clear documentation and setup for environment variables, so that other developers can easily configure the application.

#### Acceptance Criteria

1. THE system SHALL provide a .env.example file showing required environment variables
2. WHEN setting up the development environment, THE developer SHALL have clear instructions for configuring API keys
3. THE Backend_API SHALL validate required environment variables on startup
4. WHEN environment variables are missing, THE Backend_API SHALL log specific error messages
5. THE system SHALL support different environment configurations (Development, Production)

### Requirement 4: Connection Diagnostics and Monitoring

**User Story:** As a developer, I want diagnostic tools to troubleshoot connection issues, so that I can quickly identify and resolve problems.

#### Acceptance Criteria

1. THE Backend_API SHALL provide a health check endpoint that returns system status
2. WHEN the Frontend_App cannot connect, THE system SHALL log detailed connection error information
3. THE Backend_API SHALL provide startup logs indicating successful service initialization
4. WHEN external API calls fail, THE system SHALL log specific error details without exposing sensitive information
5. THE system SHALL provide clear differentiation between database connection issues and API availability issues