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
  // Clear auth cookies
  document.cookie = "logged_in=; path=/; max-age=0";
  document.cookie = "noojoro_token=; path=/; max-age=0";
}

export function setAuthTokens(accessToken: string): void {
  if (typeof window === "undefined") return;
  // Store access token as a first-party cookie (avoids cross-domain cookie blocking)
  document.cookie = `noojoro_token=${encodeURIComponent(accessToken)}; path=/; max-age=${7 * 24 * 60 * 60}; samesite=lax`;
  document.cookie = `logged_in=true; path=/; max-age=${7 * 24 * 60 * 60}; samesite=lax`;
}
