import axios from 'axios';

// Types for API responses
export interface Game {
  id: number;
  name: string;
  slug: string;
  provider: string;
  category: string;
  gameType: 'slot' | 'table' | 'live' | 'instant';
  thumbnailUrl?: string;
  minBet: number;
  maxBet: number;
  rtp: number;
  volatility: 'low' | 'medium' | 'high';
  hasJackpot: boolean;
  jackpotAmount?: number;
  isActive: boolean;
  isFeatured: boolean;
  isNew: boolean;
  isPopular: boolean;
}

export interface User {
  id: number;
  username: string;
  email: string;
  goldCoins: number;
  sweepsCoins: number;
  level: number;
  experiencePoints: number;
  vipTier: string;
  isAuthenticated: boolean;
  firstName?: string;
  lastName?: string;
  country?: string;
  kycStatus: 'pending' | 'approved' | 'rejected';
  registrationDate: string;
  lastLogin?: string;
}

export interface Transaction {
  id: number;
  userId: number;
  type: 'deposit' | 'withdrawal' | 'bet' | 'win' | 'bonus';
  amount: number;
  currency: 'gold' | 'sweeps';
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
}

// Base API configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('casino_auth_token');
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
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('casino_auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API Service functions
export const casinoApi = {
  // Games API
  async getGames(filters?: {
    category?: string;
    provider?: string;
    featured?: boolean;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<ApiResponse<Game[]>> {
    try {
      const response = await apiClient.get('/games', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Error fetching games:', error);
      throw error;
    }
  },

  async getGame(id: number): Promise<ApiResponse<Game>> {
    try {
      const response = await apiClient.get(`/games/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching game:', error);
      throw error;
    }
  },

  async getFeaturedGames(): Promise<ApiResponse<Game[]>> {
    try {
      const response = await apiClient.get('/games/featured');
      return response.data;
    } catch (error) {
      console.error('Error fetching featured games:', error);
      throw error;
    }
  },

  // User API
  async getCurrentUser(): Promise<ApiResponse<User>> {
    try {
      const response = await apiClient.get('/user/profile');
      return response.data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  },

  async updateUserProfile(data: Partial<User>): Promise<ApiResponse<User>> {
    try {
      const response = await apiClient.put('/user/profile', data);
      return response.data;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  },

  async getUserBalance(): Promise<ApiResponse<{ goldCoins: number; sweepsCoins: number }>> {
    try {
      const response = await apiClient.get('/user/balance');
      return response.data;
    } catch (error) {
      console.error('Error fetching user balance:', error);
      throw error;
    }
  },

  // Transactions API
  async getUserTransactions(filters?: {
    type?: string;
    currency?: string;
    limit?: number;
    offset?: number;
  }): Promise<ApiResponse<Transaction[]>> {
    try {
      const response = await apiClient.get('/user/transactions', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Error fetching transactions:', error);
      throw error;
    }
  },

  async createDeposit(amount: number, currency: 'gold' | 'sweeps', method: string): Promise<ApiResponse<Transaction>> {
    try {
      const response = await apiClient.post('/transactions/deposit', {
        amount,
        currency,
        method,
      });
      return response.data;
    } catch (error) {
      console.error('Error creating deposit:', error);
      throw error;
    }
  },

  async createWithdrawal(amount: number, currency: 'sweeps', method: string): Promise<ApiResponse<Transaction>> {
    try {
      const response = await apiClient.post('/transactions/withdrawal', {
        amount,
        currency,
        method,
      });
      return response.data;
    } catch (error) {
      console.error('Error creating withdrawal:', error);
      throw error;
    }
  },

  // Game Sessions API
  async startGameSession(gameId: number, betAmount: number, currency: 'gold' | 'sweeps'): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.post('/game-sessions/start', {
        gameId,
        betAmount,
        currency,
      });
      return response.data;
    } catch (error) {
      console.error('Error starting game session:', error);
      throw error;
    }
  },

  async endGameSession(sessionId: number, winAmount: number): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.post(`/game-sessions/${sessionId}/end`, {
        winAmount,
      });
      return response.data;
    } catch (error) {
      console.error('Error ending game session:', error);
      throw error;
    }
  },

  // Statistics API
  async getGameStats(gameId: number): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.get(`/games/${gameId}/stats`);
      return response.data;
    } catch (error) {
      console.error('Error fetching game stats:', error);
      throw error;
    }
  },

  async getUserStats(): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.get('/user/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching user stats:', error);
      throw error;
    }
  },

  // Authentication API
  async login(email: string, password: string): Promise<ApiResponse<{ token: string; user: User }>> {
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      if (response.data.success && response.data.data?.token) {
        localStorage.setItem('casino_auth_token', response.data.data.token);
      }
      return response.data;
    } catch (error) {
      console.error('Error logging in:', error);
      throw error;
    }
  },

  async register(userData: {
    username: string;
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    country?: string;
  }): Promise<ApiResponse<{ token: string; user: User }>> {
    try {
      const response = await apiClient.post('/auth/register', userData);
      if (response.data.success && response.data.data?.token) {
        localStorage.setItem('casino_auth_token', response.data.data.token);
      }
      return response.data;
    } catch (error) {
      console.error('Error registering:', error);
      throw error;
    }
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.error('Error logging out:', error);
    } finally {
      localStorage.removeItem('casino_auth_token');
    }
  },

  // Utilities
  isAuthenticated(): boolean {
    return !!localStorage.getItem('casino_auth_token');
  },

  getAuthToken(): string | null {
    return localStorage.getItem('casino_auth_token');
  },
};

export default casinoApi;
