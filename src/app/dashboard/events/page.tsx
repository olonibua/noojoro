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
    draft: "bg-[#F0F3EF] text-[#3A3D37]",
    active: "bg-[#8BC34A]/10 text-[#7CB342]",
    completed: "bg-blue-100 text-blue-700",
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#1C1F1A]">My Events</h1>
        <button
          onClick={() => router.push("/dashboard/events/new")}
          className="rounded-lg bg-[#8BC34A] px-4 py-2 text-sm font-semibold text-white hover:bg-[#7CB342]"
        >
          + Create Event
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#8BC34A] border-t-transparent" />
        </div>
      ) : events.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#E3E8E1] bg-white px-6 py-16 text-center">
          <p className="mb-2 text-lg font-medium text-[#3A3D37]">No events yet</p>
          <p className="mb-6 text-sm text-[#6B7366]">
            Create your first event to get started.
          </p>
          <button
            onClick={() => router.push("/dashboard/events/new")}
            className="rounded-lg bg-[#8BC34A] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#7CB342]"
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
              className="group rounded-xl border border-[#E3E8E1] bg-white p-5 transition hover:border-[#8BC34A]/40 hover:shadow-md"
            >
              <div className="mb-3 flex items-start justify-between">
                <h3 className="text-lg font-semibold text-[#1C1F1A] group-hover:text-[#7CB342]">
                  {event.name}
                </h3>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColor[event.status] || "bg-[#F0F3EF] text-[#3A3D37]"}`}
                >
                  {event.status}
                </span>
              </div>
              <p className="text-sm text-[#6B7366]">{event.venue_name}</p>
              <div className="mt-3 flex items-center justify-between text-xs text-[#9CA396]">
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
