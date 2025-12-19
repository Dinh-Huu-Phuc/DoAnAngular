# Database Integration Guide

## Overview

This guide explains how the Angular frontend integrates with the database for experiment management. The system supports both online and offline modes, with automatic fallback to local storage when the database is unavailable.

## Required Backend API Endpoints

### 1. Health Check
```
GET /api/experiments/health
Response: { "status": "ok", "timestamp": "2024-12-20T10:00:00Z" }
```

### 2. Save Experiment
```
POST /api/experiments
Body: {
  "experimentId": "custom-1734692400000",
  "userId": 1,
  "title": "My Custom Experiment",
  "level": "THCS",
  "description": "Description of the experiment",
  "tags": "[\"tag1\", \"tag2\"]",
  "experimentType": "acid-base",
  "parameters": "{\"type\":\"acid-base\",\"parameters\":{...}}",
  "reactions": "[\"HCl + NaOH → NaCl + H₂O\"]",
  "phenomena": "[\"Color change\", \"Temperature increase\"]",
  "isPublic": false
}
Response: {
  "id": 123,
  "experimentId": "custom-1734692400000",
  "userId": 1,
  "title": "My Custom Experiment",
  "createdAt": "2024-12-20T10:00:00Z",
  "updatedAt": "2024-12-20T10:00:00Z",
  ...
}
```

### 3. Get User Experiments
```
GET /api/experiments/user/{userId}
Response: [
  {
    "id": 123,
    "experimentId": "custom-1734692400000",
    "userId": 1,
    "title": "My Custom Experiment",
    "level": "THCS",
    "description": "Description",
    "tags": "[\"tag1\", \"tag2\"]",
    "experimentType": "acid-base",
    "parameters": "{\"type\":\"acid-base\",\"parameters\":{...}}",
    "reactions": "[\"HCl + NaOH → NaCl + H₂O\"]",
    "phenomena": "[\"Color change\"]",
    "isPublic": false,
    "createdAt": "2024-12-20T10:00:00Z",
    "updatedAt": "2024-12-20T10:00:00Z"
  }
]
```

### 4. Get Public Experiments
```
GET /api/experiments/public
Response: [/* Array of public experiments */]
```

### 5. Update Experiment
```
PUT /api/experiments/{id}
Body: {
  "title": "Updated Title",
  "description": "Updated description",
  // ... other fields to update
}
Response: {/* Updated experiment object */}
```

### 6. Delete Experiment
```
DELETE /api/experiments/{id}
Response: { "success": true, "message": "Experiment deleted successfully" }
```

### 7. Save Simulation Results
```
POST /api/experiments/results
Body: {
  "experimentId": "custom-1734692400000",
  "userId": 1,
  "parameters": "{\"temperature\":25,\"concentration\":0.1,...}",
  "results": "{\"ph\":7.2,\"efficiency\":85,...}",
  "duration": 120,
  "efficiency": 85.5
}
Response: {
  "id": 456,
  "experimentId": "custom-1734692400000",
  "userId": 1,
  "createdAt": "2024-12-20T10:00:00Z",
  ...
}
```

### 8. Get Simulation Results
```
GET /api/experiments/results/{experimentId}/{userId}
Response: [
  {
    "id": 456,
    "experimentId": "custom-1734692400000",
    "userId": 1,
    "parameters": "{\"temperature\":25,...}",
    "results": "{\"ph\":7.2,...}",
    "duration": 120,
    "efficiency": 85.5,
    "createdAt": "2024-12-20T10:00:00Z"
  }
]
```

### 9. Search Experiments
```
GET /api/experiments/search?query=acid&level=THCS&type=acid-base&userId=1
Response: [/* Array of matching experiments */]
```

### 10. Get User Statistics
```
GET /api/experiments/stats/{userId}
Response: {
  "totalExperiments": 15,
  "totalSimulations": 45,
  "averageEfficiency": 78.5,
  "favoriteType": "acid-base"
}
```

## Database Schema

