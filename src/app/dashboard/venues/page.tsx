"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";

interface Venue {
  id: string;
  name: string;
  address: string | null;
  table_count: number;
  status: string;
}

export default function VenuesListPage() {
  const router = useRouter();
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<Venue[]>("/api/venues")
      .then(setVenues)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold t-text">My Venues</h1>
        <button
          onClick={() => router.push("/dashboard/venues/new")}
          className="rounded-lg bg-eco px-4 py-2 text-sm font-semibold text-white hover:bg-eco-dark"
        >
          + Create Venue
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 t-border border-t-transparent" />
        </div>
      ) : venues.length === 0 ? (
        <div className="rounded-xl border border-dashed t-border t-bg-card px-6 py-16 text-center">
          <p className="mb-2 text-lg font-medium t-text-secondary">No venues yet</p>
          <p className="mb-6 text-sm t-text-muted">
            Create your first venue to start taking orders.
          </p>
          <button
            onClick={() => router.push("/dashboard/venues/new")}
            className="rounded-lg bg-eco px-5 py-2.5 text-sm font-semibold text-white hover:bg-eco-dark"
          >
            Create Venue
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {venues.map((venue) => (
            <Link
              key={venue.id}
              href={`/dashboard/venues/${venue.id}`}
              className="group rounded-xl border t-border t-bg-card p-5 transition hover:border-eco/30 hover:shadow-md"
            >
              <div className="mb-3 flex items-start justify-between">
                <h3 className="text-lg font-semibold t-text group-hover:text-eco">
                  {venue.name}
                </h3>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    venue.status === "active"
                      ? "t-bg-secondary t-text-secondary"
                      : "t-bg-secondary t-text-secondary"
                  }`}
                >
                  {venue.status}
                </span>
              </div>
              {venue.address && (
                <p className="text-sm t-text-muted">{venue.address}</p>
              )}
              <div className="mt-3 text-xs t-text-faint">
                {venue.table_count} tables
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
