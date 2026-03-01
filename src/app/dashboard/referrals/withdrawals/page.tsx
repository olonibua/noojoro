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

interface WithdrawalData {
  id: string;
  amount: string;
  status: string;
  admin_note: string | null;
  bank_name: string;
  account_number: string;
  account_name: string;
  created_at: string;
}

export default function WithdrawalsPage() {
  const router = useRouter();
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [withdrawals, setWithdrawals] = useState<WithdrawalData[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [amount, setAmount] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadData = async () => {
    try {
      const [w, wds] = await Promise.all([
        api.get<WalletData>("/api/referrals/wallet"),
        api.get<WithdrawalData[]>("/api/referrals/withdrawals"),
      ]);
      setWallet(w);
      setWithdrawals(wds);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);

    try {
      await api.post("/api/referrals/withdrawals", {
        amount: parseFloat(amount),
        bank_name: bankName,
        account_number: accountNumber,
        account_name: accountName,
      });
      setSuccess("Withdrawal request submitted successfully!");
      setAmount("");
      setBankName("");
      setAccountNumber("");
      setAccountName("");
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit request");
    } finally {
      setSubmitting(false);
    }
  };

  const fmt = (v: string) =>
    Number(v).toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const statusColor = (s: string) => {
    switch (s) {
      case "approved":
        return "bg-green-100 text-green-700";
      case "rejected":
        return "bg-red-100 text-red-700";
      default:
        return "bg-amber-100 text-amber-700";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 t-border border-t-eco" />
      </div>
    );
  }

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

      <h2 className="text-xl font-bold t-text">Withdrawals</h2>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Request Form */}
        <div className="card-elevated rounded-2xl p-6">
          <h3 className="font-semibold t-text mb-4">Request Withdrawal</h3>

          {wallet && (
            <div className="mb-4 rounded-xl bg-eco/5 border border-eco/20 px-4 py-3">
              <p className="text-xs t-text-muted">Available for withdrawal</p>
              <p className="text-lg font-bold text-eco">
                NGN {fmt(String(Number(wallet.available_balance) - Number(wallet.pending_withdrawals)))}
              </p>
            </div>
          )}

          {error && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-600">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium t-text-secondary">
                Amount (NGN)
              </label>
              <input
                type="number"
                required
                min="1"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full t-input px-4 py-3 outline-none"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium t-text-secondary">
                Bank Name
              </label>
              <input
                type="text"
                required
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder="e.g. First Bank"
                className="w-full t-input px-4 py-3 outline-none"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium t-text-secondary">
                Account Number
              </label>
              <input
                type="text"
                required
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="0123456789"
                className="w-full t-input px-4 py-3 outline-none"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium t-text-secondary">
                Account Name
              </label>
              <input
                type="text"
                required
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                placeholder="John Doe"
                className="w-full t-input px-4 py-3 outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary w-full py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Submitting..." : "Request Withdrawal"}
            </button>
          </form>
        </div>

        {/* Withdrawal History */}
        <div className="card-elevated rounded-2xl p-6">
          <h3 className="font-semibold t-text mb-4">Withdrawal History</h3>

          {withdrawals.length === 0 ? (
            <p className="text-sm t-text-muted py-8 text-center">
              No withdrawal requests yet.
            </p>
          ) : (
            <div className="space-y-3">
              {withdrawals.map((w) => (
                <div key={w.id} className="rounded-xl t-bg-secondary p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium t-text">NGN {fmt(w.amount)}</span>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${statusColor(w.status)}`}>
                      {w.status}
                    </span>
                  </div>
                  <div className="text-xs t-text-muted space-y-0.5">
                    <p>{w.bank_name} - {w.account_number}</p>
                    <p>{w.account_name}</p>
                    <p>{new Date(w.created_at).toLocaleDateString()}</p>
                    {w.admin_note && (
                      <p className="mt-1 italic">Note: {w.admin_note}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
