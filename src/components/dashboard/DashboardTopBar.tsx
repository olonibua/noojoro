"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useTheme } from "@/components/ui/ThemeProvider";
import { api } from "@/lib/api";
import {
  GridIcon,
  CalendarIcon,
  BuildingIcon,
  UsersIcon,
  CameraIcon,
  MenuIcon,
  BellIcon,
  SearchIcon,
  SunIcon,
  MoonIcon,
} from "@/components/icons";

/* ═══════════ PAGE INFO ═══════════ */

function getPageInfo(pathname: string): { title: string; icon: React.ComponentType<{ className?: string }> } {
  if (pathname === "/dashboard") return { title: "Dashboard", icon: GridIcon };
  if (pathname.startsWith("/dashboard/events")) return { title: "Events", icon: CalendarIcon };
  if (pathname.startsWith("/dashboard/venues")) return { title: "Venues", icon: BuildingIcon };
  if (pathname.startsWith("/dashboard/referrals")) return { title: "My Network", icon: UsersIcon };
  if (pathname.startsWith("/dashboard/event-proofs")) return { title: "Event Proofs", icon: CameraIcon };
  return { title: "Dashboard", icon: GridIcon };
}

/* ═══════════ TYPES ═══════════ */

interface SearchEvent { id: string; name: string; venue_name: string }
interface SearchVenue { id: string; name: string }

interface DashboardTopBarProps {
  userInitial: string;
  onOpenMobileSidebar: () => void;
}

export default function DashboardTopBar({ userInitial, onOpenMobileSidebar }: DashboardTopBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [allEvents, setAllEvents] = useState<SearchEvent[]>([]);
  const [allVenues, setAllVenues] = useState<SearchVenue[]>([]);
  const [searchFocused, setSearchFocused] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Notification state
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

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

  // Close dropdowns on outside click
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

  const pageInfo = getPageInfo(pathname);
  const PageIcon = pageInfo.icon;

  return (
    <div className="top-bar">
      {/* Left: hamburger (mobile) + page icon + title */}
      <div className="flex items-center gap-3">
        <button className="lg:hidden" onClick={onOpenMobileSidebar}>
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
  );
}
