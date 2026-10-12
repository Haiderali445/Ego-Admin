import { supabase } from '../supabase.client.js';
import { logger } from '../logger.js';

const getEnvVar = (key) => {
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
    return import.meta.env[key];
  }
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key];
  }
  return '';
};

// 2FA Security Storage Key for browser sessions
const TWO_FACTOR_SESSION_KEY = 'ego_admin_2fa_verified';

export class AuthService {
  constructor() {
    this.supabase = supabase;
  }

  /**
   * Step 1: Primary Authentication via Supabase GoTrue
   * Verifies user email & password in Supabase.
   */
  async loginWithPassword(email, password) {
    const start = performance.now();
    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      const duration = (performance.now() - start).toFixed(2);
      logger.morgan('POST', '/auth/login', 200, duration);
      logger.success('AUTH', `Step 1 Login successful for ${email}. Awaiting 2FA verification.`);

      return {
        user: data.user,
        session: data.session,
        requires2FA: true
      };
    } catch (error) {
      const duration = (performance.now() - start).toFixed(2);
      logger.morgan('POST', '/auth/login', 401, duration);
      logger.error('AUTH', 'Primary login failed', error);
      throw error;
    }
  }

  /**
   * Step 2: Two-Factor Authentication Verification
   * Validates the provided PIN against the environment secret (VITE_ADMIN_2FA_PIN).
   */
  verify2FA(providedPin) {
    const expectedPin = getEnvVar('VITE_ADMIN_2FA_PIN').trim();
    if (!expectedPin) {
      throw new Error('Two-Factor PIN is not configured. Set VITE_ADMIN_2FA_PIN before using this login flow.');
    }
    const cleanProvided = String(providedPin).trim();
    const cleanExpected = expectedPin;

    if (cleanProvided !== cleanExpected) {
      logger.warn('AUTH', '2FA code mismatch attempt.');
      throw new Error('Invalid Two-Factor Authentication security code.');
    }

    if (typeof window !== 'undefined' && window.sessionStorage) {
      window.sessionStorage.setItem(TWO_FACTOR_SESSION_KEY, 'true');
    }

    logger.success('AUTH', '2FA successfully verified. Full CRUD mutational access granted.');
    return true;
  }

  /**
   * Check if current session has verified 2FA
   */
  is2FAVerified() {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      return window.sessionStorage.getItem(TWO_FACTOR_SESSION_KEY) === 'true';
    }
    return false;
  }

  /**
   * Clear 2FA verification state
   */
  clear2FA() {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      window.sessionStorage.removeItem(TWO_FACTOR_SESSION_KEY);
    }
  }

  /**
   * Get currently active Supabase session
   */
  async getSession() {
    const { data: { session }, error } = await this.supabase.auth.getSession();
    if (error) throw error;
    return session;
  }

  /**
   * Get currently active user
   */
  async getUser() {
    const session = await this.getSession();
    return session?.user || null;
  }

  /**
   * Sign out: Revokes Supabase JWT and clears 2FA session
   */
  async logout() {
    this.clear2FA();
    const { error } = await this.supabase.auth.signOut();
    if (error) logger.error('AUTH', 'Error signing out from Supabase', error);
    logger.info('AUTH', 'Signed out successfully.');
    return true;
  }

  /**
   * Check whether user is fully authenticated (Valid Supabase JWT + 2FA verified)
   */
  async isFullyAuthenticated() {
    const session = await this.getSession();
    if (!session?.user) return false;
    return this.is2FAVerified();
  }

  /**
   * Mutation Guard: Throws error if not authenticated with valid JWT & 2FA
   * Applied automatically before any insert, update, delete, or reorder.
   */
  async assertMutationAuthorized() {
    const session = await this.getSession();
    if (!session?.user) {
      throw new Error('[UNAUTHORIZED] Active Supabase login session required to mutate records.');
    }
    if (!this.is2FAVerified()) {
      throw new Error('[2FA REQUIRED] Two-Factor Authentication code must be verified before modifying database.');
    }
    return session;
  }
}

export const authService = new AuthService();
