import { isTokenExpired, clearAuthTokens } from "./auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

type RequestOptions = {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
};

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function getBearerToken(): string | null {
  if (typeof window === "undefined") return null;
  const token =
    getCookie("noojoro_token") ||
    localStorage.getItem("staff_token") ||
    localStorage.getItem("bar_staff_token") ||
    localStorage.getItem("celebrant_token") ||
    null;

  if (token && isTokenExpired(token)) {
    clearAuthTokens();
    return null;
  }
  return token;
}

async function request<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { method = "GET", body, headers = {} } = options;

  const authHeaders: Record<string, string> = {};
  const token = getBearerToken();
  if (token) {
    authHeaders["Authorization"] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...authHeaders,
      ...headers,
    },
    credentials: "include",
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_URL}${endpoint}`, config);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Request failed" }));
    const detail = error.detail;

    // Centralized 401/403 handling: clear tokens so user is redirected
    if (response.status === 401 || response.status === 403) {
      clearAuthTokens();
    }

    let message: string;
    if (Array.isArray(detail)) {
      message = detail.map((d: { msg?: string }) => d.msg || String(d)).join(", ");
    } else {
      message = detail || `HTTP ${response.status}`;
    }
    throw new ApiError(message, response.status);
  }

  return response.json();
}

export const api = {
  get: <T>(endpoint: string) => request<T>(endpoint),
  post: <T>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, { method: "POST", body }),
  put: <T>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, { method: "PUT", body }),
  delete: <T>(endpoint: string) =>
    request<T>(endpoint, { method: "DELETE" }),
};

export function wsUrl(path: string, token?: string): string {
  const base = API_URL.replace(/^http/, "ws");
  const url = `${base}${path}`;
  return token ? `${url}?token=${token}` : url;
}
