"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

interface LoginResponse {
  token: string;
}

export default function StaffLoginPage() {
  const router = useRouter();
  const [eventCode, setEventCode] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await api.post<LoginResponse>("/api/staff/login", {
        event_code: eventCode,
        pin,
      });
      localStorage.setItem("staff_token", result.token);
      router.push("/staff/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-6">
      <div className="w-full max-w-sm">
        {/* Logo / Title */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100">
            <svg className="h-8 w-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Staff Login</h1>
          <p className="mt-1 text-base text-gray-500">Enter your event code and PIN</p>
        </div>

        {error && (
          <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-base font-medium text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="eventCode" className="mb-1.5 block text-base font-medium text-gray-700">
              Event Code
            </label>
            <input
              id="eventCode"
              type="text"
              required
              value={eventCode}
              onChange={(e) => setEventCode(e.target.value)}
              placeholder="e.g. WDNG-2024"
              className="min-h-[52px] w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-3 text-lg text-gray-900 placeholder-gray-400 outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label htmlFor="pin" className="mb-1.5 block text-base font-medium text-gray-700">
              PIN
            </label>
            <input
              id="pin"
              type="password"
              inputMode="numeric"
              required
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="Enter your PIN"
              className="min-h-[52px] w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-3 text-lg text-gray-900 placeholder-gray-400 outline-none focus:border-emerald-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="min-h-[52px] w-full rounded-xl bg-emerald-500 px-6 py-3 text-lg font-bold text-white transition-colors active:bg-emerald-600 disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="mt-8 text-center text-xs text-gray-400">Powered by No Ojoro</p>
      </div>
    </div>
  );
}
