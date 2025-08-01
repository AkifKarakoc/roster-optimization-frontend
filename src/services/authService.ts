import { apiService } from './api';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  username: string;
  role: string;  // Backend'de string olarak geliyor
  expiresIn: number;
}

export interface UserInfo {
  id: number;
  username: string;
  role: string;  // Backend'de string olarak geliyor
  active: boolean;
  // Frontend'de roles array'ine çevireceğiz
  roles?: string[];
}

const TOKEN_KEY = 'roster_auth_token';
const REFRESH_TOKEN_KEY = 'roster_refresh_token';
const USER_KEY = 'roster_user_info';

export const authService = {
  // Login
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await apiService.post<LoginResponse>('/auth/login', credentials);
    
    // Store tokens and user info
    if (response.token) {
      localStorage.setItem(TOKEN_KEY, response.token);
      
      // Convert backend response to UserInfo format
      const userInfo: UserInfo = {
        id: 0, // Backend'de login response'unda id yok, /auth/me'den alacağız
        username: response.username,
        role: response.role,
        roles: [response.role], // String'i array'e çevir
        active: true
      };
      
      localStorage.setItem(USER_KEY, JSON.stringify(userInfo));
    }
    
    return response;
  },

  // Get current user info
  getCurrentUser: async (): Promise<UserInfo> => {
    const response = await apiService.get<UserInfo>('/auth/me');
    
    // Backend response'unu frontend format'ına çevir
    const userInfo: UserInfo = {
      ...response,
      roles: [response.role] // String role'ü array'e çevir
    };
    
    return userInfo;
  },

  // Logout
  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    // Redirect to login
    window.location.href = '/login';
  },

  // Get stored token
  getToken: (): string | null => {
    return localStorage.getItem(TOKEN_KEY);
  },

  // Get stored refresh token
  getRefreshToken: (): string | null => {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  // Get stored user info
  getStoredUser: (): UserInfo | null => {
    const userStr = localStorage.getItem(USER_KEY);
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    const token = authService.getToken();
    if (!token) return false;

    try {
      // Basic JWT expiration check (decode without verification)
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp > currentTime;
    } catch {
      return false;
    }
  },

  // Check if user has specific role
  hasRole: (role: string): boolean => {
    const user = authService.getStoredUser();
    return user?.role === role || user?.roles?.includes(role) || false;
  },

  // Check if user has any of the specified roles
  hasAnyRole: (roles: string[]): boolean => {
    const user = authService.getStoredUser();
    if (!user?.role && !user?.roles) return false;
    
    // Check single role field
    if (user.role && roles.includes(user.role)) return true;
    
    // Check roles array
    if (user.roles) {
      return roles.some(role => user.roles!.includes(role));
    }
    
    return false;
  },

  // Check if user has all specified roles  
  hasAllRoles: (roles: string[]): boolean => {
    const user = authService.getStoredUser();
    if (!user?.role && !user?.roles) return false;
    
    // If only one role requested, check single role field
    if (roles.length === 1) {
      return user.role === roles[0] || (user.roles?.includes(roles[0]) || false);
    }
    
    // For multiple roles, check roles array
    if (!user.roles) return false;
    return roles.every(role => user.roles!.includes(role));
  },

  // Update stored user info
  updateUserInfo: (user: UserInfo) => {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  // Refresh token if needed
  refreshTokenIfNeeded: async (): Promise<boolean> => {
    const token = authService.getToken();
    const refreshToken = authService.getRefreshToken();
    
    if (!token || !refreshToken) return false;

    try {
      // Check if token is close to expiring (within 5 minutes)
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      const timeUntilExpiry = payload.exp - currentTime;
      
      if (timeUntilExpiry < 300) { // 5 minutes
        // Implement refresh logic if backend supports it
        // const response = await apiService.post<LoginResponse>('/auth/refresh', { refreshToken });
        // localStorage.setItem(TOKEN_KEY, response.token);
        // return true;
      }
      
      return true;
    } catch {
      return false;
    }
  }
};