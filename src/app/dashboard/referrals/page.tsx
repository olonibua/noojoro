"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

interface WalletData {
  total_earned: string;
  total_withdrawn: string;
  available_balance: string;
  pending_withdrawals: string;
}

interface CommissionData {
  id: string;
  source_user_email: string | null;
  source_user_phone: string | null;
  level: number;
  percentage: string;
  amount: string;
  status: string;
  created_at: string;
}

interface DashboardData {
  referral_code: string;
  referral_link: string;
  wallet: WalletData;
  network_counts: { level_1: number; level_2: number; level_3: number };
  recent_commissions: CommissionData[];
}

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-1.5 rounded-lg bg-eco/10 px-3 py-1.5 text-xs font-medium text-eco hover:bg-eco/20 transition-colors"
    >
      {copied ? (
        <>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          Copied!
        </>
      ) : (
        <>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          {label}
        </>
      )}
    </button>
  );
}

export default function ReferralsPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<DashboardData>("/api/referrals/dashboard")
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
    return <p className="t-text-muted py-10 text-center">Failed to load referral data.</p>;
  }

  const fmt = (v: string) =>
    Number(v).toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="space-y-8">
      {/* Referral Code + Link */}
      <div className="card-elevated rounded-2xl p-6">
        <h2 className="text-lg font-semibold t-text mb-4">Your Referral Code</h2>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <span className="rounded-xl bg-eco/10 px-4 py-2.5 text-lg font-bold text-eco tracking-wider">
              {data.referral_code}
            </span>
            <CopyButton text={data.referral_code} label="Copy Code" />
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm t-text-muted truncate max-w-[280px]">{data.referral_link}</span>
            <CopyButton text={data.referral_link} label="Copy Link" />
          </div>
        </div>
      </div>

      {/* Event Proof Bonus Banner */}
      <div className="card-elevated rounded-2xl p-5 border-l-4 border-eco">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold t-text">Boost Your L2 Commission</h3>
            <p className="text-sm t-text-muted mt-0.5">
              Upload event proof photos to earn an extra 3% on Level 2 commissions (3% &rarr; 6%).
            </p>
          </div>
          <button
            onClick={() => router.push("/dashboard/event-proofs")}
            className="btn-primary px-4 py-2 text-sm whitespace-nowrap"
          >
            Upload Event Proof
          </button>
        </div>
      </div>

      {/* Wallet Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Earned", value: data.wallet.total_earned, color: "text-eco" },
          { label: "Available", value: data.wallet.available_balance, color: "text-eco" },
          { label: "Withdrawn", value: data.wallet.total_withdrawn, color: "t-text" },
          { label: "Pending", value: data.wallet.pending_withdrawals, color: "text-amber-500" },
        ].map((stat) => (
          <div key={stat.label} className="card-elevated rounded-2xl p-5">
            <p className="text-xs font-medium t-text-muted mb-1">{stat.label}</p>
            <p className={`text-xl font-bold ${stat.color}`}>NGN {fmt(stat.value)}</p>
          </div>
        ))}
      </div>

      {/* Network Size */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Associates (L1)", count: data.network_counts.level_1, rate: "15%" },
          { label: "Level 2", count: data.network_counts.level_2, rate: "3%" },
          { label: "Level 3", count: data.network_counts.level_3, rate: "2%" },
        ].map((item) => (
          <div key={item.label} className="card-elevated rounded-2xl p-5 text-center">
            <p className="text-3xl font-bold text-eco">{item.count}</p>
            <p className="text-sm font-medium t-text mt-1">{item.label}</p>
            <p className="text-xs t-text-faint">{item.rate} commission</p>
          </div>
        ))}
      </div>

      {/* Recent Commissions */}
      <div className="card-elevated rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold t-text">Recent Commissions</h2>
        </div>
        {data.recent_commissions.length === 0 ? (
          <p className="text-sm t-text-muted py-6 text-center">
            No commissions yet. Share your referral link to start earning!
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b t-border">
                  <th className="pb-3 text-left font-medium t-text-muted">From</th>
                  <th className="pb-3 text-left font-medium t-text-muted">Level</th>
                  <th className="pb-3 text-left font-medium t-text-muted">Rate</th>
                  <th className="pb-3 text-right font-medium t-text-muted">Amount</th>
                  <th className="pb-3 text-right font-medium t-text-muted">Date</th>
                </tr>
              </thead>
              <tbody>
                {data.recent_commissions.map((c) => (
                  <tr key={c.id} className="border-b t-border last:border-0">
                    <td className="py-3 t-text">{c.source_user_email || c.source_user_phone || "---"}</td>
                    <td className="py-3">
                      <span className="rounded-full bg-eco/10 px-2 py-0.5 text-xs font-medium text-eco">
                        L{c.level}
                      </span>
                    </td>
                    <td className="py-3 t-text-muted">{c.percentage}%</td>
                    <td className="py-3 text-right font-medium t-text">NGN {fmt(c.amount)}</td>
                    <td className="py-3 text-right t-text-muted text-xs">
                      {new Date(c.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-4">
        <button
          onClick={() => router.push("/dashboard/referrals/network")}
          className="btn-primary px-6 py-2.5 text-sm"
        >
          View Network
        </button>
        <button
          onClick={() => router.push("/dashboard/referrals/withdrawals")}
          className="rounded-xl border t-border px-6 py-2.5 text-sm font-medium t-text hover:t-bg-secondary transition-colors"
        >
          Withdrawals
        </button>
        <button
          onClick={() => router.push("/dashboard/event-proofs")}
          className="rounded-xl border t-border px-6 py-2.5 text-sm font-medium t-text hover:t-bg-secondary transition-colors"
        >
          Upload Event Proof
        </button>
      </div>
    </div>
  );
}
