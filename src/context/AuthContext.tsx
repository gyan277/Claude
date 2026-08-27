import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { supabase } from '../services/supabaseClient';
import type { User as SupabaseUser } from '@supabase/supabase-js';

export type UserRole = 'citizen' | 'assembly' | 'minister';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  district?: string;
  verified: boolean;
  joinedAt: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  signUp: (details: { name: string; email: string; password: string; district?: string; role?: UserRole }) => Promise<AuthUser>;
  logout: () => void;
  markVerified: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user profile from database
  const fetchUserProfile = async (supabaseUser: SupabaseUser): Promise<AuthUser | null> => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();

      if (error) throw error;
      if (!data) return null;

      return {
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role as UserRole,
        district: data.district,
        verified: data.verified,
        joinedAt: data.created_at,
      };
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  };

  // Initialize auth state on mount
  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchUserProfile(session.user).then(setUser);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const profile = await fetchUserProfile(session.user);
        setUser(profile);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login: AuthContextValue['login'] = async (email, password) => {
    try {
      console.log('Starting login process...', { email });
      
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        console.error('Login auth error:', authError);
        throw authError;
      }
      
      if (!authData.user) {
        console.error('No user returned from login');
        throw new Error('No user returned');
      }

      console.log('Auth successful, fetching profile...');

      const profile = await fetchUserProfile(authData.user);
      if (!profile) {
        console.error('Profile not found for user:', authData.user.id);
        throw new Error('Profile not found');
      }

      console.log('Login successful:', profile);
      setUser(profile);
      return profile;
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Provide user-friendly error messages
      if (error.message?.includes('Invalid login credentials')) {
        throw new Error('Invalid email or password. Please try again.');
      }
      if (error.message?.includes('Email not confirmed')) {
        throw new Error('Please check your email to confirm your account.');
      }
      
      throw new Error(error.message || 'Could not sign in. Please check your credentials and try again.');
    }
  };

  const signUp: AuthContextValue['signUp'] = async ({ name, email, password, district, role = 'citizen' }) => {
    try {
      console.log('Starting signup process...', { email, name, district, role });
      
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            district,
            role,
          },
        },
      });

      if (authError) {
        console.error('Auth signup error:', authError);
        throw authError;
      }
      
      if (!authData.user) {
        console.error('No user returned from auth');
        throw new Error('No user returned');
      }

      console.log('Auth user created:', authData.user.id);

      // Create user profile
      const { data: profileData, error: profileError } = await supabase
        .from('users')
        .insert([
          {
            id: authData.user.id,
            email,
            name,
            district: district || '',
            role,
            verified: false,
            password_hash: '', // Supabase Auth handles passwords
          },
        ])
        .select()
        .single();

      if (profileError) {
        console.error('Profile creation error:', profileError);
        // If profile creation fails, delete the auth user
        await supabase.auth.admin.deleteUser(authData.user.id);
        throw profileError;
      }

      console.log('Profile created successfully');

      const profile: AuthUser = {
        id: profileData.id,
        name: profileData.name,
        email: profileData.email,
        role: profileData.role as UserRole,
        district: profileData.district,
        verified: profileData.verified,
        joinedAt: profileData.created_at,
      };

      setUser(profile);
      return profile;
    } catch (error: any) {
      console.error('Sign up error:', error);
      
      // Provide user-friendly error messages
      if (error.message?.includes('already registered')) {
        throw new Error('This email is already registered. Please sign in instead.');
      }
      if (error.message?.includes('Invalid email')) {
        throw new Error('Please enter a valid email address.');
      }
      if (error.message?.includes('Password')) {
        throw new Error('Password must be at least 6 characters long.');
      }
      
      throw new Error(error.message || 'Could not create account. Please try again.');
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const markVerified = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('users')
        .update({ verified: true })
        .eq('id', user.id);

      if (error) throw error;

      setUser({ ...user, verified: true });
    } catch (error) {
      console.error('Mark verified error:', error);
    }
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
