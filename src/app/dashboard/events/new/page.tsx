"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

interface CreateEventResponse {
  id: string;
}

export default function CreateEventPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    date: "",
    time: "",
    venue_name: "",
    table_count: 10,
    guests_per_table: 10,
    theme_color: "#22C55E",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "number" ? parseInt(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const payload = {
        name: form.name,
        date: form.date,
        time: form.time || "00:00:00",
        venue_name: form.venue_name,
        table_count: form.table_count,
        guests_per_table: form.guests_per_table,
        theme_color: form.theme_color,
      };

      const result = await api.post<CreateEventResponse>("/api/events", payload);
      router.push(`/dashboard/events/${result.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create event");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          &larr; Back
        </button>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">Create Event</h1>
        <p className="mt-1 text-sm text-gray-500">
          Set up your event details. You can configure tables, menus, and staff later.
        </p>

        {error && (
          <div className="mt-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          {/* Event Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Event Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              value={form.name}
              onChange={handleChange}
              placeholder="e.g., Tunde & Adaeze's Wedding"
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-[#22C55E] focus:outline-none focus:ring-1 focus:ring-[#22C55E]"
            />
          </div>

          {/* Date & Time */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                Event Date
              </label>
              <input
                id="date"
                name="date"
                type="date"
                required
                value={form.date}
                onChange={handleChange}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 focus:border-[#22C55E] focus:outline-none focus:ring-1 focus:ring-[#22C55E]"
              />
            </div>
            <div>
              <label htmlFor="time" className="block text-sm font-medium text-gray-700">
                Event Time
              </label>
              <input
                id="time"
                name="time"
                type="time"
                value={form.time}
                onChange={handleChange}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 focus:border-[#22C55E] focus:outline-none focus:ring-1 focus:ring-[#22C55E]"
              />
            </div>
          </div>

          {/* Venue Name */}
          <div>
            <label htmlFor="venue_name" className="block text-sm font-medium text-gray-700">
              Venue Name
            </label>
            <input
              id="venue_name"
              name="venue_name"
              type="text"
              required
              value={form.venue_name}
              onChange={handleChange}
              placeholder="e.g., Eko Hotels Convention Centre"
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-[#22C55E] focus:outline-none focus:ring-1 focus:ring-[#22C55E]"
            />
          </div>

          {/* Table Count & Guests per Table */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="table_count" className="block text-sm font-medium text-gray-700">
                Number of Tables
              </label>
              <input
                id="table_count"
                name="table_count"
                type="number"
                min={1}
                required
                value={form.table_count}
                onChange={handleChange}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 focus:border-[#22C55E] focus:outline-none focus:ring-1 focus:ring-[#22C55E]"
              />
            </div>
            <div>
              <label htmlFor="guests_per_table" className="block text-sm font-medium text-gray-700">
                Guests per Table
              </label>
              <input
                id="guests_per_table"
                name="guests_per_table"
                type="number"
                min={1}
                required
                value={form.guests_per_table}
                onChange={handleChange}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 focus:border-[#22C55E] focus:outline-none focus:ring-1 focus:ring-[#22C55E]"
              />
            </div>
          </div>

          {/* Theme Color */}
          <div>
            <label htmlFor="theme_color" className="block text-sm font-medium text-gray-700">
              Theme Color
            </label>
            <div className="mt-1 flex items-center gap-3">
              <input
                id="theme_color"
                name="theme_color"
                type="text"
                value={form.theme_color}
                onChange={handleChange}
                placeholder="#22C55E"
                pattern="^#[0-9A-Fa-f]{6}$"
                className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-[#22C55E] focus:outline-none focus:ring-1 focus:ring-[#22C55E]"
              />
              <input
                type="color"
                value={form.theme_color}
                onChange={(e) => setForm((prev) => ({ ...prev, theme_color: e.target.value }))}
                className="h-10 w-10 cursor-pointer rounded-lg border border-gray-300 p-0.5"
              />
              <div
                className="h-10 w-10 rounded-lg border border-gray-200"
                style={{ backgroundColor: form.theme_color }}
              />
            </div>
          </div>

          {/* Submit */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-[#22C55E] px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#16A34A] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating..." : "Create Event"}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="rounded-lg border border-gray-300 px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
