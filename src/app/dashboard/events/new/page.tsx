"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useToast } from "@/lib/toast";
import WizardSteps from "@/components/wizard/WizardSteps";

interface CreateEventResponse {
  id: string;
}

export default function CreateEventPage() {
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    date: "",
    venue_name: "",
    table_count: 10,
    guests_per_table: 10,
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
    setLoading(true);

    try {
      const payload = {
        name: form.name,
        date: form.date,
        time: null,
        venue_name: form.venue_name,
        table_count: form.table_count,
        guests_per_table: form.guests_per_table,
      };

      const result = await api.post<CreateEventResponse>("/api/events", payload);
      router.push(`/dashboard/events/${result.id}/menu`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create event");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <WizardSteps currentStep={1} />

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
          Set up your event details. You&apos;ll configure menu, staff, and styling next.
        </p>

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
