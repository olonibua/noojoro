"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { setAuthTokens } from "@/lib/auth";
import { setVerifyCredentials } from "@/lib/auth-store";
import { useToast } from "@/lib/toast";

type InputMode = "email" | "phone";

interface LoginFormProps {
  onNavigate: (view: string) => void;
  onClose: () => void;
}

export default function LoginForm({ onNavigate, onClose }: LoginFormProps) {
  const router = useRouter();
  const toast = useToast();
  const [mode, setMode] = useState<InputMode>("email");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const body: Record<string, string> = { password };

      if (mode === "email") {
        body.email = email;
      } else {
        body.phone = phone;
      }

      const result = await api.post<{ message: string; access_token?: string; refresh_token?: string }>("/api/auth/login", body);

      if (result.message === "verify_required") {
        setVerifyCredentials({
          email: mode === "email" ? email : undefined,
          phone: mode === "phone" ? phone : undefined,
          password,
        });
        onNavigate("verify");
        return;
      }

      if (result.access_token) {
        setAuthTokens(result.access_token, result.refresh_token || undefined);
      }

      onClose();
      router.push("/dashboard");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <h1 className="mb-2 text-center text-3xl font-bold">Welcome Back</h1>
      <p className="mb-8 text-center text-sm t-text-muted">
        Sign in to your No Ojoro account
      </p>

      {/* Mode Tabs */}
      <div className="mb-6 flex overflow-hidden rounded-xl t-tab-bg p-1">
        <button
          type="button"
          onClick={() => setMode("email")}
          className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition-all ${
            mode === "email"
              ? "bg-eco text-white shadow-sm"
              : "t-text-muted hover:text-eco"
          }`}
        >
          Email
        </button>
        <button
          type="button"
          onClick={() => setMode("phone")}
          className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition-all ${
            mode === "phone"
              ? "bg-eco text-white shadow-sm"
              : "t-text-muted hover:text-eco"
          }`}
        >
          Phone
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {mode === "email" ? (
          <div>
            <label htmlFor="login-email" className="mb-1.5 block text-sm font-medium t-text-secondary">
              Email Address
            </label>
            <input
              id="login-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full t-input px-4 py-3 outline-none"
            />
          </div>
        ) : (
          <div>
            <label htmlFor="login-phone" className="mb-1.5 block text-sm font-medium t-text-secondary">
              Phone Number
            </label>
            <input
              id="login-phone"
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+234 801 234 5678"
              className="w-full t-input px-4 py-3 outline-none"
            />
          </div>
        )}

        <div>
          <label htmlFor="login-password" className="mb-1.5 block text-sm font-medium t-text-secondary">
            Password
          </label>
          <div className="relative">
            <input
              id="login-password"
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full t-input px-4 py-3 pr-12 outline-none"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 t-text-faint hover:t-text-muted transition-colors"
            >
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              )}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full py-3 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Signing In..." : "Sign In"}
        </button>
      </form>

      <div className="mt-6 flex flex-col items-center gap-2 text-sm t-text-faint">
        <button
          type="button"
          onClick={() => onNavigate("reset")}
          className="font-medium text-eco hover:text-eco-dark"
        >
          Forgot your password?
        </button>
        <p>
          Don&apos;t have an account?{" "}
          <button
            type="button"
            onClick={() => onNavigate("register")}
            className="font-medium text-eco hover:text-eco-dark"
          >
            Create Account
          </button>
        </p>
      </div>
    </>
  );
}
