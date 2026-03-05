"use client";

import { useRouter, usePathname } from "next/navigation";
import { useTheme } from "@/components/ui/ThemeProvider";
import type { User } from "@/lib/types";
import {
  GridIcon,
  CalendarIcon,
  BuildingIcon,
  LogoutIcon,
  CloseIcon,
  UsersIcon,
  CameraIcon,
  ChevronDoubleRightIcon,
  ChevronDoubleLeftIcon,
  SunIcon,
  MoonIcon,
  SettingsIcon,
  ShieldCheckIcon,
} from "@/components/icons";

/* ═══════════ NAV CONFIG ═══════════ */

const allNavItems = [
  { label: "Dashboard", href: "/dashboard", icon: GridIcon, exact: true, roles: ["caterer", "bar_owner"] },
  { label: "Events", href: "/dashboard/events", icon: CalendarIcon, roles: ["caterer"] },
  { label: "Venues", href: "/dashboard/venues", icon: BuildingIcon, roles: ["bar_owner"] },
  { label: "My Network", href: "/dashboard/referrals", icon: UsersIcon, roles: ["caterer", "bar_owner"] },
  { label: "Event Proofs", href: "/dashboard/event-proofs", icon: CameraIcon, roles: ["caterer", "bar_owner"] },
];

interface DesktopSidebarProps {
  user: User | null;
  expanded: boolean;
  onToggleExpanded: () => void;
  onLogout: () => void;
}

export function DesktopSidebar({ user, expanded, onToggleExpanded, onLogout }: DesktopSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();

  const navItems = allNavItems.filter((item) => item.roles.includes(user?.role || "caterer"));
  const userInitial = (user?.name || user?.email || user?.phone || "U").charAt(0).toUpperCase();

  return (
    <aside className={`hidden lg:flex sidebar-rail h-screen sticky top-0 ${expanded ? "expanded" : ""}`}>
      {/* Logo + expand toggle */}
      {expanded ? (
        <div className="flex items-center justify-between shrink-0 px-1 mb-2">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-eco shadow-sm shadow-eco/20 shrink-0">
              <ShieldCheckIcon className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold t-text whitespace-nowrap">No <span className="text-neutral-500">Ojoro</span></span>
          </div>
          <button onClick={onToggleExpanded} className="sidebar-toggle" title="Collapse sidebar">
            <ChevronDoubleLeftIcon className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 shrink-0">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-eco shadow-sm shadow-eco/20 shrink-0">
            <ShieldCheckIcon className="h-6 w-6 text-white" />
          </div>
          <button onClick={onToggleExpanded} className="sidebar-toggle" title="Expand sidebar">
            <ChevronDoubleRightIcon className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Nav items */}
      <div className={`flex flex-1 flex-col gap-2 pt-4 ${expanded ? "" : "items-center"}`}>
        {navItems.map((item) => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          return expanded ? (
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
      <div className={`flex flex-col gap-2 shrink-0 ${expanded ? "" : "items-center"}`}>
        {expanded ? (
          <>
            <button onClick={onLogout} className="sidebar-nav-btn hover:!bg-red-50 hover:!text-red-600">
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
            <button onClick={onLogout} className="sidebar-icon-btn hover:!bg-red-50 hover:!text-red-600" title="Logout">
              <LogoutIcon className="h-5 w-5" />
            </button>
            <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-full bg-eco text-white text-sm font-bold">
              {userInitial}
            </div>
          </>
        )}
      </div>
    </aside>
  );
}

interface MobileSidebarProps {
  user: User | null;
  open: boolean;
  onClose: () => void;
  onLogout: () => void;
}

export function MobileSidebar({ user, open, onClose, onLogout }: MobileSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();

  const navItems = allNavItems.filter((item) => item.roles.includes(user?.role || "caterer"));

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-40 bg-black/30 lg:hidden" onClick={onClose} />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col t-bg-card border-r t-border transition-transform lg:hidden ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Mobile header */}
        <div className="flex h-16 items-center gap-2 border-b t-border px-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-eco shadow-sm shadow-eco/20">
            <ShieldCheckIcon className="h-4 w-4 text-white" />
          </div>
          <span className="text-xl font-bold t-text">No <span className="t-text-secondary">Ojoro</span></span>
          <button className="ml-auto" onClick={onClose}>
            <CloseIcon className="h-5 w-5 t-text-muted" />
          </button>
        </div>

        {/* Mobile nav */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map((item) => {
            const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
            return (
              <a
                key={item.href}
                href={item.href}
                onClick={(e) => {
                  e.preventDefault();
                  router.push(item.href);
                  onClose();
                }}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  active ? "bg-eco text-white" : "t-text-muted hover:t-bg-secondary hover:t-text"
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
            onClick={onLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium t-text-muted hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogoutIcon className="h-5 w-5" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}

export { allNavItems };
