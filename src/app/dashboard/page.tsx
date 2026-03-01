"use client";

import { useRouter } from "next/navigation";

export default function DashboardHome() {
  const router = useRouter();

  return (
    <div className="mx-auto max-w-3xl py-12">
      <h1 className="text-3xl font-bold text-[#1C1F1A]">Welcome to No Ojoro</h1>
      <p className="mt-2 text-[#6B7366]">
        Manage your events and venues from one place. Get started below.
      </p>

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        {/* Create Event Card */}
        <button
          onClick={() => router.push("/dashboard/events/new")}
          className="group flex flex-col items-start rounded-xl border border-[#E3E8E1] bg-white p-6 text-left shadow-sm transition-all hover:border-[#8BC34A]/40 hover:shadow-md"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#8BC34A]/10">
            <svg className="h-6 w-6 text-[#8BC34A]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z" />
            </svg>
          </div>
          <h3 className="mt-4 text-lg font-semibold text-[#1C1F1A] group-hover:text-[#8BC34A]">
            Create Event
          </h3>
          <p className="mt-1 text-sm text-[#6B7366]">
            Set up a new event with tables, menus, staff, and tokens.
          </p>
        </button>

        {/* Create Venue Card */}
        <button
          onClick={() => router.push("/dashboard/venues/new")}
          className="group flex flex-col items-start rounded-xl border border-[#E3E8E1] bg-white p-6 text-left shadow-sm transition-all hover:border-[#8BC34A]/40 hover:shadow-md"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#8BC34A]/10">
            <svg className="h-6 w-6 text-[#8BC34A]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
            </svg>
          </div>
          <h3 className="mt-4 text-lg font-semibold text-[#1C1F1A] group-hover:text-[#8BC34A]">
            Create Venue
          </h3>
          <p className="mt-1 text-sm text-[#6B7366]">
            Register a venue for bar and restaurant operations.
          </p>
        </button>

        {/* View Events Card */}
        <button
          onClick={() => router.push("/dashboard/events")}
          className="group flex flex-col items-start rounded-xl border border-[#E3E8E1] bg-white p-6 text-left shadow-sm transition-all hover:border-[#8BC34A]/40 hover:shadow-md"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#F0F3EF]">
            <svg className="h-6 w-6 text-[#6B7366]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
          </div>
          <h3 className="mt-4 text-lg font-semibold text-[#1C1F1A] group-hover:text-[#8BC34A]">
            My Events
          </h3>
          <p className="mt-1 text-sm text-[#6B7366]">
            View and manage all your existing events.
          </p>
        </button>

        {/* View Venues Card */}
        <button
          onClick={() => router.push("/dashboard/venues")}
          className="group flex flex-col items-start rounded-xl border border-[#E3E8E1] bg-white p-6 text-left shadow-sm transition-all hover:border-[#8BC34A]/40 hover:shadow-md"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#F0F3EF]">
            <svg className="h-6 w-6 text-[#6B7366]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3H21m-3.75 3H21" />
            </svg>
          </div>
          <h3 className="mt-4 text-lg font-semibold text-[#1C1F1A] group-hover:text-[#8BC34A]">
            My Venues
          </h3>
          <p className="mt-1 text-sm text-[#6B7366]">
            View and manage all your registered venues.
          </p>
        </button>
      </div>
    </div>
  );
}
