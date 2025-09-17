import axios, { AxiosInstance, AxiosResponse } from 'axios';

const API_BASE_URL = 'http://localhost:3000';

// Create axios instance with default config
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // Reduced timeout for faster feedback
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Mock authentication for development
const mockAuth = {
  login: async (email: string, password: string) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check demo credentials
    if (email === 'admin@example.com' && password === 'password123') {
      return {
        user: {
          id: '1',
          email: 'admin@example.com',
          name: 'Admin User',
        },
        token: 'mock-jwt-token-' + Date.now(),
      };
    }
    
    throw new Error('Invalid credentials');
  },
};

// Auth API with fallback to mock
export const authAPI = {
  login: async (email: string, password: string) => {
    try {
      // Try real API first
      const response = await api.post('/auth/login', { email, password });
      return response.data;
    } catch (error: any) {
      // If API is not available, use mock authentication
      if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
        console.warn('Backend API not available, using mock authentication');
        return await mockAuth.login(email, password);
      }
      throw error;
    }
  },
  logout: () => {
    localStorage.removeItem('authToken');
    window.location.href = '/login';
  },
};

// Mock LinkedIn API for development
const mockLinkedInAPI = {
  login: async (credentials: { username: string; password: string }) => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    return { success: true, message: 'LinkedIn connection established' };
  },
  createAndPost: async (postData: {
    content: string;
    image?: File;
    scheduleTime?: string;
  }) => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    return { success: true, postId: 'mock-post-' + Date.now() };
  },
  processPostsFromSource: async (sourceData: any) => {
    await new Promise(resolve => setTimeout(resolve, 3000));
    return { success: true, processed: 5, failed: 0 };
  },
};

// LinkedIn API with fallback to mock
export const linkedInAPI = {
  login: async (credentials: { username: string; password: string }) => {
    try {
      const response = await api.post('/stagehand/loginToLinkedIn', credentials);
      return response.data;
    } catch (error: any) {
      if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
        console.warn('Backend API not available, using mock LinkedIn API');
        return await mockLinkedInAPI.login(credentials);
      }
      throw error;
    }
  },
  createAndPost: async (postData: {
    content: string;
    image?: File;
    scheduleTime?: string;
  }) => {
    try {
      const formData = new FormData();
      formData.append('content', postData.content);
      if (postData.image) {
        formData.append('image', postData.image);
      }
      if (postData.scheduleTime) {
        formData.append('scheduleTime', postData.scheduleTime);
      }

      const response = await api.post('/stagehand/createAndPostToLinkedIn', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error: any) {
      if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
        console.warn('Backend API not available, using mock LinkedIn API');
        return await mockLinkedInAPI.createAndPost(postData);
      }
      throw error;
    }
  },
  processPostsFromSource: async (sourceData: any) => {
    try {
      const response = await api.post('/stagehand/processPostsFromSource', sourceData);
      return response.data;
    } catch (error: any) {
      if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
        console.warn('Backend API not available, using mock LinkedIn API');
        return await mockLinkedInAPI.processPostsFromSource(sourceData);
      }
      throw error;
    }
  },
};

// Mock Google Sheets API for development
const mockSheetsAPI = {
  testConnection: async (sheetData: {
    spreadsheetId: string;
    sheetName: string;
  }) => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    return {
      data: [
        { content: 'Sample LinkedIn post 1', scheduleTime: '2024-01-15 10:00' },
        { content: 'Sample LinkedIn post 2', scheduleTime: '2024-01-15 14:00' },
        { content: 'Sample LinkedIn post 3', scheduleTime: '2024-01-15 18:00' },
      ],
    };
  },
  uploadAndProcessExcel: async (file: File) => {
    await new Promise(resolve => setTimeout(resolve, 2500));
    return {
      data: [
        { content: 'Excel post 1', scheduleTime: '2024-01-16 09:00' },
        { content: 'Excel post 2', scheduleTime: '2024-01-16 13:00' },
      ],
    };
  },
};

// Google Sheets API with fallback to mock
export const sheetsAPI = {
  testConnection: async (sheetData: {
    spreadsheetId: string;
    sheetName: string;
  }) => {
    try {
      const response = await api.post('/stagehand/testGoogleSheetsFlow', sheetData);
      return response.data;
    } catch (error: any) {
      if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
        console.warn('Backend API not available, using mock Sheets API');
        return await mockSheetsAPI.testConnection(sheetData);
      }
      throw error;
    }
  },
  uploadAndProcessExcel: async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post('/stagehand/uploadAndProcessExcel', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error: any) {
      if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
        console.warn('Backend API not available, using mock Sheets API');
        return await mockSheetsAPI.uploadAndProcessExcel(file);
      }
      throw error;
    }
  },
};

// General API with fallback
export const generalAPI = {
  getData: async () => {
    try {
      const response = await api.get('/api/getData');
      return response.data;
    } catch (error: any) {
      if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
        console.warn('Backend API not available, using mock data');
        return { data: 'Mock data response' };
      }
      throw error;
    }
  },
  createItem: async (data: any) => {
    try {
      const response = await api.post('/api/createItem', data);
      return response.data;
    } catch (error: any) {
      if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
        console.warn('Backend API not available, using mock response');
        return { success: true, id: 'mock-item-' + Date.now() };
      }
      throw error;
    }
  },
};

export default api;