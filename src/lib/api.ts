import { isTokenExpired, clearAuthTokens, setAuthTokens } from "./auth";

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

export function getBearerToken(): string | null {
  if (typeof window === "undefined") return null;
  const token =
    getCookie("noojoro_token") ||
    localStorage.getItem("noojoro_token") ||
    localStorage.getItem("staff_token") ||
    localStorage.getItem("bar_staff_token") ||
    localStorage.getItem("celebrant_token") ||
    null;

  if (token && isTokenExpired(token)) {
    // Don't clear tokens here — let the refresh attempt handle it
    return null;
  }
  return token;
}

let refreshPromise: Promise<string | null> | null = null;

async function tryRefreshToken(): Promise<string | null> {
  const refreshToken = getCookie("noojoro_refresh") || localStorage.getItem("noojoro_refresh");
  if (!refreshToken || isTokenExpired(refreshToken)) {
    clearAuthTokens();
    return null;
  }

  try {
    const resp = await fetch(`${API_URL}/api/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${refreshToken}`,
      },
      credentials: "include",
    });

    if (!resp.ok) {
      clearAuthTokens();
      return null;
    }

    const data = await resp.json();
    if (data.access_token) {
      setAuthTokens(data.access_token);
      return data.access_token;
    }
    clearAuthTokens();
    return null;
  } catch {
    clearAuthTokens();
    return null;
  }
}

async function request<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { method = "GET", body, headers = {} } = options;

  let token = getBearerToken();

  // If access token is expired, try refreshing before making the request
  if (!token && (getCookie("noojoro_refresh") || localStorage.getItem("noojoro_refresh"))) {
    if (!refreshPromise) {
      refreshPromise = tryRefreshToken().finally(() => { refreshPromise = null; });
    }
    token = await refreshPromise;
  }

  const authHeaders: Record<string, string> = {};
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

  // If 401, attempt one refresh and retry
  if (response.status === 401 && (getCookie("noojoro_refresh") || localStorage.getItem("noojoro_refresh"))) {
    if (!refreshPromise) {
      refreshPromise = tryRefreshToken().finally(() => { refreshPromise = null; });
    }
    const newToken = await refreshPromise;
    if (newToken) {
      const retryConfig: RequestInit = {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${newToken}`,
          ...headers,
        },
        credentials: "include",
      };
      if (body) retryConfig.body = JSON.stringify(body);

      const retryResponse = await fetch(`${API_URL}${endpoint}`, retryConfig);
      if (retryResponse.ok) {
        return retryResponse.json();
      }
    }
    // Refresh failed or retry failed — clear and throw
    clearAuthTokens();
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Request failed" }));
    const detail = error.detail;

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
