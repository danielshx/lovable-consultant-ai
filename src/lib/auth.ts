// Mock authentication utilities

export interface MockUser {
  email: string;
  name: string;
}

const AUTH_KEY = 'mock_auth_user';

export const mockAuth = {
  login: (email: string, password: string): MockUser | null => {
    // Simple mock validation
    if (email && password.length >= 6) {
      const user = {
        email,
        name: email === 'anna.schmidt@consulting.eu' ? 'Dr. Anna Schmidt' : email.split('@')[0],
      };
      localStorage.setItem(AUTH_KEY, JSON.stringify(user));
      return user;
    }
    return null;
  },

  signup: (email: string, password: string): MockUser | null => {
    // Mock signup - same as login for this demo
    if (email && password.length >= 6) {
      const user = {
        email,
        name: email.split('@')[0],
      };
      localStorage.setItem(AUTH_KEY, JSON.stringify(user));
      return user;
    }
    return null;
  },

  logout: () => {
    localStorage.removeItem(AUTH_KEY);
  },

  getCurrentUser: (): MockUser | null => {
    const userStr = localStorage.getItem(AUTH_KEY);
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  },

  isAuthenticated: (): boolean => {
    return mockAuth.getCurrentUser() !== null;
  },
};
