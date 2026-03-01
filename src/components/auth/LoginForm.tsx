"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

type InputMode = "email" | "phone";

interface LoginFormProps {
  onNavigate: (view: string) => void;
  onClose: () => void;
}

export default function LoginForm({ onNavigate, onClose }: LoginFormProps) {
  const router = useRouter();
  const [mode, setMode] = useState<InputMode>("email");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const body: Record<string, string> = { password };

      if (mode === "email") {
        body.email = email;
      } else {
        body.phone = phone;
      }

      const result = await api.post<{ message: string }>("/api/auth/login", body);

      if (result.message === "verify_required") {
        if (mode === "email") {
          localStorage.setItem("verify_email", email);
        } else {
          localStorage.setItem("verify_phone", phone);
        }
        localStorage.setItem("verify_password", password);
        onNavigate("verify");
        return;
      }

      onClose();
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
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

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

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
              className="w-full rounded-lg t-input px-4 py-3 outline-none transition-colors"
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
              className="w-full rounded-lg t-input px-4 py-3 outline-none transition-colors"
            />
          </div>
        )}

        <div>
          <label htmlFor="login-password" className="mb-1.5 block text-sm font-medium t-text-secondary">
            Password
          </label>
          <input
            id="login-password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            className="w-full rounded-lg t-input px-4 py-3 outline-none transition-colors"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-black py-3 font-semibold text-white transition-all hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Signing In..." : "Sign In"}
        </button>
      </form>

      <div className="mt-6 flex flex-col items-center gap-2 text-sm t-text-faint">
        <button
          type="button"
          onClick={() => onNavigate("reset")}
          className="font-medium t-text-secondary hover:t-text"
        >
          Forgot your password?
        </button>
        <p>
          Don&apos;t have an account?{" "}
          <button
            type="button"
            onClick={() => onNavigate("register")}
            className="font-medium t-text-secondary hover:t-text"
          >
            Create Account
          </button>
        </p>
      </div>
    </>
  );
}
