"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { api } from "@/lib/api";
import { clearAuthTokens } from "@/lib/auth";
import { useTheme } from "@/components/ui/ThemeProvider";

interface User {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  role: string;
  is_verified: boolean;
}

/* ═══════════ ICON COMPONENTS ═══════════ */

function GridIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
    </svg>
  );
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
    </svg>
  );
}

function BuildingIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
    </svg>
  );
}

function SettingsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function LogoutIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
    </svg>
  );
}

function MenuIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function UsersIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
  );
}

function CameraIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
    </svg>
  );
}

function ChevronDoubleRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="m5.25 4.5 7.5 7.5-7.5 7.5m6-15 7.5 7.5-7.5 7.5" />
    </svg>
  );
}

function ChevronDoubleLeftIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="m18.75 4.5-7.5 7.5 7.5 7.5m-6-15-7.5 7.5 7.5 7.5" />
    </svg>
  );
}

function BellIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
    </svg>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    </svg>
  );
}

function SunIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
    </svg>
  );
}

function MoonIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
    </svg>
  );
}

/* ═══════════ NAV CONFIG ═══════════ */

const allNavItems = [
  { label: "Dashboard", href: "/dashboard", icon: GridIcon, exact: true, roles: ["caterer", "bar_owner"] },
  { label: "Events", href: "/dashboard/events", icon: CalendarIcon, roles: ["caterer"] },
  { label: "Venues", href: "/dashboard/venues", icon: BuildingIcon, roles: ["bar_owner"] },
  { label: "My Network", href: "/dashboard/referrals", icon: UsersIcon, roles: ["caterer", "bar_owner"] },
  { label: "Event Proofs", href: "/dashboard/event-proofs", icon: CameraIcon, roles: ["caterer", "bar_owner"] },
];

function getPageInfo(pathname: string): { title: string; icon: React.ComponentType<{ className?: string }> } {
  if (pathname === "/dashboard") return { title: "Dashboard", icon: GridIcon };
  if (pathname.startsWith("/dashboard/events")) return { title: "Events", icon: CalendarIcon };
  if (pathname.startsWith("/dashboard/venues")) return { title: "Venues", icon: BuildingIcon };
  if (pathname.startsWith("/dashboard/referrals")) return { title: "My Network", icon: UsersIcon };
  if (pathname.startsWith("/dashboard/event-proofs")) return { title: "Event Proofs", icon: CameraIcon };
  return { title: "Dashboard", icon: GridIcon };
}

/* ═══════════ LAYOUT ═══════════ */

