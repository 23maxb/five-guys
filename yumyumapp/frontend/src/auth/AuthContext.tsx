// src/auth/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";

type AuthContextValue = {
  token: string | null;
  authed: boolean;
  loading: boolean;
  login: (t: string) => void;
  logout: () => void;
};

// Use undefined so TS forces a provider; no "possibly null" everywhere.
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Load token once (optional)
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    setToken(savedToken);
    setLoading(false);
  }, []);

  const login = (t: string) => {
    localStorage.setItem("token", t);
    setToken(t);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
  };

  const value: AuthContextValue = {
    token,
    authed: !!token,
    loading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Safe hook: throws if provider missing (helps catch wiring issues fast)
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within <AuthProvider>");
  }
  return ctx;
}
