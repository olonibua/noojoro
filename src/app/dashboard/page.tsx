"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

interface Event {
  id: string;
  name: string;
  date: string;
  venue_name: string;
  status: string;
  total_tokens: number;
}

interface Venue {
  id: string;
  name: string;
  address: string | null;
  table_count: number;
  status: string;
}

/* ═══════════ ICON COMPONENTS ═══════════ */

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
    </svg>
  );
}

function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
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

function TokenIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z" />
    </svg>
  );
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  );
}

function ListIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
    </svg>
  );
}

/* ═══════════ PAGE ═══════════ */

interface User {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  role: string;
}

export default function DashboardHome() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get<User>("/api/auth/me").catch(() => null),
      api.get<Event[]>("/api/events").catch(() => [] as Event[]),
      api.get<Venue[]>("/api/venues").catch(() => [] as Venue[]),
    ])
      .then(([u, evts, vns]) => {
        setUser(u);
        setEvents(evts);
        setVenues(vns);
      })
      .finally(() => setLoading(false));
  }, []);

  const totalEvents = events.length;
  const activeEvents = events.filter((e) => e.status === "active").length;
  const totalVenues = venues.length;
  const totalTokens = events.reduce((sum, e) => sum + (e.total_tokens || 0), 0);

  const stats = [
    {
      label: "Total Events",
      value: totalEvents,
      icon: CalendarIcon,
      iconBg: "bg-neutral-100",
      iconColor: "text-neutral-600",
    },
    {
      label: "Active Events",
      value: activeEvents,
      icon: CheckCircleIcon,
      iconBg: "bg-neutral-100",
      iconColor: "text-neutral-600",
    },
    {
      label: "Venues",
      value: totalVenues,
      icon: BuildingIcon,
      iconBg: "bg-neutral-100",
      iconColor: "text-neutral-600",
    },
    {
      label: "Tokens Issued",
      value: totalTokens,
      icon: TokenIcon,
      iconBg: "bg-amber-50",
      iconColor: "text-amber-600",
    },
  ];

  const isCaterer = user?.role === "caterer";
  const isBarOwner = user?.role === "bar_owner";

  const quickActions = [
    ...(isCaterer
      ? [
          {
            title: "Create Event",
            description: "Set up a new event with tables, menus, and tokens.",
            href: "/dashboard/events/new",
            icon: PlusIcon,
            iconBg: "bg-neutral-100",
            iconColor: "text-neutral-600",
          },
          {
            title: "My Events",
            description: "View and manage all your existing events.",
            href: "/dashboard/events",
            icon: ListIcon,
            iconBg: "t-bg-secondary",
            iconColor: "t-text-muted",
          },
        ]
      : []),
    ...(isBarOwner
      ? [
          {
            title: "Create Venue",
            description: "Register a new bar or restaurant venue.",
            href: "/dashboard/venues/new",
            icon: PlusIcon,
            iconBg: "bg-neutral-100",
            iconColor: "text-neutral-600",
          },
          {
            title: "My Venues",
            description: "View and manage all your registered venues.",
            href: "/dashboard/venues",
            icon: ListIcon,
            iconBg: "t-bg-secondary",
            iconColor: "t-text-muted",
          },
        ]
      : []),
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold t-text lg:text-3xl">
          Welcome back{user?.name ? `, ${user.name}` : ""}
        </h1>
        <p className="mt-1 t-text-muted">
          Here&apos;s an overview of your events and venues.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="stat-card">
            <div className="flex items-center gap-4">
              <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${stat.iconBg}`}>
                <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
              </div>
              <div>
                <p className="stat-number t-text">
                  {loading ? "-" : stat.value.toLocaleString()}
                </p>
                <p className="stat-label t-text-muted">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="mb-4 text-lg font-semibold t-text">Quick Actions</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action) => (
            <button
              key={action.title}
              onClick={() => router.push(action.href)}
              className="quick-action-card group text-left"
            >
              <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${action.iconBg}`}>
                <action.icon className={`h-6 w-6 ${action.iconColor}`} />
              </div>
              <h3 className="mt-4 text-sm font-semibold t-text group-hover:text-neutral-600 transition-colors">
                {action.title}
              </h3>
              <p className="mt-1 text-xs t-text-muted">{action.description}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
