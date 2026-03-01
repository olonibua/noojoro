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
        <h1 className="text-2xl font-bold text-gray-900">My Venues</h1>
        <button
          onClick={() => router.push("/dashboard/venues/new")}
          className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600"
        >
          + Create Venue
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
        </div>
      ) : venues.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
          <p className="mb-2 text-lg font-medium text-gray-700">No venues yet</p>
          <p className="mb-6 text-sm text-gray-500">
            Create your first venue to start taking orders.
          </p>
          <button
            onClick={() => router.push("/dashboard/venues/new")}
            className="rounded-lg bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-600"
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
              className="group rounded-xl border border-gray-200 bg-white p-5 transition hover:border-emerald-300 hover:shadow-md"
            >
              <div className="mb-3 flex items-start justify-between">
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-emerald-600">
                  {venue.name}
                </h3>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    venue.status === "active"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {venue.status}
                </span>
              </div>
              {venue.address && (
                <p className="text-sm text-gray-500">{venue.address}</p>
              )}
              <div className="mt-3 text-xs text-gray-400">
                {venue.table_count} tables
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