### Experiments Table
```sql
CREATE TABLE Experiments (
    Id INT PRIMARY KEY IDENTITY(1,1),
    ExperimentId NVARCHAR(100) NOT NULL,
    UserId INT NOT NULL,
    Title NVARCHAR(200) NOT NULL,
    Level NVARCHAR(20) NOT NULL,
    Description NVARCHAR(MAX),
    Tags NVARCHAR(MAX), -- JSON array as string
    ExperimentType NVARCHAR(50) NOT NULL,
    Parameters NVARCHAR(MAX), -- JSON object as string
    Reactions NVARCHAR(MAX), -- JSON array as string
    Phenomena NVARCHAR(MAX), -- JSON array as string
    IsPublic BIT DEFAULT 0,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    UpdatedAt DATETIME2 DEFAULT GETDATE(),
    INDEX IX_Experiments_UserId (UserId),
    INDEX IX_Experiments_ExperimentId (ExperimentId),
    INDEX IX_Experiments_Level (Level),
    INDEX IX_Experiments_Type (ExperimentType)
);
```

### SimulationResults Table
```sql
CREATE TABLE SimulationResults (
    Id INT PRIMARY KEY IDENTITY(1,1),
    ExperimentId NVARCHAR(100) NOT NULL,
    UserId INT NOT NULL,
    Parameters NVARCHAR(MAX), -- JSON object as string
    Results NVARCHAR(MAX), -- JSON object as string
    Duration INT NOT NULL, -- in seconds
    Efficiency FLOAT NULL,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    INDEX IX_SimulationResults_ExperimentId (ExperimentId),
    INDEX IX_SimulationResults_UserId (UserId)
);
```

## Frontend Integration Features

### 1. Automatic Database Connection Testing
- Tests connection on component initialization
- Shows connection status in UI
- Automatically falls back to offline mode if connection fails

### 2. Experiment Creation with Database Sync
- Creates experiments locally first for immediate UI response
- Saves to database in background if connected
- Shows saving status to user
- Handles errors gracefully without blocking user experience

### 3. Simulation Results Auto-Save
- Automatically saves simulation results when experiments complete
- Includes all parameters, results, duration, and efficiency
- Silent background operation - doesn't interrupt user workflow

### 4. Offline Mode Support
- All functionality works without database connection
- Experiments stored in component memory during session
- User notified of offline status
- Seamless transition when connection restored

### 5. Loading States and Error Handling
- Loading indicators for database operations
- Graceful error handling with fallback behavior
- User-friendly status messages
- No blocking errors - always maintains functionality

## Usage Examples

### Creating a Custom Experiment
1. User fills out the experiment creation form
2. Frontend validates input and creates experiment object
3. Experiment added to local list immediately
4. If database connected, experiment saved in background
5. User sees success message with save status

### Running a Simulation
1. User selects experiment and adjusts parameters
2. Simulation runs with real-time visualization
3. When simulation completes, results automatically saved to database
4. User can view AI analysis and export reports
5. All data preserved for future reference

### Loading User Experiments
1. Component initializes and tests database connection
2. If connected, loads user's saved experiments from database
3. Converts database format to frontend format
4. Merges with default experiments in UI
5. User sees all available experiments seamlessly

## Error Handling Strategy

### Database Connection Failures
- Component continues to function normally
- User notified of offline mode
- All features remain available
- Data preserved in session

### Save Operation Failures
- Experiments remain in local list
- User notified but not blocked
- Retry mechanisms for transient failures
- Graceful degradation to offline mode

### Load Operation Failures
- Falls back to default experiments only
- User can still create and run experiments
- Error logged for debugging
- No impact on core functionality

## Security Considerations

### User Authentication
- All API calls should include user authentication
- UserId validated on backend for all operations
- Private experiments only accessible to owner
- Public experiments readable by all authenticated users

### Data Validation
- Backend validates all experiment data
- JSON fields parsed and validated
- SQL injection prevention
- Input sanitization for all text fields

### Privacy Controls
- Users can mark experiments as public/private
- Private experiments never exposed to other users
- Simulation results always private to user
- Option to share experiments with specific users

This integration provides a robust, user-friendly system that works reliably both online and offline, with automatic data synchronization and comprehensive error handling.