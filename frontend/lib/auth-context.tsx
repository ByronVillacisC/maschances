"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "@/lib/api";

interface User {
  id: string;
  email: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  role: string;
  phone?: string | null;
  avatar?: string | null;
  twoFactorEnabled?: boolean;
  createdAt?: string | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<{ requires2FA?: boolean }>;
  verify2FA: (code: string) => Promise<void>;
  register: (data: Record<string, any>) => Promise<void>;
  registerProvider: (data: Record<string, any>) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  isAuthenticated: boolean;
  hasRole: (roles: string | string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

function extractPayload(res: any) {
  return res?.data?.data ?? res?.data ?? null;
}

function extractUser(res: any): User | null {
  const payload = extractPayload(res);
  const u = payload?.user ?? payload;
  if (!u || typeof u !== "object" || !u.id) return null;
  return {
    ...u,
    name: u.name ?? ([u.firstName, u.lastName].filter(Boolean).join(" ") || u.email),
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pending2FA, setPending2FA] = useState<any>(false);
  const [skipInitialRefresh, setSkipInitialRefresh] = useState(false);

  const refreshUser = useCallback(async () => {
    try {
      const res = await api.get("/auth/me");
      setUser(extractUser(res));
      setError(null);
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 401 || status === 403) {
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!skipInitialRefresh) {
      refreshUser();
    } else {
      setLoading(false);
    }
  }, [refreshUser, skipInitialRefresh]);

  const login = useCallback(async (email: string, password: string) => {
    try {
      setError(null);
      const res = await api.post("/auth/login", { email, password });
      const payload = extractPayload(res);

      if (payload?.requires2FA) {
        setPending2FA(payload.userId ?? true);
        return { requires2FA: true };
      }

      const userData = extractUser(res);
      setUser(userData);
      setPending2FA(false);
      setSkipInitialRefresh(true);
      setLoading(false);

      return {};
    } catch (err: any) {
      const rawMsg = err?.response?.data?.message ?? err?.response?.data?.error;
      const msg = typeof rawMsg === "string" ? rawMsg : "Error al iniciar sesión";
      setError(msg);
      throw new Error(msg);
    }
  }, []);

  const verify2FA = useCallback(async (code: string) => {
    try {
      setError(null);
      const res = await api.post("/auth/2fa/verify", { userId: pending2FA, token: code });
      const userData = extractUser(res);

      setUser(userData);
      setPending2FA(false);
      setSkipInitialRefresh(true);
      setLoading(false);
    } catch (err: any) {
      const rawMsg = err?.response?.data?.message;
      const msg = typeof rawMsg === "string" ? rawMsg : "Código 2FA inválido";
      setError(msg);
      throw new Error(msg);
    }
  }, [pending2FA]);

  const register = useCallback(async (data: Record<string, any>) => {
    try {
      setError(null);
      const res = await api.post("/auth/register", data);
      const userData = extractUser(res);
      setUser(userData);
      setSkipInitialRefresh(true);
      setLoading(false);
    } catch (err: any) {
      const rawMsg = err?.response?.data?.message;
      const msg = typeof rawMsg === "string" ? rawMsg : "Error al registrarse";
      setError(msg);
      throw new Error(msg);
    }
  }, []);

  const registerProvider = useCallback(async (data: Record<string, any>) => {
    try {
      setError(null);
      const res = await api.post("/auth/register-provider", data);
      const payload = extractPayload(res);
      const userData = extractUser({ data: payload?.provider?.user ?? payload?.user ?? payload });
      setUser(userData);
      setSkipInitialRefresh(true);
      setLoading(false);
    } catch (err: any) {
      const rawMsg = err?.response?.data?.message;
      const msg = typeof rawMsg === "string" ? rawMsg : "Error al registrar proveedor";
      setError(msg);
      throw new Error(msg);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout");
    } catch { /* ignore */ }
    setUser(null);
    setPending2FA(false);
    setSkipInitialRefresh(false);
  }, []);

  const isAuthenticated = !!user;

  const hasRole = useCallback(
    (roles: string | string[]) => {
      if (!user) return false;
      const roleList = Array.isArray(roles) ? roles : [roles];
      return roleList.includes(user?.role ?? "");
    },
    [user]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        verify2FA,
        register,
        registerProvider,
        logout,
        refreshUser,
        isAuthenticated,
        hasRole
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export default AuthContext;
