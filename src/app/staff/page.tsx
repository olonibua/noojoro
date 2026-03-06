"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useToast } from "@/lib/toast";

interface LoginResponse {
  token: string;
}

export default function StaffLoginPage() {
  const router = useRouter();
  const [eventCode, setEventCode] = useState("");
  const [pin, setPin] = useState("");
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await api.post<LoginResponse>("/api/staff/login", {
        event_code: eventCode,
        pin,
      });
      localStorage.setItem("staff_token", result.token);
      router.push("/staff/dashboard");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-6">
      <div className="w-full max-w-sm">
        {/* Logo / Title */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-eco/10">
            <svg className="h-8 w-8 text-eco-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold t-text">Staff Login</h1>
          <p className="mt-1 text-base t-text-muted">Enter your event code and PIN</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="eventCode" className="mb-1.5 block text-base font-medium t-text-secondary">
              Event Code
            </label>
            <input
              id="eventCode"
              type="text"
              required
              value={eventCode}
              onChange={(e) => setEventCode(e.target.value)}
              placeholder="e.g. WDNG-2024"
              className="min-h-[52px] w-full rounded-xl border-2 t-border bg-white px-4 py-3 text-lg t-text placeholder-[#9C9C9C] outline-none focus:border-eco"
            />
          </div>

          <div>
            <label htmlFor="pin" className="mb-1.5 block text-base font-medium t-text-secondary">
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
              className="min-h-[52px] w-full rounded-xl border-2 t-border bg-white px-4 py-3 text-lg t-text placeholder-[#9C9C9C] outline-none focus:border-eco"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="min-h-[52px] w-full rounded-xl bg-eco px-6 py-3 text-lg font-bold text-white transition-colors active:bg-emerald-600 disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="mt-8 text-center text-xs t-text-faint">Powered by No Ojoro</p>
      </div>
    </div>
  );
}
