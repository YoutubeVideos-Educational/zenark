# API Integration Documentation

## Overview
This document outlines the API integration implemented for the Zenark mental health app frontend.

## API Endpoints Used

### Authentication Endpoints (No Auth Required)
- `POST /api/auth/signup` - User registration
- `POST /api/auth/signin` - User login  
- `POST /api/auth/signout` - User logout

### Questionnaire Endpoints (Auth Required)
- `GET /api/questionnaire/getNextQuestionnaireForUser` - Get the next questionnaire for the current user
- `POST /api/questionnaire/markQuestionnaireCompleted` - Mark a questionnaire as completed

### Response Endpoint (Auth Required)
- `POST /api/response/submitOrUpdateAnswer` - Submit or update an answer

## Implementation Details

### Files Created/Modified

1. **`services/apiService.ts`** - Main API service layer
   - Handles HTTP requests with authentication
   - Manages JWT token storage using AsyncStorage
   - Provides methods for all API endpoints
   - Includes proper error handling and TypeScript types

2. **`app/Questionnaire.tsx`** - New questionnaire component
   - Fetches questionnaires from API
   - Handles different question types (text, options, scale)
   - Submits answers to backend
   - Shows progress and completion states

3. **`contexts/AuthContext.tsx`** - Authentication context
   - Manages user authentication state
   - Provides login/signup/logout methods
   - Can be used across the app for auth checks

4. **Updated Components:**
   - `app/(auth)/Login.tsx` - Now uses real API calls
   - `app/(auth)/Signup.tsx` - Now uses real API calls
   - `app/Welcome.tsx` - Navigates to Questionnaire after completion
   - `Styles/GlobalColors.ts` - Added primaryColor

## Authentication Flow

1. User signs up/logs in through Login/Signup screens
2. JWT token is stored in AsyncStorage
3. All subsequent API calls include the token in Authorization header
4. If token expires (401 response), user is redirected to login

## Questionnaire Flow

1. After completing welcome questions, user navigates to Questionnaire screen
2. App fetches next available questionnaire from API
3. User answers questions one by one
4. Each answer is submitted to the API immediately
5. After all questions are answered, questionnaire is marked as completed
6. App checks for next questionnaire or shows completion message

## Error Handling

- Network errors are caught and displayed to user
- 401 responses trigger automatic redirect to login
- Validation errors are shown inline
- Loading states are displayed during API calls

## Question Types Supported

1. **Text Questions** - Free text input
2. **Options Questions** - Multiple choice buttons
3. **Scale Questions** - 1-10 rating scale

## Security Features

- JWT tokens stored securely in AsyncStorage
- Automatic token inclusion in authenticated requests
- Session management with automatic logout on token expiry
- Input validation on both client and server side

## Dependencies Added

- `@react-native-async-storage/async-storage` - For secure token storage

## Usage

### Making API Calls
```typescript
import { apiService } from '../services/apiService';

// Login
await apiService.signin(email, password);

// Get questionnaire
const questionnaire = await apiService.getNextQuestionnaire();

// Submit answer
await apiService.submitOrUpdateAnswer(questionId, answer, questionnaireId);
```

### Using Auth Context
```typescript
import { useAuth } from '../contexts/AuthContext';

const { user, isAuthenticated, login, logout } = useAuth();
```

## Testing

To test the integration:

1. Run the app and navigate to Login/Signup
2. Create an account or login with existing credentials
3. Complete the welcome questions
4. The app should fetch and display questionnaires from the API
5. Answer questions and verify they're submitted to the backend

## Environment Configuration

The API base URL is currently hardcoded as `https://service.zenark.in/zenark`. 
For production, consider using environment variables:

```typescript
const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'https://service.zenark.in/zenark';
```

## Future Enhancements

1. Add offline support with local caching
2. Implement push notifications for new questionnaires
3. Add user profile management
4. Implement data synchronization
5. Add analytics and error reporting
