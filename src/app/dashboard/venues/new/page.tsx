"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";

interface VenueResponse {
  id: string;
  name: string;
  address: string;
  table_count: number;
  logo_url: string;
}

export default function CreateVenuePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [tableCount, setTableCount] = useState(1);
  const [logoUrl, setLogoUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const venue = await api.post<VenueResponse>("/api/venues", {
        name,
        address,
        table_count: tableCount,
        logo_url: logoUrl,
      });
      router.push(`/dashboard/venues/${venue.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create venue");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen t-bg">
      {/* Header */}
      <header className="border-b t-border t-bg-card">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="text-sm font-medium t-text-muted hover:t-text-secondary"
            >
              Dashboard
            </Link>
            <span className="t-text-faint">/</span>
            <span className="text-sm font-semibold t-text">
              New Venue
            </span>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <h1 className="mb-1 text-2xl font-bold t-text">
          Create a New Venue
        </h1>
        <p className="mb-8 text-sm t-text-muted">
          Set up your bar or venue to start taking orders.
        </p>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Venue Name */}
          <div>
            <label
              htmlFor="name"
              className="mb-1.5 block text-sm font-medium t-text-secondary"
            >
              Venue Name
            </label>
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. The Velvet Lounge"
              className="w-full rounded-lg border t-border t-bg-card px-4 py-2.5 text-sm t-text placeholder-[#9C9C9C] outline-none transition-colors focus:border-eco focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          {/* Address */}
          <div>
            <label
              htmlFor="address"
              className="mb-1.5 block text-sm font-medium t-text-secondary"
            >
              Address
            </label>
            <input
              id="address"
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. 12 Admiralty Way, Lekki Phase 1, Lagos"
              className="w-full rounded-lg border t-border t-bg-card px-4 py-2.5 text-sm t-text placeholder-[#9C9C9C] outline-none transition-colors focus:border-eco focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          {/* Table Count */}
          <div>
            <label
              htmlFor="tableCount"
              className="mb-1.5 block text-sm font-medium t-text-secondary"
            >
              Number of Tables
            </label>
            <input
              id="tableCount"
              type="number"
              required
              min={1}
              max={500}
              value={tableCount}
              onChange={(e) => setTableCount(Number(e.target.value))}
              className="w-full rounded-lg border t-border t-bg-card px-4 py-2.5 text-sm t-text placeholder-[#9C9C9C] outline-none transition-colors focus:border-eco focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          {/* Logo URL */}
          <div>
            <label
              htmlFor="logoUrl"
              className="mb-1.5 block text-sm font-medium t-text-secondary"
            >
              Logo URL
            </label>
            <input
              id="logoUrl"
              type="url"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              placeholder="https://example.com/logo.png"
              className="w-full rounded-lg border t-border t-bg-card px-4 py-2.5 text-sm t-text placeholder-[#9C9C9C] outline-none transition-colors focus:border-eco focus:ring-2 focus:ring-emerald-500/20"
            />
            <p className="mt-1 text-xs t-text-faint">Optional</p>
          </div>

          {/* Submit */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-eco px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-eco-dark disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Venue"}
            </button>
            <Link
              href="/dashboard"
              className="rounded-lg px-6 py-2.5 text-sm font-medium t-text-muted transition-colors hover:t-text-secondary"
            >
              Cancel
            </Link>
          </div>
        </form>
      </main>
    </div>
  );
}
