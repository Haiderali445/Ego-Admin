import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '../core/auth/auth.service.js';
import { supabase } from '../core/supabase.client.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [step2FA, setStep2FA] = useState(false);
  const [is2FAVerified, setIs2FAVerified] = useState(false);

  useEffect(() => {
    // 1. Initial check
    authService.getSession().then((activeSession) => {
      setSession(activeSession);
      setUser(activeSession?.user || null);
      setIs2FAVerified(authService.is2FAVerified());
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });

    // 2. Listen to GoTrue events
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
      setUser(currentSession?.user || null);
      setIs2FAVerified(authService.is2FAVerified());
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  /**
   * Step 1: Login with Supabase Email/Password
   */
  const login = async (email, password) => {
    const result = await authService.loginWithPassword(email, password);
    setUser(result.user);
    setSession(result.session);
    setStep2FA(true); // Direct to 2FA PIN prompt
    return result;
  };

  /**
   * Step 2: Verify 2FA PIN
   */
  const verify2FA = (pin) => {
    const isValid = authService.verify2FA(pin);
    if (isValid) {
      setIs2FAVerified(true);
      setStep2FA(false);
    }
    return isValid;
  };

  /**
   * Logout
   */
  const logout = async () => {
    await authService.logout();
    setUser(null);
    setSession(null);
    setStep2FA(false);
    setIs2FAVerified(false);
  };

  const isFullyAuthenticated = !!user && is2FAVerified;

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        step2FA,
        is2FAVerified,
        isFullyAuthenticated,
        login,
        verify2FA,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
