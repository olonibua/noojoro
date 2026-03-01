"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";

interface Venue {
  id: string;
  name: string;
  address: string;
  table_count: number;
  logo_url: string;
  created_at: string;
}

export default function VenueDetailPage() {
  const params = useParams();
  const venueId = params.id as string;

  const [venue, setVenue] = useState<Venue | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Edit state
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editTableCount, setEditTableCount] = useState(1);
  const [editLogoUrl, setEditLogoUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    async function fetchVenue() {
      try {
        const data = await api.get<Venue>(`/api/venues/${venueId}`);
        setVenue(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load venue");
      } finally {
        setLoading(false);
      }
    }
    fetchVenue();
  }, [venueId]);

  function startEditing() {
    if (!venue) return;
    setEditName(venue.name);
    setEditAddress(venue.address);
    setEditTableCount(venue.table_count);
    setEditLogoUrl(venue.logo_url || "");
    setSaveError("");
    setEditing(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaveError("");

    try {
      const updated = await api.put<Venue>(`/api/venues/${venueId}`, {
        name: editName,
        address: editAddress,
        table_count: editTableCount,
        logo_url: editLogoUrl,
      });
      setVenue(updated);
      setEditing(false);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  const navLinks = [
    {
      label: "Tables & QR Codes",
      href: `/dashboard/venues/${venueId}/tables`,
      description: "Configure tables and download QR codes",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      ),
    },
    {
      label: "Menu Builder",
      href: `/dashboard/venues/${venueId}/menu`,
      description: "Manage drink categories, items, and pricing",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
    },
    {
      label: "Live Dashboard",
      href: `/dashboard/venues/${venueId}/live`,
      description: "Real-time orders, revenue, and stock levels",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
    {
      label: "Analytics",
      href: `/dashboard/venues/${venueId}/analytics`,
      description: "Revenue, orders, and top-selling items",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center t-bg">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-neutral-300 border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center t-bg px-4">
        <div className="rounded-lg border border-red-200 bg-red-50 px-6 py-4 text-sm text-red-700">
          {error}
        </div>
        <Link
          href="/dashboard"
          className="mt-4 text-sm font-medium text-neutral-700 hover:text-neutral-700"
        >
          Back to Dashboard
        </Link>
      </div>
    );
  }

  if (!venue) return null;

  return (
    <div className="min-h-screen t-bg">
      {/* Header */}
      <header className="border-b t-border t-bg-card">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="text-sm font-medium t-text-muted hover:t-text-secondary"
            >
              Dashboard
            </Link>
            <span className="t-text-faint">/</span>
            <span className="text-sm font-semibold t-text">
              {venue.name}
            </span>
          </div>
          {!editing && (
            <button
              onClick={startEditing}
              className="rounded-lg border t-border t-bg-card px-4 py-2 text-sm font-medium t-text-secondary transition-colors hover:t-bg"
            >
              Edit Venue
            </button>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        {/* Venue Info */}
        {editing ? (
          <form
            onSubmit={handleSave}
            className="mb-10 rounded-xl border t-border t-bg-card p-6"
          >
            <h2 className="mb-4 text-lg font-semibold t-text">
              Edit Venue
            </h2>

            {saveError && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {saveError}
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium t-text-secondary">
                  Venue Name
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full rounded-lg border t-border t-bg-card px-4 py-2.5 text-sm t-text outline-none focus:border-eco focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium t-text-secondary">
                  Address
                </label>
                <input
                  type="text"
                  required
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                  className="w-full rounded-lg border t-border t-bg-card px-4 py-2.5 text-sm t-text outline-none focus:border-eco focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium t-text-secondary">
                  Table Count
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  max={500}
                  value={editTableCount}
                  onChange={(e) => setEditTableCount(Number(e.target.value))}
                  className="w-full rounded-lg border t-border t-bg-card px-4 py-2.5 text-sm t-text outline-none focus:border-eco focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium t-text-secondary">
                  Logo URL
                </label>
                <input
                  type="url"
                  value={editLogoUrl}
                  onChange={(e) => setEditLogoUrl(e.target.value)}
                  placeholder="https://example.com/logo.png"
                  className="w-full rounded-lg border t-border t-bg-card px-4 py-2.5 text-sm t-text placeholder-[#9C9C9C] outline-none focus:border-eco focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            </div>

            <div className="mt-5 flex items-center gap-3">
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-eco px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-eco-dark disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="rounded-lg px-5 py-2.5 text-sm font-medium t-text-muted hover:t-text-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="mb-10 rounded-xl border t-border t-bg-card p-6">
            <div className="flex items-start gap-5">
              {venue.logo_url && (
                <img
                  src={venue.logo_url}
                  alt={`${venue.name} logo`}
                  className="h-16 w-16 rounded-xl object-cover"
                />
              )}
              <div className="flex-1">
                <h1 className="text-2xl font-bold t-text">
                  {venue.name}
                </h1>
                <p className="mt-1 text-sm t-text-muted">{venue.address}</p>
                <div className="mt-3 flex flex-wrap gap-3">
                  <span className="inline-flex items-center rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-700">
                    {venue.table_count} {venue.table_count === 1 ? "table" : "tables"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Cards */}
        <h2 className="mb-4 text-lg font-semibold t-text">Manage</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="group rounded-xl border t-border t-bg-card p-5 transition-all hover:border-neutral-300/40 hover:shadow-md"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-700 transition-colors group-hover:bg-neutral-100">
                  {link.icon}
                </div>
                <div>
                  <h3 className="font-semibold t-text">{link.label}</h3>
                  <p className="mt-0.5 text-sm t-text-muted">
                    {link.description}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
