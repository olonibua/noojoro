"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { api } from "@/lib/api";
import WizardSteps from "@/components/wizard/WizardSteps";

interface Staff {
  id: string;
  name: string;
  pin?: string;
  table_range_start?: number;
  table_range_end?: number;
  role?: string;
}

interface EventInfo {
  event_code: string;
  name: string;
  party_id: string | null;
}

export default function StaffManagementPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params.id as string;

  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [eventInfo, setEventInfo] = useState<EventInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Add staff form
  const [adding, setAdding] = useState(false);
  const [addForm, setAddForm] = useState({
    name: "",
    pin: "",
    table_range_start: "",
    table_range_end: "",
  });

  // Edit staff
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    pin: "",
    table_range_start: "",
    table_range_end: "",
  });

  const fetchStaff = useCallback(async () => {
    try {
      const [staff, event] = await Promise.all([
        api.get<Staff[]>(`/api/events/${eventId}/staff`),
        api.get<EventInfo>(`/api/events/${eventId}`),
      ]);
      setStaffList(Array.isArray(staff) ? staff : []);
      setEventInfo(event);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load staff");
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setAdding(true);

    try {
      await api.post(`/api/events/${eventId}/staff`, {
        name: addForm.name,
        pin: addForm.pin || undefined,
        table_range_start: addForm.table_range_start ? parseInt(addForm.table_range_start) : undefined,
        table_range_end: addForm.table_range_end ? parseInt(addForm.table_range_end) : undefined,
      });
      setAddForm({ name: "", pin: "", table_range_start: "", table_range_end: "" });
      setSuccess("Staff member added!");
      await fetchStaff();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add staff");
    } finally {
      setAdding(false);
    }
  };

  const handleEdit = async (id: string) => {
    setError("");
    setSuccess("");
    try {
      await api.put(`/api/events/${eventId}/staff/${id}`, {
        name: editForm.name,
        pin: editForm.pin || undefined,
        table_range_start: editForm.table_range_start ? parseInt(editForm.table_range_start) : undefined,
        table_range_end: editForm.table_range_end ? parseInt(editForm.table_range_end) : undefined,
      });
      setEditingId(null);
      setSuccess("Staff member updated!");
      await fetchStaff();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update staff");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this staff member?")) return;
    setError("");
    try {
      await api.delete(`/api/events/${eventId}/staff/${id}`);
      setSuccess("Staff member removed.");
      await fetchStaff();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete staff");
    }
  };

  const startEdit = (s: Staff) => {
    setEditingId(s.id);
    setEditForm({
      name: s.name,
      pin: s.pin || "",
      table_range_start: s.table_range_start?.toString() || "",
      table_range_end: s.table_range_end?.toString() || "",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 t-border border-t-eco" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <WizardSteps currentStep={3} />

      <div className="mb-6">
        <button
          onClick={() => router.push(`/dashboard/events/${eventId}/menu`)}
          className="text-sm t-text-muted hover:t-text-secondary transition-colors"
        >
          &larr; Back to Menu
        </button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold t-text">Staff Management</h1>
          <p className="mt-1 text-sm t-text-muted">
            Add and manage staff members for this event.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          {eventInfo?.party_id && (
            <div className="rounded-lg border t-border t-bg px-4 py-2">
              <p className="text-xs t-text-muted">Party ID</p>
              <p className="font-mono text-lg font-bold t-text">{eventInfo.party_id}</p>
            </div>
          )}
          {eventInfo?.event_code && (
            <div className="rounded-lg border t-border t-bg px-4 py-2">
              <p className="text-xs t-text-muted">Event Code (share with staff)</p>
              <p className="font-mono text-lg font-bold t-text">{eventInfo.event_code}</p>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div className="mt-4 rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm t-text">
          {success}
        </div>
      )}

      {/* Add Staff Form */}
      <div className="mt-6 rounded-xl border t-border t-bg-card p-6 shadow-sm">
        <h2 className="text-lg font-semibold t-text">Add Staff Member</h2>
        <form onSubmit={handleAdd} className="mt-4 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium t-text-secondary">Name</label>
              <input
                required
                value={addForm.name}
                onChange={(e) => setAddForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="Staff name"
                className="mt-1 block w-full rounded-lg border t-border px-3 py-2.5 text-sm t-text placeholder-[#9C9C9C] focus:border-eco focus:outline-none focus:ring-1 focus:ring-eco"
              />
            </div>
            <div>
              <label className="block text-sm font-medium t-text-secondary">
                PIN <span className="t-text-faint">(optional)</span>
              </label>
              <input
                value={addForm.pin}
                onChange={(e) => setAddForm((p) => ({ ...p, pin: e.target.value }))}
                placeholder="4-digit PIN"
                maxLength={4}
                className="mt-1 block w-full rounded-lg border t-border px-3 py-2.5 text-sm t-text placeholder-[#9C9C9C] focus:border-eco focus:outline-none focus:ring-1 focus:ring-eco"
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium t-text-secondary">
                Table Range Start <span className="t-text-faint">(optional)</span>
              </label>
              <input
                type="number"
                min={1}
                value={addForm.table_range_start}
                onChange={(e) => setAddForm((p) => ({ ...p, table_range_start: e.target.value }))}
                placeholder="1"
                className="mt-1 block w-full rounded-lg border t-border px-3 py-2.5 text-sm t-text placeholder-[#9C9C9C] focus:border-eco focus:outline-none focus:ring-1 focus:ring-eco"
              />
            </div>
            <div>
              <label className="block text-sm font-medium t-text-secondary">
                Table Range End <span className="t-text-faint">(optional)</span>
              </label>
              <input
                type="number"
                min={1}
                value={addForm.table_range_end}
                onChange={(e) => setAddForm((p) => ({ ...p, table_range_end: e.target.value }))}
                placeholder="10"
                className="mt-1 block w-full rounded-lg border t-border px-3 py-2.5 text-sm t-text placeholder-[#9C9C9C] focus:border-eco focus:outline-none focus:ring-1 focus:ring-eco"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={adding}
            className="rounded-lg bg-eco px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-eco-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {adding ? "Adding..." : "Add Staff"}
          </button>
        </form>
      </div>

      {/* Staff List */}
      <div className="mt-6 rounded-xl border t-border t-bg-card shadow-sm">
        <div className="border-b t-border px-6 py-4">
          <h2 className="text-lg font-semibold t-text">
            Current Staff ({staffList.length})
          </h2>
        </div>

        {staffList.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm t-text-muted">
            No staff members added yet. Use the form above to add staff.
          </div>
        ) : (
          <div className="divide-y t-divide">
            {staffList.map((s) => (
              <div key={s.id} className="px-6 py-4">
                {editingId === s.id ? (
                  <div className="space-y-3">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <input
                        value={editForm.name}
                        onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))}
                        placeholder="Name"
                        className="block w-full rounded-lg border t-border px-3 py-2 text-sm focus:border-eco focus:outline-none focus:ring-1 focus:ring-eco"
                      />
                      <input
                        value={editForm.pin}
                        onChange={(e) => setEditForm((p) => ({ ...p, pin: e.target.value }))}
                        placeholder="PIN (optional)"
                        className="block w-full rounded-lg border t-border px-3 py-2 text-sm focus:border-eco focus:outline-none focus:ring-1 focus:ring-eco"
                      />
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <input
                        type="number"
                        value={editForm.table_range_start}
                        onChange={(e) => setEditForm((p) => ({ ...p, table_range_start: e.target.value }))}
                        placeholder="Table start"
                        className="block w-full rounded-lg border t-border px-3 py-2 text-sm focus:border-eco focus:outline-none focus:ring-1 focus:ring-eco"
                      />
                      <input
                        type="number"
                        value={editForm.table_range_end}
                        onChange={(e) => setEditForm((p) => ({ ...p, table_range_end: e.target.value }))}
                        placeholder="Table end"
                        className="block w-full rounded-lg border t-border px-3 py-2 text-sm focus:border-eco focus:outline-none focus:ring-1 focus:ring-eco"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(s.id)}
                        className="rounded-lg bg-eco px-3 py-1.5 text-sm font-medium text-white hover:bg-eco-dark"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="rounded-lg border t-border px-3 py-1.5 text-sm font-medium t-text-secondary hover:t-bg"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium t-text">{s.name}</p>
                      <div className="mt-1 flex flex-wrap gap-3 text-xs t-text-muted">
                        {s.pin && <span>PIN: {s.pin}</span>}
                        {s.table_range_start != null && s.table_range_end != null && (
                          <span>
                            Tables {s.table_range_start}-{s.table_range_end}
                          </span>
                        )}
                        {s.role && <span className="capitalize">{s.role}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => startEdit(s)}
                        className="rounded px-2 py-1 text-xs font-medium t-text-muted hover:t-bg-secondary transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(s.id)}
                        className="rounded px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="mt-8 flex items-center justify-between">
        <button
          onClick={() => router.push(`/dashboard/events/${eventId}/menu`)}
          className="rounded-lg border t-border px-5 py-2.5 text-sm font-semibold t-text-secondary hover:t-bg transition-colors"
        >
          Back
        </button>
        <button
          onClick={() => router.push(`/dashboard/events/${eventId}/photos`)}
          className="rounded-lg bg-eco px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-eco-dark transition-colors"
        >
          Proceed to Celebrant Setup
        </button>
      </div>
    </div>
  );
}
