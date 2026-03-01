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
        <h1 className="text-2xl font-bold text-[#1C1F1A]">My Venues</h1>
        <button
          onClick={() => router.push("/dashboard/venues/new")}
          className="rounded-lg bg-eco px-4 py-2 text-sm font-semibold text-white hover:bg-eco-dark"
        >
          + Create Venue
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-eco border-t-transparent" />
        </div>
      ) : venues.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#E3E8E1] bg-white px-6 py-16 text-center">
          <p className="mb-2 text-lg font-medium text-[#3A3D37]">No venues yet</p>
          <p className="mb-6 text-sm text-[#6B7366]">
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
              className="group rounded-xl border border-[#E3E8E1] bg-white p-5 transition hover:border-eco/40 hover:shadow-md"
            >
              <div className="mb-3 flex items-start justify-between">
                <h3 className="text-lg font-semibold text-[#1C1F1A] group-hover:text-eco-dark">
                  {venue.name}
                </h3>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    venue.status === "active"
                      ? "bg-eco/10 text-eco-dark"
                      : "bg-[#F0F3EF] text-[#3A3D37]"
                  }`}
                >
                  {venue.status}
                </span>
              </div>
              {venue.address && (
                <p className="text-sm text-[#6B7366]">{venue.address}</p>
              )}
              <div className="mt-3 text-xs text-[#9CA396]">
                {venue.table_count} tables
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
