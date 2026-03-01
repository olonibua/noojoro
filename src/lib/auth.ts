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
  // httpOnly cookies (access_token, refresh_token) can only be cleared by the server
  // but we can expire client-readable cookies if any exist
}
