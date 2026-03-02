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
    venue_name: "",
    table_count: 10,
    guests_per_table: 10,
    primary_color: "#22C55E",
    secondary_color: "#FFFFFF",
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
        time: null,
        venue_name: form.venue_name,
        table_count: form.table_count,
        guests_per_table: form.guests_per_table,
        primary_color: form.primary_color,
        secondary_color: form.secondary_color,
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
          className="text-sm t-text-muted hover:t-text-secondary transition-colors"
        >
          &larr; Back
        </button>
      </div>

      <div className="rounded-xl border t-border t-bg-card p-6 shadow-sm">
        <h1 className="text-2xl font-bold t-text">Create Event</h1>
        <p className="mt-1 text-sm t-text-muted">
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
            <label htmlFor="name" className="block text-sm font-medium t-text-secondary">
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
              className="mt-1 block w-full rounded-lg border t-border px-3 py-2.5 text-sm t-text placeholder-[#9C9C9C] focus:border-eco focus:outline-none focus:ring-1 focus:ring-eco"
            />
          </div>

          {/* Event Date */}
          <div>
            <label htmlFor="date" className="block text-sm font-medium t-text-secondary">
              Event Date
            </label>
            <input
              id="date"
              name="date"
              type="date"
              required
              value={form.date}
              onChange={handleChange}
              className="mt-1 block w-full rounded-lg border t-border px-3 py-2.5 text-sm t-text focus:border-eco focus:outline-none focus:ring-1 focus:ring-eco"
            />
          </div>

          {/* Venue Name */}
          <div>
            <label htmlFor="venue_name" className="block text-sm font-medium t-text-secondary">
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
              className="mt-1 block w-full rounded-lg border t-border px-3 py-2.5 text-sm t-text placeholder-[#9C9C9C] focus:border-eco focus:outline-none focus:ring-1 focus:ring-eco"
            />
          </div>

          {/* Table Count & Guests per Table */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="table_count" className="block text-sm font-medium t-text-secondary">
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
                className="mt-1 block w-full rounded-lg border t-border px-3 py-2.5 text-sm t-text focus:border-eco focus:outline-none focus:ring-1 focus:ring-eco"
              />
            </div>
            <div>
              <label htmlFor="guests_per_table" className="block text-sm font-medium t-text-secondary">
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
                className="mt-1 block w-full rounded-lg border t-border px-3 py-2.5 text-sm t-text focus:border-eco focus:outline-none focus:ring-1 focus:ring-eco"
              />
            </div>
          </div>

          {/* Total Guests (read-only) */}
          <div>
            <label className="block text-sm font-medium t-text-secondary">
              Total Guests
            </label>
            <div className="mt-1 rounded-lg border t-border bg-neutral-50 px-3 py-2.5 text-sm t-text font-semibold">
              {(form.table_count * form.guests_per_table).toLocaleString()} guests
            </div>
          </div>

          {/* Colors of the Day */}
          <div>
            <label className="block text-sm font-medium t-text-secondary mb-3">
              Colors of the Day
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="primary_color" className="block text-xs font-medium t-text-muted mb-1">
                  Primary Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    id="primary_color"
                    name="primary_color"
                    type="text"
                    value={form.primary_color}
                    onChange={handleChange}
                    placeholder="#22C55E"
                    pattern="^#[0-9A-Fa-f]{6}$"
                    className="block w-full rounded-lg border t-border px-3 py-2.5 text-sm t-text placeholder-[#9C9C9C] focus:border-eco focus:outline-none focus:ring-1 focus:ring-eco"
                  />
                  <input
                    type="color"
                    value={form.primary_color}
                    onChange={(e) => setForm((prev) => ({ ...prev, primary_color: e.target.value }))}
                    className="h-10 w-10 cursor-pointer rounded-lg border t-border p-0.5"
                  />
                  <div
                    className="h-10 w-10 shrink-0 rounded-lg border t-border"
                    style={{ backgroundColor: form.primary_color }}
                  />
                </div>
              </div>
              <div>
                <label htmlFor="secondary_color" className="block text-xs font-medium t-text-muted mb-1">
                  Secondary Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    id="secondary_color"
                    name="secondary_color"
                    type="text"
                    value={form.secondary_color}
                    onChange={handleChange}
                    placeholder="#FFFFFF"
                    pattern="^#[0-9A-Fa-f]{6}$"
                    className="block w-full rounded-lg border t-border px-3 py-2.5 text-sm t-text placeholder-[#9C9C9C] focus:border-eco focus:outline-none focus:ring-1 focus:ring-eco"
                  />
                  <input
                    type="color"
                    value={form.secondary_color}
                    onChange={(e) => setForm((prev) => ({ ...prev, secondary_color: e.target.value }))}
                    className="h-10 w-10 cursor-pointer rounded-lg border t-border p-0.5"
                  />
                  <div
                    className="h-10 w-10 shrink-0 rounded-lg border t-border"
                    style={{ backgroundColor: form.secondary_color }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-eco px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-eco-dark disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating..." : "Create Event"}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="rounded-lg border t-border px-6 py-2.5 text-sm font-medium t-text-secondary hover:t-bg transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
