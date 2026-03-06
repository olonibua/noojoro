import { decodeJwt } from "jose";

/**
 * Check if a JWT token is expired (or will expire within 30 seconds).
 * Returns true if expired/invalid, false if still valid.
 */
export function isTokenExpired(token: string): boolean {
  try {
    const { exp } = decodeJwt(token);
    if (!exp) return true;
    // Consider expired if within 30 seconds of expiry
    return Date.now() >= (exp - 30) * 1000;
  } catch {
    return true;
  }
}

/**
 * Clear all auth tokens from localStorage and cookies.
 */
export function clearAuthTokens(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem("staff_token");
  localStorage.removeItem("bar_staff_token");
  localStorage.removeItem("celebrant_token");
  localStorage.removeItem("noojoro_token");
  localStorage.removeItem("noojoro_refresh");
  localStorage.removeItem("last_activity");
  // Clear auth cookies
  document.cookie = "logged_in=; path=/; max-age=0";
  document.cookie = "noojoro_token=; path=/; max-age=0";
  document.cookie = "noojoro_refresh=; path=/; max-age=0";
}

export function setAuthTokens(accessToken: string, refreshToken?: string): void {
  if (typeof window === "undefined") return;
  // Store in localStorage as primary storage (reliable cross-origin)
  localStorage.setItem("noojoro_token", accessToken);
  if (refreshToken) {
    localStorage.setItem("noojoro_refresh", refreshToken);
  }
  // Also set cookies for SSR/middleware usage
  document.cookie = `noojoro_token=${encodeURIComponent(accessToken)}; path=/; max-age=${7 * 24 * 60 * 60}; samesite=lax`;
  document.cookie = `logged_in=true; path=/; max-age=${7 * 24 * 60 * 60}; samesite=lax`;
  if (refreshToken) {
    document.cookie = `noojoro_refresh=${encodeURIComponent(refreshToken)}; path=/; max-age=${7 * 24 * 60 * 60}; samesite=lax`;
  }
}

/** Record user activity timestamp for idle timeout. */
export function recordActivity(): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("last_activity", Date.now().toString());
}

/** Check if the user has been idle for more than the given duration (ms). */
export function isIdle(maxIdleMs: number): boolean {
  if (typeof window === "undefined") return false;
  const last = localStorage.getItem("last_activity");
  if (!last) return false;
  return Date.now() - parseInt(last, 10) > maxIdleMs;
}
