import { create } from 'zustand';
import { authService, UserInfo, LoginRequest } from '../services/authService';

interface AuthState {
  user: UserInfo | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (credentials: LoginRequest) => Promise<boolean>;
  logout: () => void;
  loadUserFromStorage: () => void;
  getCurrentUser: () => Promise<void>;
  clearError: () => void;
  checkAuth: () => Promise<boolean>;
  
  // Role checks
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
  hasAllRoles: (roles: string[]) => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (credentials: LoginRequest): Promise<boolean> => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await authService.login(credentials);
      
      // Backend'den user info'yu ayrıca alalım
      try {
        const userInfo = await authService.getCurrentUser();
        set({
          user: userInfo,
          isAuthenticated: true,
          isLoading: false,
          error: null
        });
      } catch {
        // Eğer /auth/me başarısız olursa, login response'undan user info oluştur
        const userInfo: UserInfo = {
          id: 0,
          username: response.username,
          role: response.role,
          roles: [response.role],
          active: true
        };
        set({
          user: userInfo,
          isAuthenticated: true,
          isLoading: false,
          error: null
        });
      }
      
      return true;
    } catch (error: any) {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: error?.response?.data?.message || error?.message || 'Login failed'
      });
      return false;
    }
  },

  logout: () => {
    authService.logout();
    set({
      user: null,
      isAuthenticated: false,
      error: null
    });
  },

  loadUserFromStorage: () => {
    const user = authService.getStoredUser();
    const isAuthenticated = authService.isAuthenticated();
    
    set({
      user,
      isAuthenticated
    });
  },

  getCurrentUser: async () => {
    try {
      set({ isLoading: true, error: null });
      
      const user = await authService.getCurrentUser();
      authService.updateUserInfo(user);
      
      set({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null
      });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error?.response?.data?.message || 'Failed to load user info'
      });
      
      // If unauthorized, logout
      if (error?.response?.status === 401) {
        get().logout();
      }
    }
  },

  clearError: () => {
    set({ error: null });
  },

  checkAuth: async (): Promise<boolean> => {
    const token = authService.getToken();
    const storedUser = authService.getStoredUser();
    
    if (!token || !authService.isAuthenticated()) {
      set({
        user: null,
        isAuthenticated: false
      });
      return false;
    }

    // If we have a stored user and valid token, use it
    if (storedUser) {
      set({
        user: storedUser,
        isAuthenticated: true
      });
    }

    // Optionally refresh user info from server
    try {
      await get().getCurrentUser();
      return true;
    } catch {
      // If server call fails but token is valid, keep using stored user
      if (storedUser && authService.isAuthenticated()) {
        set({
          user: storedUser,
          isAuthenticated: true
        });
        return true;
      }
      return false;
    }
  },

  // Role checking methods
  hasRole: (role: string): boolean => {
    const { user } = get();
    return user?.role === role || user?.roles?.includes(role) || false;
  },

  hasAnyRole: (roles: string[]): boolean => {
    const { user } = get();
    if (!user?.role && !user?.roles) return false;
    
    // Check single role field
    if (user.role && roles.includes(user.role)) return true;
    
    // Check roles array
    if (user.roles) {
      return roles.some(role => user.roles!.includes(role));
    }
    
    return false;
  },

  hasAllRoles: (roles: string[]): boolean => {
    const { user } = get();
    if (!user?.role && !user?.roles) return false;
    
    // If only one role requested, check single role field
    if (roles.length === 1) {
      return user.role === roles[0] || (user.roles?.includes(roles[0]) || false);
    }
    
    // For multiple roles, check roles array
    if (!user.roles) return false;
    return roles.every(role => user.roles!.includes(role));
  }
}));