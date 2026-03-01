"use client";

import { useState } from "react";
import { api } from "@/lib/api";

type InputMode = "email" | "phone";
type View = "request" | "verify" | "confirm";

interface ResetPasswordFormProps {
  onNavigate: (view: string) => void;
}

export default function ResetPasswordForm({ onNavigate }: ResetPasswordFormProps) {
  const [view, setView] = useState<View>("request");
  const [mode, setMode] = useState<InputMode>("email");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleRequest(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const body: Record<string, string> = {};
      if (mode === "email") {
        body.email = email;
      } else {
        body.phone = phone;
      }

      await api.post("/api/auth/password-reset/request", body);
      setSuccess("A reset code has been sent. Check your inbox.");
      setView("verify");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const body: Record<string, string> = { token };
      if (mode === "email") {
        body.email = email;
      } else {
        body.phone = phone;
      }

      await api.post("/api/auth/password-reset/verify", body);
      setSuccess("Code verified. Enter your new password.");
      setView("confirm");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirm(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const body: Record<string, string> = {
        token,
        new_password: newPassword,
      };

      if (mode === "email") {
        body.email = email;
      } else {
        body.phone = phone;
      }

      await api.post("/api/auth/password-reset/confirm", body);
      setSuccess("Password reset successful! Redirecting to login...");
      setTimeout(() => onNavigate("login"), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Reset failed");
    } finally {
      setLoading(false);
    }
  }

  const headings: Record<View, { title: string; subtitle: string }> = {
    request: {
      title: "Reset Password",
      subtitle: "Enter your email or phone to receive a reset code",
    },
    verify: {
      title: "Enter Reset Code",
      subtitle: "Enter the 6-digit code sent to your email or phone",
    },
    confirm: {
      title: "Set New Password",
      subtitle: "Enter your new password below",
    },
  };

  return (
    <>
      <h1 className="mb-2 text-center text-3xl font-bold">
        {headings[view].title}
      </h1>
      <p className="mb-8 text-center text-sm t-text-muted">
        {headings[view].subtitle}
      </p>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-600">
          {success}
        </div>
      )}

      {view === "request" && (
        <>
          {/* Mode Tabs */}
          <div className="mb-6 flex overflow-hidden rounded-lg border t-border">
            <button
              type="button"
              onClick={() => setMode("email")}
              className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                mode === "email"
                  ? "bg-black text-white"
                  : "t-text-muted hover:opacity-80"
              }`}
            >
              Email
            </button>
            <button
              type="button"
              onClick={() => setMode("phone")}
              className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                mode === "phone"
                  ? "bg-black text-white"
                  : "t-text-muted hover:opacity-80"
              }`}
            >
              Phone
            </button>
          </div>

          <form onSubmit={handleRequest} className="space-y-5">
            {mode === "email" ? (
              <div>
                <label htmlFor="reset-email" className="mb-1.5 block text-sm font-medium t-text-secondary">
                  Email Address
                </label>
                <input
                  id="reset-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-lg t-input px-4 py-3 outline-none transition-colors"
                />
              </div>
            ) : (
              <div>
                <label htmlFor="reset-phone" className="mb-1.5 block text-sm font-medium t-text-secondary">
                  Phone Number
                </label>
                <input
                  id="reset-phone"
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+234 801 234 5678"
                  className="w-full rounded-lg t-input px-4 py-3 outline-none transition-colors"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-black py-3 font-semibold text-white transition-all hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Sending..." : "Send Reset Code"}
            </button>
          </form>
        </>
      )}

      {view === "verify" && (
        <form onSubmit={handleVerify} className="space-y-5">
          <div>
            <label htmlFor="reset-token" className="mb-1.5 block text-sm font-medium t-text-secondary">
              Reset Code
            </label>
            <input
              id="reset-token"
              type="text"
              required
              maxLength={6}
              pattern="[0-9]{6}"
              inputMode="numeric"
              value={token}
              onChange={(e) => setToken(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="000000"
              className="w-full rounded-lg t-input px-4 py-3 text-center text-2xl tracking-[0.5em] outline-none transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading || token.length !== 6}
            className="w-full rounded-lg bg-black py-3 font-semibold text-white transition-all hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Verifying..." : "Verify Code"}
          </button>

          <button
            type="button"
            onClick={() => {
              setView("request");
              setToken("");
              setError("");
              setSuccess("");
            }}
            className="w-full py-2 text-sm t-text-faint hover:opacity-80"
          >
            Back to request
          </button>
        </form>
      )}

      {view === "confirm" && (
        <form onSubmit={handleConfirm} className="space-y-5">
          <div>
            <label htmlFor="reset-new-password" className="mb-1.5 block text-sm font-medium t-text-secondary">
              New Password
            </label>
            <input
              id="reset-new-password"
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter your new password"
              className="w-full rounded-lg t-input px-4 py-3 outline-none transition-colors"
            />
          </div>

          <div>
            <label htmlFor="reset-confirm-password" className="mb-1.5 block text-sm font-medium t-text-secondary">
              Confirm Password
            </label>
            <input
              id="reset-confirm-password"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your new password"
              className="w-full rounded-lg t-input px-4 py-3 outline-none transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-black py-3 font-semibold text-white transition-all hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>

          <button
            type="button"
            onClick={() => {
              setView("request");
              setToken("");
              setNewPassword("");
              setConfirmPassword("");
              setError("");
              setSuccess("");
            }}
            className="w-full py-2 text-sm t-text-faint hover:opacity-80"
          >
            Start over
          </button>
        </form>
      )}

      <p className="mt-6 text-center text-sm t-text-faint">
        Remember your password?{" "}
        <button
          type="button"
          onClick={() => onNavigate("login")}
          className="font-medium t-text-secondary hover:t-text"
        >
          Sign In
        </button>
      </p>
    </>
  );
}
