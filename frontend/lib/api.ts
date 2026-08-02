import axios from "axios";

const api = axios.create({
  baseURL: "/api/v1",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para agregar X-Idempotency-Key en operaciones de escritura
api.interceptors.request.use((config: any) => {
  const method = config?.method?.toUpperCase?.() ?? "";
  if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
    if (!config.headers?.["X-Idempotency-Key"]) {
      config.headers = config.headers ?? {};
      config.headers["X-Idempotency-Key"] = crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
    }
  }
  return config;
});

// Interceptor para manejar errores globalmente
api.interceptors.response.use(
  (response: any) => response,
  (error: any) => {
    const status = error?.response?.status;
    
    // Silently handle 502 (backend not available)
    if (status === 502) {
      return Promise.reject(error);
    }
    
    // Solo redirige a login si NO estás en login/register
    if (status === 401) {
      if (typeof window !== "undefined") {
        const path = window?.location?.pathname ?? "";
        // Evita loop infinito
        if (!path.includes("/login") && !path.includes("/register") && !path.includes("/register-provider")) {
          // Espera un frame para evitar race conditions
          setTimeout(() => {
            window.location.href = "/login";
          }, 100);
        }
      }
    }
    
    return Promise.reject(error);
  }
);

export { api };
export default api;