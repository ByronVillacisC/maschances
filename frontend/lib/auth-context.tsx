"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "@/lib/api";

interface User {
  id: string;
  email: string;
  name: string;
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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pending2FA, setPending2FA] = useState(false);
  const [skipInitialRefresh, setSkipInitialRefresh] = useState(false);

  const refreshUser = useCallback(async () => {
    try {
      const res = await api.get("/auth/me");
      setUser(res?.data?.user ?? res?.data ?? null);
      setError(null);
    } catch (err: any) {
      // Solo limpia el usuario si es un error real de autenticación
      // No en caso de red caída o backend no disponible
      const status = err?.response?.status;
      if (status === 401 || status === 403) {
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // CRÍTICO: No refrescar inmediatamente si viene de login
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
      
      if (res?.data?.requires2FA) {
        setPending2FA(true);
        return { requires2FA: true };
      }
      
      const userData = res?.data?.user ?? res?.data ?? null;
      
      // CRÍTICO: Setear el usuario INMEDIATAMENTE y marcar que venimos de login
      setUser(userData);
      setPending2FA(false);
      setSkipInitialRefresh(true);
      setLoading(false);
      
      return {};
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.response?.data?.error ?? "Error al iniciar sesión";
      setError(msg);
      throw new Error(msg);
    }
  }, []);

  const verify2FA = useCallback(async (code: string) => {
    try {
      setError(null);
      const res = await api.post("/auth/2fa/verify", { userId: pending2FA, token: code });
      
      const userData = res?.data?.user ?? res?.data ?? null;
      
      // CRÍTICO: Setear el usuario INMEDIATAMENTE y marcar que venimos de login
      setUser(userData);
      setPending2FA(false);
      setSkipInitialRefresh(true);
      setLoading(false);
      
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? "Código 2FA inválido";
      setError(msg);
      throw new Error(msg);
    }
  }, [pending2FA]);

  const register = useCallback(async (data: Record<string, any>) => {
    try {
      setError(null);
      const res = await api.post("/auth/register", data);
      const userData = res?.data?.user ?? res?.data ?? null;
      setUser(userData);
      setSkipInitialRefresh(true);
      setLoading(false);
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? "Error al registrarse";
      setError(msg);
      throw new Error(msg);
    }
  }, []);

  const registerProvider = useCallback(async (data: Record<string, any>) => {
    try {
      setError(null);
      const res = await api.post("/auth/register-provider", data);
      const userData = res?.data?.provider?.user ?? res?.data?.user ?? res?.data ?? null;
      setUser(userData);
      setSkipInitialRefresh(true);
      setLoading(false);
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? "Error al registrar proveedor";
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