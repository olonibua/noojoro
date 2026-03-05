"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import type { User, Event, Venue } from "@/lib/types";
import {
  CalendarIcon,
  CheckCircleIcon,
  BuildingIcon,
  TokenIcon,
  PlusIcon,
  ListIcon,
} from "@/components/icons";

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
      iconBg: "t-bg-secondary",
      iconColor: "t-text-muted",
    },
    {
      label: "Active Events",
      value: activeEvents,
      icon: CheckCircleIcon,
      iconBg: "t-bg-secondary",
      iconColor: "t-text-muted",
    },
    {
      label: "Venues",
      value: totalVenues,
      icon: BuildingIcon,
      iconBg: "t-bg-secondary",
      iconColor: "t-text-muted",
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
            iconBg: "t-bg-secondary",
            iconColor: "t-text-muted",
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
            iconBg: "t-bg-secondary",
            iconColor: "t-text-muted",
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
              <h3 className="mt-4 text-sm font-semibold t-text group-hover:text-eco transition-colors">
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
