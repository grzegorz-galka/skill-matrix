import { createContext, useContext } from 'react';

export interface AuthUser {
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

export interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: () => void;
  logout: () => void;
  getAccessToken: () => string | null;
}

export const AuthContext = createContext<AuthContextValue>({
  user: null,
  isAuthenticated: false,
  isAdmin: false,
  isLoading: true,
  login: () => {},
  logout: () => {},
  getAccessToken: () => null,
});

export function useAuth() {
  return useContext(AuthContext);
}
