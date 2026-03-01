"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";

interface Event {
  id: string;
  name: string;
  date: string;
  venue_name: string;
  status: string;
  total_tokens: number;
}

export default function EventsListPage() {
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<Event[]>("/api/events")
      .then(setEvents)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const statusColor: Record<string, string> = {
    draft: "bg-gray-100 text-gray-700",
    active: "bg-emerald-100 text-emerald-700",
    completed: "bg-blue-100 text-blue-700",
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">My Events</h1>
        <button
          onClick={() => router.push("/dashboard/events/new")}
          className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600"
        >
          + Create Event
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
        </div>
      ) : events.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
          <p className="mb-2 text-lg font-medium text-gray-700">No events yet</p>
          <p className="mb-6 text-sm text-gray-500">
            Create your first event to get started.
          </p>
          <button
            onClick={() => router.push("/dashboard/events/new")}
            className="rounded-lg bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-600"
          >
            Create Event
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <Link
              key={event.id}
              href={`/dashboard/events/${event.id}`}
              className="group rounded-xl border border-gray-200 bg-white p-5 transition hover:border-emerald-300 hover:shadow-md"
            >
              <div className="mb-3 flex items-start justify-between">
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-emerald-600">
                  {event.name}
                </h3>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColor[event.status] || "bg-gray-100 text-gray-700"}`}
                >
                  {event.status}
                </span>
              </div>
              <p className="text-sm text-gray-500">{event.venue_name}</p>
              <div className="mt-3 flex items-center justify-between text-xs text-gray-400">
                <span>{new Date(event.date).toLocaleDateString()}</span>
                <span>{event.total_tokens} tokens</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
