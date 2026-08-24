import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

export type UserRole = 'citizen' | 'assembly' | 'minister';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  district?: string;
  verified: boolean;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  signUp: (details: { name: string; email: string; password: string; district?: string; role?: UserRole }) => Promise<AuthUser>;
  logout: () => void;
  markVerified: () => void;
}

const STORAGE_KEY = 'dodow-amanmuo:session';

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function readStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setUser(readStoredUser());
    setLoading(false);
  }, []);

  const persist = (next: AuthUser | null) => {
    setUser(next);
    if (next) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const login: AuthContextValue['login'] = async (email, _password) => {
    const next: AuthUser = {
      id: crypto.randomUUID(),
      name: email.split('@')[0],
      email,
      role: 'citizen',
      verified: true,
    };
    persist(next);
    return next;
  };

  const signUp: AuthContextValue['signUp'] = async ({ name, email, district, role = 'citizen' }) => {
    const next: AuthUser = {
      id: crypto.randomUUID(),
      name,
      email,
      role,
      district,
      verified: false,
    };
    persist(next);
    return next;
  };

  const logout = () => persist(null);

  const markVerified = () => {
    if (!user) return;
    persist({ ...user, verified: true });
  };

  const value = useMemo(
    () => ({ user, loading, login, signUp, logout, markVerified }),
    [user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
