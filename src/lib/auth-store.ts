/**
 * In-memory store for sensitive auth data that should NOT be persisted
 * to localStorage (e.g. passwords used for auto-login after verification).
 *
 * This data lives only in the current browser tab's memory and is
 * automatically cleared on page refresh or tab close — which is the
 * correct behaviour for sensitive credentials.
 */

let _verifyPassword: string | null = null;
let _verifyEmail: string | null = null;
let _verifyPhone: string | null = null;

export function setVerifyCredentials(data: {
  email?: string;
  phone?: string;
  password: string;
}) {
  _verifyEmail = data.email ?? null;
  _verifyPhone = data.phone ?? null;
  _verifyPassword = data.password;
}

export function getVerifyCredentials() {
  return {
    email: _verifyEmail,
    phone: _verifyPhone,
    password: _verifyPassword,
  };
}

export function clearVerifyCredentials() {
  _verifyEmail = null;
  _verifyPhone = null;
  _verifyPassword = null;
}
