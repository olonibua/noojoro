"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { api } from "@/lib/api";

interface EventDetail {
  id: string;
  name: string;
  date: string;
  time: string;
  venue_name: string;
  table_count: number;
  guests_per_table: number;
  theme_color: string;
  status: string;
  total_tokens: number;
}

const statusColors: Record<string, string> = {
  draft: "bg-yellow-100 text-yellow-800",
  active: "bg-green-100 text-green-800",
  completed: "bg-gray-100 text-gray-600",
};

export default function EventDetailPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params.id as string;

  const [event, setEvent] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    date: "",
    time: "",
    venue_name: "",
    theme_color: "",
  });

  const fetchEvent = useCallback(async () => {
    try {
      const data = await api.get<EventDetail>(`/api/events/${eventId}`);
      setEvent(data);
      setEditForm({
        name: data.name,
        date: data.date || "",
        time: data.time || "",
        venue_name: data.venue_name,
        theme_color: data.theme_color || "#22C55E",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load event");
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    fetchEvent();
  }, [fetchEvent]);

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      await api.put(`/api/events/${eventId}`, editForm);
      setEditing(false);
      await fetchEvent();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update event");
    } finally {
      setSaving(false);
    }
  };

  const quickLinks = [
    { label: "Tables", href: `/dashboard/events/${eventId}/tables`, icon: "grid" },
    { label: "Menu", href: `/dashboard/events/${eventId}/menu`, icon: "utensils" },
    { label: "Staff", href: `/dashboard/events/${eventId}/staff`, icon: "users" },
    { label: "Photos", href: `/dashboard/events/${eventId}/photos`, icon: "camera" },
    { label: "Tokens", href: `/dashboard/events/${eventId}/tokens`, icon: "ticket" },
    { label: "Live Dashboard", href: `/dashboard/events/${eventId}/live`, icon: "activity" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-[#22C55E]" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="mx-auto max-w-3xl py-12 text-center">
        <p className="text-red-600">{error || "Event not found"}</p>
        <button
          onClick={() => router.push("/dashboard/events")}
          className="mt-4 text-sm text-[#22C55E] hover:underline"
        >
          Back to Events
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6">
        <button
          onClick={() => router.push("/dashboard/events")}
          className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          &larr; All Events
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Event Header Card */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex-1">
            {editing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Event Name</label>
                  <input
                    value={editForm.name}
                    onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))}
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#22C55E] focus:outline-none focus:ring-1 focus:ring-[#22C55E]"
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Date</label>
                    <input
                      type="date"
                      value={editForm.date}
                      onChange={(e) => setEditForm((p) => ({ ...p, date: e.target.value }))}
                      className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#22C55E] focus:outline-none focus:ring-1 focus:ring-[#22C55E]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Time</label>
                    <input
                      type="time"
                      value={editForm.time}
                      onChange={(e) => setEditForm((p) => ({ ...p, time: e.target.value }))}
                      className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#22C55E] focus:outline-none focus:ring-1 focus:ring-[#22C55E]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Venue</label>
                    <input
                      value={editForm.venue_name}
                      onChange={(e) => setEditForm((p) => ({ ...p, venue_name: e.target.value }))}
                      className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#22C55E] focus:outline-none focus:ring-1 focus:ring-[#22C55E]"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Theme Color</label>
                  <div className="mt-1 flex items-center gap-2">
                    <input
                      value={editForm.theme_color}
                      onChange={(e) => setEditForm((p) => ({ ...p, theme_color: e.target.value }))}
                      className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#22C55E] focus:outline-none focus:ring-1 focus:ring-[#22C55E]"
                    />
                    <input
                      type="color"
                      value={editForm.theme_color}
                      onChange={(e) => setEditForm((p) => ({ ...p, theme_color: e.target.value }))}
                      className="h-9 w-9 rounded border border-gray-300 p-0.5 cursor-pointer"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="rounded-lg bg-[#22C55E] px-4 py-2 text-sm font-semibold text-white hover:bg-[#16A34A] disabled:opacity-50"
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                  <button
                    onClick={() => setEditing(false)}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-gray-900">{event.name}</h1>
                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
                      statusColors[event.status] || "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {event.status}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-500">
                  <span>
                    {new Date(event.date).toLocaleDateString("en-NG", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                    {event.time && ` at ${event.time.slice(0, 5)}`}
                  </span>
                  <span>{event.venue_name}</span>
                </div>
                <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-500">
                  <span>{event.table_count} tables</span>
                  <span>{event.guests_per_table} guests/table</span>
                  <span>{event.total_tokens} total tokens</span>
                </div>
              </>
            )}
          </div>

          {!editing && (
            <div className="flex items-center gap-2">
              <div
                className="h-6 w-6 rounded-full border border-gray-200"
                style={{ backgroundColor: event.theme_color || "#22C55E" }}
                title={event.theme_color}
              />
              <button
                onClick={() => setEditing(true)}
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Edit
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Quick Links */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {quickLinks.map((link) => (
          <button
            key={link.href}
            onClick={() => router.push(link.href)}
            className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 text-left shadow-sm transition-all hover:border-[#22C55E]/40 hover:shadow-md"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#22C55E]/10">
              <span className="text-sm font-bold text-[#22C55E]">
                {link.label.charAt(0)}
              </span>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">{link.label}</p>
              <p className="text-xs text-gray-500">Manage {link.label.toLowerCase()}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
