import createContextHook from '@nkzw/create-context-hook';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabaseAuth, AuthUser } from '@/services/supabase';
import { isConfigured } from '@/constants/config';

export const [AuthProvider, useAuth] = createContextHook(() => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthReady, setIsAuthReady] = useState(false);

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      if (!isConfigured.supabase) {
        // Supabase not configured - skip auth, allow offline mode
        setIsLoading(false);
        setIsAuthReady(true);
        return;
      }

      try {
        const { user: existingUser } = await supabaseAuth.getUser();
        setUser(existingUser);
      } catch {
        // No session or error
      } finally {
        setIsLoading(false);
        setIsAuthReady(true);
      }
    };

    void checkSession();
  }, []);

  const signUp = useCallback(async (email: string, password: string): Promise<{ error: string | null }> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabaseAuth.signUp(email, password);
      if (error) {
        return { error };
      }
      if (data?.user) {
        setUser(data.user);
      }
      return { error: null };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signIn = useCallback(async (email: string, password: string): Promise<{ error: string | null }> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabaseAuth.signIn(email, password);
      if (error) {
        return { error };
      }
      if (data?.user) {
        setUser(data.user);
      }
      return { error: null };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    await supabaseAuth.signOut();
    setUser(null);
  }, []);

  const resetPassword = useCallback(async (email: string): Promise<{ error: string | null }> => {
    return supabaseAuth.resetPassword(email);
  }, []);

  const isAuthenticated = !!user;
  const isSupabaseConfigured = isConfigured.supabase;

  return useMemo(() => ({
    user,
    isLoading,
    isAuthReady,
    isAuthenticated,
    isSupabaseConfigured,
    signUp,
    signIn,
    signOut,
    resetPassword,
  }), [user, isLoading, isAuthReady, isAuthenticated, isSupabaseConfigured, signUp, signIn, signOut, resetPassword]);
});
