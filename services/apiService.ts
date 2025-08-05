import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'https://service.zenark.in/zenark';

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export interface QuestionOption {
  label: {
    en: string;
    hi: string;
  };
  value: number;
}

export interface OptionSet {
  _id: string;
  name: string;
  description: string;
  options: QuestionOption[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BackendQuestion {
  _id: string;
  text: {
    en: string;
  };
  type: 'single_choice' | 'multiple_choice' | 'text';
  optionSetId?: OptionSet;
  isRequired: boolean;
  isActive: boolean;
  version: number;
  tool: string;
  createdAt: string;
  updatedAt: string;
}

export interface BackendQuestionnaire {
  _id: string;
  title: {
    en: string;
    hi: string;
  };
  description: {
    en: string;
    hi: string;
  };
  tool: string;
  week: number;
  questions: BackendQuestion[];
  isActive: boolean;
}

export interface QuestionnaireResponse {
  questionnaire: BackendQuestionnaire;
  week: number;
}

// Frontend interfaces (transformed from backend)
export interface QuestionOptionValue {
  label: string;
  value: number;
}

export interface Question {
  id: string;
  question: string;
  type: 'text' | 'options' | 'scale';
  options?: string[];
  optionValues?: QuestionOptionValue[];
  placeholder?: string;
  subtext?: string;
}

export interface Questionnaire {
  id: string;
  title: string;
  description?: string;
  questions: Question[];
  week?: number;
}

export interface ApiError {
  message: string;
  status: number;
}

class ApiService {
  private baseURL: string;

  constructor() {
    this.baseURL = BASE_URL;
  }

  // Helper method to get stored token
  private async getToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('authToken');
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  }

  // Helper method to store token
  private async storeToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem('authToken', token);
    } catch (error) {
      console.error('Error storing token:', error);
    }
  }

  // Helper method to remove token
  private async removeToken(): Promise<void> {
    try {
      await AsyncStorage.removeItem('authToken');
    } catch (error) {
      console.error('Error removing token:', error);
    }
  }

  // Helper method to make authenticated requests
  private async makeRequest(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<any> {
    const token = await this.getToken();
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Add existing headers from options
    if (options.headers) {
      if (options.headers instanceof Headers) {
        options.headers.forEach((value, key) => {
          headers[key] = value;
        });
      } else if (Array.isArray(options.headers)) {
        options.headers.forEach(([key, value]) => {
          headers[key] = value;
        });
      } else {
        Object.assign(headers, options.headers);
      }
    }

    // Add authorization header if token exists
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    try {
      console.log('Making request to:', `${this.baseURL}${endpoint}`);
      console.log('Request config:', { ...config, body: config.body ? 'JSON body present' : 'No body' });
      
      const response = await fetch(`${this.baseURL}${endpoint}`, config);
      
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Network error' }));
        console.log('Error response data:', errorData);
        throw {
          message: errorData.message || `HTTP ${response.status}`,
          status: response.status,
        } as ApiError;
      }

      const responseData = await response.json();
      console.log('Success response data:', responseData);
      return responseData;
    } catch (error) {
      if (error instanceof Error) {
        throw {
          message: error.message,
          status: 0,
        } as ApiError;
      }
      throw error;
    }
  }

  // Authentication methods
  async signup(name: string, email: string, password: string): Promise<AuthResponse> {
    console.log('ApiService.signup called with:', { name, email, password: '***' });
    
    // API expects 'username' field. Since users login with email, we'll use email as username
    // and store the actual name in a separate field if the API supports it
    const requestBody = { 
      username: email, // Use email as username for login consistency
      email, 
      password,
      roles: ['user'] // Default role for new users
    };
    console.log('Request body:', { ...requestBody, password: '***' });
    
    const response = await this.makeRequest('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });

    console.log('Signup response:', response);

    if (response.token) {
      await this.storeToken(response.token);
    }

    return response;
  }

  async signin(email: string, password: string): Promise<AuthResponse> {
    console.log('ApiService.signin called with:', { email, password: '***' });
    
    // API expects 'username' field, not 'email'
    // Since users enter email, we'll use email as username for signin
    const requestBody = { username: email, password };
    console.log('Signin request body:', { ...requestBody, password: '***' });
    
    const response = await this.makeRequest('/api/auth/signin', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });

    console.log('Signin response:', response);

    if (response.token) {
      await this.storeToken(response.token);
    }

    return response;
  }

  async signout(): Promise<void> {
    try {
      await this.makeRequest('/api/auth/signout', {
        method: 'POST',
      });
    } finally {
      // Always remove token locally, even if API call fails
      await this.removeToken();
    }
  }

  // Check if user is authenticated
  async isAuthenticated(): Promise<boolean> {
    const token = await this.getToken();
    return !!token;
  }

  // Helper method to transform backend data to frontend format
  private transformQuestionnaire(response: QuestionnaireResponse): Questionnaire {
    const { questionnaire } = response;
    
    const transformedQuestions: Question[] = questionnaire.questions.map((q: BackendQuestion) => {
      let questionType: 'text' | 'options' | 'scale' = 'text';
      let options: string[] | undefined;
      let optionValues: QuestionOptionValue[] | undefined;
      
      // Transform question type
      if (q.type === 'single_choice' || q.type === 'multiple_choice') {
        questionType = 'options';
        // Extract options from optionSetId
        if (q.optionSetId && q.optionSetId.options) {
          options = q.optionSetId.options.map(option => option.label.en);
          optionValues = q.optionSetId.options.map(option => ({
            label: option.label.en,
            value: option.value
          }));
        }
      }
      
      return {
        id: q._id,
        question: q.text.en,
        type: questionType,
        options,
        optionValues,
        placeholder: questionType === 'text' ? 'Enter your answer...' : undefined,
      };
    });
    
    return {
      id: questionnaire._id,
      title: questionnaire.title.en,
      description: questionnaire.description.en,
      questions: transformedQuestions,
      week: response.week,
    };
  }

  // Questionnaire methods
  async getNextQuestionnaire(): Promise<Questionnaire> {
    const response: QuestionnaireResponse = await this.makeRequest('/api/questionnaire/getNextQuestionnaireForUser', {
      method: 'GET',
    });
    
    return this.transformQuestionnaire(response);
  }

  async markQuestionnaireCompleted(questionnaireId: string): Promise<void> {
    return await this.makeRequest('/api/questionnaire/markQuestionnaireCompleted', {
      method: 'POST',
      body: JSON.stringify({ questionnaireId }),
    });
  }

  // Response methods
  async submitOrUpdateAnswer(
    questionId: string,
    answer: string,
    questionnaireId?: string
  ): Promise<void> {
    // For single_choice questions, we need to send the option value, not the label
    // But since we're displaying labels to users, we need to handle this transformation
    return await this.makeRequest('/api/response/submitOrUpdateAnswer', {
      method: 'POST',
      body: JSON.stringify({ 
        questionId, 
        answer,
        questionnaireId 
      }),
    });
  }
}

export const apiService = new ApiService();
export default apiService;
