"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

interface NetworkMember {
  masked_identity: string;
  joined_at: string;
  commissions_from: string;
}

interface NetworkData {
  level_1: NetworkMember[];
  level_2: NetworkMember[];
  level_3: NetworkMember[];
}

const tabs = [
  { key: "level_1", label: "Associates (L1)", rate: "15%" },
  { key: "level_2", label: "Level 2", rate: "3%" },
  { key: "level_3", label: "Level 3", rate: "2%" },
] as const;

export default function NetworkPage() {
  const router = useRouter();
  const [data, setData] = useState<NetworkData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<keyof NetworkData>("level_1");

  useEffect(() => {
    api
      .get<NetworkData>("/api/referrals/network")
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 t-border border-t-eco" />
      </div>
    );
  }

  if (!data) {
    return <p className="t-text-muted py-10 text-center">Failed to load network data.</p>;
  }

  const fmt = (v: string) =>
    Number(v).toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const members = data[activeTab];
  const activeTabInfo = tabs.find((t) => t.key === activeTab)!;

  return (
    <div className="space-y-6">
      <button
        onClick={() => router.push("/dashboard/referrals")}
        className="inline-flex items-center gap-1.5 text-sm t-text-muted hover:t-text transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Back to Referrals
      </button>

      <h2 className="text-xl font-bold t-text">Your Network</h2>

      {/* Tabs */}
      <div className="flex overflow-hidden rounded-xl t-tab-bg p-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition-all ${
              activeTab === tab.key
                ? "bg-eco text-white shadow-sm"
                : "t-text-muted hover:text-eco"
            }`}
          >
            {tab.label} ({data[tab.key].length})
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="card-elevated rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold t-text">{activeTabInfo.label}</h3>
          <span className="text-xs t-text-muted">{activeTabInfo.rate} commission rate</span>
        </div>

        {members.length === 0 ? (
          <p className="text-sm t-text-muted py-8 text-center">
            No members at this level yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b t-border">
                  <th className="pb-3 text-left font-medium t-text-muted">User</th>
                  <th className="pb-3 text-left font-medium t-text-muted">Joined</th>
                  <th className="pb-3 text-right font-medium t-text-muted">Commissions Earned</th>
                </tr>
              </thead>
              <tbody>
                {members.map((m, i) => (
                  <tr key={i} className="border-b t-border last:border-0">
                    <td className="py-3 t-text">{m.masked_identity}</td>
                    <td className="py-3 t-text-muted">
                      {new Date(m.joined_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 text-right font-medium t-text">
                      NGN {fmt(m.commissions_from)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