interface SearchEvent { id: string; name: string; venue_name: string }
interface SearchVenue { id: string; name: string }

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [user, setUser] = useState<User | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [loading, setLoading] = useState(true);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [allEvents, setAllEvents] = useState<SearchEvent[]>([]);
  const [allVenues, setAllVenues] = useState<SearchVenue[]>([]);
  const [searchFocused, setSearchFocused] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Notification state
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

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

  // Fetch events + venues for search
  useEffect(() => {
    Promise.all([
      api.get<SearchEvent[]>("/api/events").catch(() => [] as SearchEvent[]),
      api.get<SearchVenue[]>("/api/venues").catch(() => [] as SearchVenue[]),
    ]).then(([evts, vns]) => {
      setAllEvents(evts);
      setAllVenues(vns);
    });
  }, []);

  // Close search/notification dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchFocused(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredEvents = searchQuery
    ? allEvents.filter((e) => e.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];
  const filteredVenues = searchQuery
    ? allVenues.filter((v) => v.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];
  const showSearchDropdown = searchQuery.length > 0 && searchFocused;

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
            {/* Skeleton top bar */}
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

            {/* Skeleton content */}
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
              <div className="space-y-3">
                <div className="h-5 w-32 rounded t-bg-secondary" />
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {[1, 2].map((i) => (
                    <div key={i} className="h-32 rounded-2xl t-bg-secondary" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const pageInfo = getPageInfo(pathname);
  const PageIcon = pageInfo.icon;
  const navItems = allNavItems.filter((item) => item.roles.includes(user?.role || "caterer"));
  const userInitial = (user?.name || user?.email || user?.phone || "U").charAt(0).toUpperCase();

  return (
    <div className="flex h-screen t-bg">
      {/* ═══════════ ZONE 1 — DESKTOP SIDEBAR RAIL ═══════════ */}
      <aside className={`hidden lg:flex sidebar-rail h-screen sticky top-0 ${sidebarExpanded ? "expanded" : ""}`}>
        {/* Logo + expand toggle */}
        {sidebarExpanded ? (
          <div className="flex items-center justify-between shrink-0 px-1 mb-2">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-eco shadow-sm shadow-eco/20 shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <span className="text-lg font-bold t-text whitespace-nowrap">No <span className="text-neutral-500">Ojoro</span></span>
            </div>
            <button
              onClick={() => setSidebarExpanded(false)}
              className="sidebar-toggle"
              title="Collapse sidebar"
            >
              <ChevronDoubleLeftIcon className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 shrink-0">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-eco shadow-sm shadow-eco/20 shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <button
              onClick={() => setSidebarExpanded(true)}
              className="sidebar-toggle"
              title="Expand sidebar"
            >
              <ChevronDoubleRightIcon className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Nav items */}
        <div className={`flex flex-1 flex-col gap-2 pt-4 ${sidebarExpanded ? "" : "items-center"}`}>
          {navItems.map((item) => {
            const active = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);
            return sidebarExpanded ? (
              <button
                key={item.href}
                onClick={() => router.push(item.href)}
                className={`sidebar-nav-btn ${active ? "active" : ""}`}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {item.label}
              </button>
            ) : (
              <button
                key={item.href}
                onClick={() => router.push(item.href)}
                className={`sidebar-icon-btn ${active ? "active" : ""}`}
                title={item.label}
              >
                <item.icon className="h-5 w-5" />
              </button>
            );
          })}
        </div>

        {/* Bottom section */}
        <div className={`flex flex-col gap-2 shrink-0 ${sidebarExpanded ? "" : "items-center"}`}>
          {sidebarExpanded ? (
            <>
              {/* <button className="sidebar-nav-btn">
                <SettingsIcon className="h-5 w-5 shrink-0" />
                Settings
              </button> */}
              <button
                onClick={handleLogout}
                className="sidebar-nav-btn hover:!bg-red-50 hover:!text-red-600"
              >
                <LogoutIcon className="h-5 w-5 shrink-0" />
                Logout
              </button>
              <div className="flex items-center gap-3 mt-1 px-1">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-eco text-white text-sm font-bold shrink-0">
                  {userInitial}
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm font-medium t-text truncate">{user?.name || user?.email || user?.phone}</p>
                  <p className="text-xs t-text-faint capitalize">{user?.role?.replace("_", " ")}</p>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* <button className="sidebar-icon-btn" title="Settings">
                <SettingsIcon className="h-5 w-5" />
              </button> */}
              <button
                onClick={handleLogout}
                className="sidebar-icon-btn hover:!bg-red-50 hover:!text-red-600"
                title="Logout"
              >
                <LogoutIcon className="h-5 w-5" />
              </button>
              <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-full bg-eco text-white text-sm font-bold">
                {userInitial}
              </div>
            </>
          )}

        </div>
      </aside>

      {/* ═══════════ ZONE 2 — MOBILE SIDEBAR ═══════════ */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col t-bg-card border-r t-border transition-transform lg:hidden ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Mobile header */}
        <div className="flex h-16 items-center gap-2 border-b t-border px-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-eco shadow-sm shadow-eco/20">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <span className="text-xl font-bold t-text">No <span className="t-text-secondary">Ojoro</span></span>
          <button className="ml-auto" onClick={() => setSidebarOpen(false)}>
            <CloseIcon className="h-5 w-5 t-text-muted" />
          </button>
        </div>

        {/* Mobile nav */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map((item) => {
            const active = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);
            return (
              <a
                key={item.href}
                href={item.href}
                onClick={(e) => {
                  e.preventDefault();
                  router.push(item.href);
                  setSidebarOpen(false);
                }}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-eco text-white"
                    : "t-text-muted hover:t-bg-secondary hover:t-text"
                }`}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </a>
            );
          })}
        </nav>

        {/* Mobile bottom */}
        <div className="border-t t-border p-3 space-y-1">
          <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium t-text-muted hover:t-bg-secondary hover:t-text transition-colors">
            <SettingsIcon className="h-5 w-5" />
            Settings
          </button>
          <button
            onClick={toggleTheme}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium t-text-muted hover:t-bg-secondary hover:t-text transition-colors"
          >
            {theme === "dark" ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
            {theme === "dark" ? "Light Mode" : "Dark Mode"}
          </button>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium t-text-muted hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogoutIcon className="h-5 w-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* ═══════════ ZONE 3 — MAIN CONTENT AREA ═══════════ */}
      <div className="flex flex-1 flex-col overflow-hidden p-2 lg:p-3">
        <div className="content-container">
          {/* Top bar */}
          <div className="top-bar">
            {/* Left: hamburger (mobile) + page icon + title */}
            <div className="flex items-center gap-3">
              <button className="lg:hidden" onClick={() => setSidebarOpen(true)}>
                <MenuIcon className="h-6 w-6 t-text-muted" />
              </button>
              <PageIcon className="h-5 w-5 t-text-muted hidden sm:block" />
              <h1 className="text-lg font-semibold t-text">{pageInfo.title}</h1>
            </div>

            {/* Right: search + bell + avatar */}
            <div className="flex items-center gap-3">
              {/* Search */}
              <div ref={searchRef} className="relative hidden sm:flex items-center">
                <SearchIcon className="absolute left-3 h-4 w-4 t-text-faint z-10" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  className="search-pill"
                />
                {showSearchDropdown && (
                  <div className="search-dropdown">
                    {filteredEvents.length === 0 && filteredVenues.length === 0 ? (
                      <div className="search-dropdown-empty">No results found</div>
                    ) : (
                      <>
                        {filteredEvents.length > 0 && (
                          <div className="search-dropdown-section">
                            <div className="search-dropdown-label">Events</div>
                            {filteredEvents.map((evt) => (
                              <div
                                key={evt.id}
                                className="search-dropdown-item"
                                onClick={() => {
                                  router.push(`/dashboard/events/${evt.id}`);
                                  setSearchQuery("");
                                  setSearchFocused(false);
                                }}
                              >
                                <span className="search-dropdown-item-name">{evt.name}</span>
                                <span className="search-dropdown-item-sub">{evt.venue_name}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        {filteredVenues.length > 0 && (
                          <div className="search-dropdown-section">
                            <div className="search-dropdown-label">Venues</div>
                            {filteredVenues.map((v) => (
                              <div
                                key={v.id}
                                className="search-dropdown-item"
                                onClick={() => {
                                  router.push(`/dashboard/venues/${v.id}`);
                                  setSearchQuery("");
                                  setSearchFocused(false);
                                }}
                              >
                                <span className="search-dropdown-item-name">{v.name}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Theme toggle */}
              <button
                onClick={toggleTheme}
                className="sidebar-icon-btn !w-10 !h-10 !rounded-xl"
                title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              >
                {theme === "dark" ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
              </button>

              {/* Notifications */}
              <div ref={notifRef} className="relative">
                <button
                  onClick={() => setNotifOpen(!notifOpen)}
                  className="sidebar-icon-btn !w-10 !h-10 !rounded-xl"
                >
                  <BellIcon className="h-5 w-5" />
                </button>
                {notifOpen && (
                  <div className="notif-dropdown">
                    <div className="notif-header">Notifications</div>
                    <div className="notif-empty">
                      <BellIcon className="h-8 w-8 t-text-faint" />
                      <span className="notif-empty-title">No notifications yet</span>
                      <span className="notif-empty-sub">You&apos;re all caught up</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="hidden lg:flex h-9 w-9 items-center justify-center rounded-full bg-eco text-white text-sm font-bold">
                {userInitial}
              </div>
            </div>
          </div>

          {/* Page content */}
          <main className="flex-1 overflow-y-auto p-4 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
