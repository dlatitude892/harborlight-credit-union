import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { api, setToken, clearToken, hasToken } from '../api/client';
import type { User } from '../types';

export interface RegisterPayload {
  firstName: string;
  middleName?: string;
  lastName: string;
  dateOfBirth: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  password: string;
  ssnLast4: string;
  idType: string;
  idNumberLast4: string;
  employmentStatus: string;
  occupation?: string;
  sourceOfIncome?: string;
}

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterPayload) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshProfile = useCallback(async () => {
    if (!hasToken()) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const profile = await api.get<User>('/auth/profile');
      setUser(profile);
    } catch {
      clearToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  const login = useCallback(async (email: string, password: string) => {
    setError(null);
    try {
      const result = await api.post<{ token: string; user: User }>('/auth/login', { email, password });
      setToken(result.token);
      setUser(result.user);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to sign in';
      setError(message);
      throw err;
    }
  }, []);

  const register = useCallback(
    async (data: RegisterPayload) => {
      setError(null);
      try {
        const result = await api.post<{ token: string; user: User }>('/auth/register', data);
        setToken(result.token);
        setUser(result.user);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unable to create account';
        setError(message);
        throw err;
      }
    },
    []
  );

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, error, login, register, logout, refreshProfile }),
    [user, loading, error, login, register, logout, refreshProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
