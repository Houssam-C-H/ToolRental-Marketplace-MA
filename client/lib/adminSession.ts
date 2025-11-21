import { supabase } from './supabase';

interface AdminSession {
  id: string;
  email: string;
  name: string;
  role: string;
  session_token: string;
  expires_at: string;
}

class AdminSessionManager {
  private readonly SESSION_KEY = 'admin_session_token';
  private readonly EXPIRES_KEY = 'admin_session_expires';

  async storeSession(sessionData: AdminSession): Promise<void> {
    try {
      localStorage.setItem(this.SESSION_KEY, sessionData.session_token);
      localStorage.setItem(this.EXPIRES_KEY, sessionData.expires_at);
    } catch (error) {
      console.error('Error storing admin session:', error);
      throw error;
    }
  }

  // Get current session token
  getSessionToken(): string | null {
    return localStorage.getItem(this.SESSION_KEY);
  }

  isSessionExpired(): boolean {
    const expiresAt = localStorage.getItem(this.EXPIRES_KEY);
    if (!expiresAt) return true;

    const expirationDate = new Date(expiresAt);
    return new Date() > expirationDate;
  }

  async validateSession(): Promise<boolean> {
    const token = this.getSessionToken();
    
    if (!token || this.isSessionExpired()) {
      this.clearSession();
      return false;
    }

    try {
      const { data, error } = await supabase.rpc('admin_validate_session', {
        session_token: token
      });

      if (error) {
        console.error('Session validation error:', error);
        this.clearSession();
        return false;
      }

      return !!data;
    } catch (error) {
      console.error('Error validating session:', error);
      this.clearSession();
      return false;
    }
  }

  clearSession(): void {
    const token = this.getSessionToken();
    
    if (token) {
      supabase.rpc('admin_logout', { session_token: token }).catch(console.error);
    }

    localStorage.removeItem(this.SESSION_KEY);
    localStorage.removeItem(this.EXPIRES_KEY);
    localStorage.removeItem('adminEmail');
    localStorage.removeItem('adminName');
    localStorage.removeItem('adminRole');
    localStorage.removeItem('adminLoginTime');
    localStorage.removeItem('isAdmin');
  }

  isLoggedIn(): boolean {
    return !!this.getSessionToken() && !this.isSessionExpired();
  }
}

export const adminSession = new AdminSessionManager();
export type { AdminSession };

