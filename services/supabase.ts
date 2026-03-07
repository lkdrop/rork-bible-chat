import AsyncStorage from '@react-native-async-storage/async-storage';
import { CONFIG, isConfigured } from '@/constants/config';

// =====================================================
// SUPABASE CLIENT - Lightweight REST wrapper
// =====================================================
// Usa a REST API do Supabase diretamente para evitar
// dependências pesadas do @supabase/supabase-js
// =====================================================

const headers = () => ({
  'apikey': CONFIG.SUPABASE_ANON_KEY,
  'Content-Type': 'application/json',
  'Prefer': 'return=representation',
});

const authHeaders = async () => {
  const token = await AsyncStorage.getItem('supabase_access_token');
  return {
    ...headers(),
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
};

// ---- AUTH ----

export interface AuthUser {
  id: string;
  email: string;
  created_at: string;
}

export interface AuthSession {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  user: AuthUser;
}

const AUTH_URL = `${CONFIG.SUPABASE_URL}/auth/v1`;
const REST_URL = `${CONFIG.SUPABASE_URL}/rest/v1`;

export const supabaseAuth = {
  async signUp(email: string, password: string): Promise<{ data: AuthSession | null; error: string | null }> {
    if (!isConfigured.supabase) {
      return { data: null, error: 'Supabase não configurado. Adicione suas chaves em constants/config.ts' };
    }

    try {
      const res = await fetch(`${AUTH_URL}/signup`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        return { data: null, error: data.error_description || data.msg || 'Erro ao criar conta' };
      }

      if (data.access_token) {
        await AsyncStorage.setItem('supabase_access_token', data.access_token);
        await AsyncStorage.setItem('supabase_refresh_token', data.refresh_token);
      }

      return { data, error: null };
    } catch (e) {
      return { data: null, error: 'Erro de conexão. Verifique sua internet.' };
    }
  },

  async signIn(email: string, password: string): Promise<{ data: AuthSession | null; error: string | null }> {
    if (!isConfigured.supabase) {
      return { data: null, error: 'Supabase não configurado. Adicione suas chaves em constants/config.ts' };
    }

    try {
      const res = await fetch(`${AUTH_URL}/token?grant_type=password`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        return { data: null, error: data.error_description || data.msg || 'Email ou senha incorretos' };
      }

      await AsyncStorage.setItem('supabase_access_token', data.access_token);
      await AsyncStorage.setItem('supabase_refresh_token', data.refresh_token);

      return { data, error: null };
    } catch (e) {
      return { data: null, error: 'Erro de conexão. Verifique sua internet.' };
    }
  },

  async signOut(): Promise<void> {
    try {
      const token = await AsyncStorage.getItem('supabase_access_token');
      if (token) {
        await fetch(`${AUTH_URL}/logout`, {
          method: 'POST',
          headers: {
            ...headers(),
            'Authorization': `Bearer ${token}`,
          },
        });
      }
    } catch {
      // Ignore logout errors
    } finally {
      await AsyncStorage.removeItem('supabase_access_token');
      await AsyncStorage.removeItem('supabase_refresh_token');
    }
  },

  async getUser(): Promise<{ user: AuthUser | null; error: string | null }> {
    if (!isConfigured.supabase) {
      return { user: null, error: 'Supabase não configurado' };
    }

    const token = await AsyncStorage.getItem('supabase_access_token');
    if (!token) {
      return { user: null, error: null };
    }

    try {
      const res = await fetch(`${AUTH_URL}/user`, {
        headers: {
          ...headers(),
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        // Token expired, try to refresh
        const refreshed = await supabaseAuth.refreshSession();
        if (!refreshed) {
          await AsyncStorage.removeItem('supabase_access_token');
          await AsyncStorage.removeItem('supabase_refresh_token');
          return { user: null, error: null };
        }
        // Retry with new token
        const newToken = await AsyncStorage.getItem('supabase_access_token');
        const retryRes = await fetch(`${AUTH_URL}/user`, {
          headers: {
            ...headers(),
            'Authorization': `Bearer ${newToken}`,
          },
        });
        if (!retryRes.ok) {
          return { user: null, error: 'Sessão expirada' };
        }
        const user = await retryRes.json();
        return { user, error: null };
      }

      const user = await res.json();
      return { user, error: null };
    } catch {
      return { user: null, error: 'Erro de conexão' };
    }
  },

  async refreshSession(): Promise<boolean> {
    const refreshToken = await AsyncStorage.getItem('supabase_refresh_token');
    if (!refreshToken) return false;

    try {
      const res = await fetch(`${AUTH_URL}/token?grant_type=refresh_token`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (!res.ok) return false;

      const data = await res.json();
      await AsyncStorage.setItem('supabase_access_token', data.access_token);
      await AsyncStorage.setItem('supabase_refresh_token', data.refresh_token);
      return true;
    } catch {
      return false;
    }
  },

  async resetPassword(email: string): Promise<{ error: string | null }> {
    if (!isConfigured.supabase) {
      return { error: 'Supabase não configurado' };
    }

    try {
      const res = await fetch(`${AUTH_URL}/recover`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const data = await res.json();
        return { error: data.error_description || 'Erro ao enviar email' };
      }

      return { error: null };
    } catch {
      return { error: 'Erro de conexão' };
    }
  },
};

// ---- DATABASE (REST API) ----

export const supabaseDB = {
  async select<T>(table: string, query?: string): Promise<{ data: T[] | null; error: string | null }> {
    if (!isConfigured.supabase) {
      return { data: null, error: 'Supabase não configurado' };
    }

    try {
      const url = `${REST_URL}/${table}${query ? `?${query}` : ''}`;
      const res = await fetch(url, {
        headers: await authHeaders(),
      });

      if (!res.ok) {
        const err = await res.json();
        return { data: null, error: err.message || 'Erro ao buscar dados' };
      }

      const data = await res.json();
      return { data, error: null };
    } catch {
      return { data: null, error: 'Erro de conexão' };
    }
  },

  async insert<T>(table: string, record: Partial<T>): Promise<{ data: T[] | null; error: string | null }> {
    if (!isConfigured.supabase) {
      return { data: null, error: 'Supabase não configurado' };
    }

    try {
      const res = await fetch(`${REST_URL}/${table}`, {
        method: 'POST',
        headers: await authHeaders(),
        body: JSON.stringify(record),
      });

      if (!res.ok) {
        const err = await res.json();
        return { data: null, error: err.message || 'Erro ao inserir dados' };
      }

      const data = await res.json();
      return { data, error: null };
    } catch {
      return { data: null, error: 'Erro de conexão' };
    }
  },

  async update<T>(table: string, query: string, updates: Partial<T>): Promise<{ data: T[] | null; error: string | null }> {
    if (!isConfigured.supabase) {
      return { data: null, error: 'Supabase não configurado' };
    }

    try {
      const res = await fetch(`${REST_URL}/${table}?${query}`, {
        method: 'PATCH',
        headers: await authHeaders(),
        body: JSON.stringify(updates),
      });

      if (!res.ok) {
        const err = await res.json();
        return { data: null, error: err.message || 'Erro ao atualizar dados' };
      }

      const data = await res.json();
      return { data, error: null };
    } catch {
      return { data: null, error: 'Erro de conexão' };
    }
  },

  async delete(table: string, query: string): Promise<{ error: string | null }> {
    if (!isConfigured.supabase) {
      return { error: 'Supabase não configurado' };
    }

    try {
      const res = await fetch(`${REST_URL}/${table}?${query}`, {
        method: 'DELETE',
        headers: await authHeaders(),
      });

      if (!res.ok) {
        const err = await res.json();
        return { error: err.message || 'Erro ao deletar dados' };
      }

      return { error: null };
    } catch {
      return { error: 'Erro de conexão' };
    }
  },

  async upsert<T>(table: string, record: Partial<T>, onConflict?: string): Promise<{ data: T[] | null; error: string | null }> {
    if (!isConfigured.supabase) {
      return { data: null, error: 'Supabase não configurado' };
    }

    try {
      const hdrs = await authHeaders();
      hdrs['Prefer'] = 'resolution=merge-duplicates,return=representation';
      const url = onConflict ? `${REST_URL}/${table}?on_conflict=${onConflict}` : `${REST_URL}/${table}`;

      const res = await fetch(url, {
        method: 'POST',
        headers: hdrs,
        body: JSON.stringify(record),
      });

      if (!res.ok) {
        const err = await res.json();
        return { data: null, error: err.message || 'Erro ao salvar dados' };
      }

      const data = await res.json();
      return { data, error: null };
    } catch {
      return { data: null, error: 'Erro de conexão' };
    }
  },
};
