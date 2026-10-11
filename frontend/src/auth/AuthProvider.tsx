import { useState, useEffect, useCallback, ReactNode } from 'react';
import { AuthContext, AuthUser } from './AuthContext';
import { DevLoginPage } from './DevLoginPage';
import api from '../services/api';
import { getAccessToken, setAccessToken } from './tokenStore';

interface AuthProviderProps {
  children: ReactNode;
}

const AUTH_MODE = import.meta.env.VITE_AUTH_MODE || 'dev';

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCurrentUser = useCallback(async () => {
    try {
      const response = await api.get('/auth/me');
      setUser(response.data);
    } catch {
      setAccessToken(null);
      setUser(null);
    }
  }, []);

  useEffect(() => {
    if (getAccessToken()) {
      fetchCurrentUser().finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [fetchCurrentUser]);

  const handleDevLogin = async (token: string) => {
    setAccessToken(token);
    await fetchCurrentUser();
  };

  const login = useCallback(() => {
    if (AUTH_MODE === 'oidc') {
      const authority = import.meta.env.VITE_OIDC_AUTHORITY || 'https://identity.intra.pse.pl';
      const clientId = import.meta.env.VITE_OIDC_CLIENT_ID || 'skill-matrix';
      const redirectUri = `${window.location.origin}/auth/callback`;
      const scope = 'openid email profile offline_access skill-matrix';

      const url = `${authority}/connect/authorize?` +
        `client_id=${encodeURIComponent(clientId)}` +
        `&redirect_uri=${encodeURIComponent(redirectUri)}` +
        `&response_type=code` +
        `&scope=${encodeURIComponent(scope)}` +
        `&response_mode=query`;

      window.location.href = url;
    }
  }, []);

  const logout = useCallback(() => {
    setAccessToken(null);
    setUser(null);
  }, []);

  const isAuthenticated = user !== null;
  const isAdmin = user?.role === 'ADMIN';

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated && AUTH_MODE === 'dev') {
    return <DevLoginPage onLogin={handleDevLogin} />;
  }

  if (!isAuthenticated && AUTH_MODE === 'oidc') {
    login();
    return null;
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isAdmin, isLoading, login, logout, getAccessToken }}>
      {children}
    </AuthContext.Provider>
  );
}
