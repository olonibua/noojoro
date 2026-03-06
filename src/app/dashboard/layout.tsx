"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { clearAuthTokens, recordActivity, isIdle } from "@/lib/auth";
import type { User } from "@/lib/types";
import { DesktopSidebar, MobileSidebar } from "@/components/dashboard/DashboardSidebar";
import DashboardTopBar from "@/components/dashboard/DashboardTopBar";

const IDLE_TIMEOUT_MS = 60 * 60 * 1000; // 1 hour

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<User>("/api/auth/me")
      .then(setUser)
      .catch(() => {
        clearAuthTokens();
        router.push("/?auth=login");
      })
      .finally(() => setLoading(false));
  }, [router]);

  // Idle timeout: auto-logout after 1 hour of inactivity
  const handleIdleLogout = useCallback(() => {
    clearAuthTokens();
    router.push("/?auth=login&reason=idle");
  }, [router]);

  useEffect(() => {
    // Record initial activity
    recordActivity();

    const onActivity = () => recordActivity();
    const events = ["mousedown", "keydown", "touchstart", "scroll"] as const;
    events.forEach((e) => window.addEventListener(e, onActivity, { passive: true }));

    // Check idle every 30 seconds
    const interval = setInterval(() => {
      if (isIdle(IDLE_TIMEOUT_MS)) {
        handleIdleLogout();
      }
    }, 30_000);

    return () => {
      events.forEach((e) => window.removeEventListener(e, onActivity));
      clearInterval(interval);
    };
  }, [handleIdleLogout]);

  const handleLogout = async () => {
    try {
      await api.post("/api/auth/logout");
    } catch {
      // ignore
    }
    clearAuthTokens();
    router.push("/?auth=login");
  };

  if (loading) {
    return (
      <div className="flex h-screen t-bg animate-pulse">
        {/* Skeleton sidebar */}
        <aside className="hidden lg:flex flex-col w-[240px] border-r t-border p-4 gap-4 shrink-0">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-xl bg-eco/20 shrink-0" />
            <div className="h-5 w-24 rounded-lg t-bg-secondary" />
          </div>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-10 rounded-xl t-bg-secondary" />
          ))}
          <div className="mt-auto">
            <div className="h-10 rounded-xl t-bg-secondary" />
            <div className="flex items-center gap-3 mt-3">
              <div className="h-9 w-9 rounded-full t-bg-secondary shrink-0" />
              <div className="space-y-1.5 flex-1">
                <div className="h-3.5 w-24 rounded t-bg-secondary" />
                <div className="h-3 w-16 rounded t-bg-secondary" />
              </div>
            </div>
          </div>
        </aside>

        {/* Skeleton main area */}
        <div className="flex flex-1 flex-col p-2 lg:p-3">
          <div className="content-container flex-1">
            <div className="flex items-center justify-between px-6 py-4 border-b t-border">
              <div className="flex items-center gap-3">
                <div className="h-5 w-5 rounded t-bg-secondary lg:hidden" />
                <div className="h-5 w-24 rounded-lg t-bg-secondary" />
              </div>
              <div className="flex items-center gap-3">
                <div className="h-10 w-40 rounded-full t-bg-secondary hidden sm:block" />
                <div className="h-10 w-10 rounded-xl t-bg-secondary" />
                <div className="h-10 w-10 rounded-xl t-bg-secondary" />
                <div className="h-9 w-9 rounded-full t-bg-secondary hidden lg:block" />
              </div>
            </div>
            <div className="p-4 lg:p-8 space-y-6">
              <div className="space-y-2">
                <div className="h-7 w-56 rounded-lg t-bg-secondary" />
                <div className="h-4 w-72 rounded t-bg-secondary" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-24 rounded-2xl t-bg-secondary" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const userInitial = (user?.name || user?.email || user?.phone || "U").charAt(0).toUpperCase();

  return (
    <div className="flex h-screen t-bg">
      <DesktopSidebar
        user={user}
        expanded={sidebarExpanded}
        onToggleExpanded={() => setSidebarExpanded((prev) => !prev)}
        onLogout={handleLogout}
      />

      <MobileSidebar
        user={user}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onLogout={handleLogout}
      />

      <div className="flex flex-1 flex-col overflow-hidden p-2 lg:p-3">
        <div className="content-container">
          <DashboardTopBar
            userInitial={userInitial}
            onOpenMobileSidebar={() => setSidebarOpen(true)}
          />
          <main className="flex-1 overflow-y-auto p-4 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
