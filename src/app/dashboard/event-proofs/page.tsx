"use client";

import { useEffect, useState, useRef } from "react";
import { api, getBearerToken } from "@/lib/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface EventProof {
  id: string;
  user_id: string;
  event_code: string;
  location: string;
  photos: Record<string, string>;
  status: string;
  admin_note: string | null;
  event_id: string | null;
  created_at: string;
}

export default function EventProofsPage() {
  const [proofs, setProofs] = useState<EventProof[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [eventCode, setEventCode] = useState("");
  const [location, setLocation] = useState("");
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState("");

  // Photo upload state
  const [activeProofId, setActiveProofId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchProofs = async () => {
    try {
      const data = await api.get<EventProof[]>("/api/event-proofs");
      setProofs(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProofs();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (!eventCode.trim() || !location.trim()) {
      setFormError("Event code and location are required.");
      return;
    }
    setCreating(true);
    try {
      const proof = await api.post<EventProof>("/api/event-proofs", {
        event_code: eventCode.trim(),
        location: location.trim(),
      });
      setActiveProofId(proof.id);
      setEventCode("");
      setLocation("");
      await fetchProofs();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : "Failed to create proof");
    } finally {
      setCreating(false);
    }
  };

  const handlePhotoUpload = async (files: FileList | null) => {
    if (!files || !activeProofId) return;
    setUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const formData = new FormData();
        formData.append("file", files[i]);

        const token = getBearerToken();
        const resp = await fetch(
          `${API_URL}/api/event-proofs/${activeProofId}/photos`,
          {
            method: "POST",
            headers: token ? { Authorization: `Bearer ${token}` } : {},
            credentials: "include",
            body: formData,
          }
        );
        if (!resp.ok) {
          const err = await resp.json().catch(() => ({ detail: "Upload failed" }));
          throw new Error(typeof err.detail === "string" ? err.detail : "Upload failed");
        }
      }
      await fetchProofs();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const statusBadge = (s: string) => {
    const cls =
      s === "approved"
        ? "bg-green-100 text-green-700"
        : s === "rejected"
        ? "bg-red-100 text-red-700"
        : "bg-amber-100 text-amber-700";
    return (
      <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${cls}`}>
        {s}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 t-border border-t-eco" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Info Banner */}
      <div className="card-elevated rounded-2xl p-5 border-l-4 border-eco">
        <h3 className="text-sm font-semibold t-text mb-1">Earn Extra Commission</h3>
        <p className="text-sm t-text-muted">
          Upload photos proving No Ojoro usage at your events (tokens on table, branding, etc.)
          to earn an additional <span className="font-semibold text-eco">3% bonus</span> on Level 2
          commissions (3% &rarr; 6%) for payments tied to that event.
        </p>
      </div>

      {/* Create Proof Form */}
      <div className="card-elevated rounded-2xl p-6">
        <h2 className="text-lg font-semibold t-text mb-4">Submit Event Proof</h2>
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium t-text mb-1">Event Code</label>
              <input
                type="text"
                value={eventCode}
                onChange={(e) => setEventCode(e.target.value)}
                placeholder="e.g. EVT-ABC123"
                className="w-full rounded-xl border t-border px-4 py-2.5 text-sm t-bg t-text focus:outline-none focus:ring-2 focus:ring-eco/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium t-text mb-1">Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Eko Hotel, Victoria Island"
                className="w-full rounded-xl border t-border px-4 py-2.5 text-sm t-bg t-text focus:outline-none focus:ring-2 focus:ring-eco/50"
              />
            </div>
          </div>
          {formError && <p className="text-sm text-red-500">{formError}</p>}
          <button
            type="submit"
            disabled={creating}
            className="btn-primary px-6 py-2.5 text-sm disabled:opacity-50"
          >
            {creating ? "Creating..." : "Create Proof"}
          </button>
        </form>
      </div>

      {/* Photo Upload Area (shown after creating a proof) */}
      {activeProofId && (
        <div className="card-elevated rounded-2xl p-6">
          <h2 className="text-lg font-semibold t-text mb-2">Upload Photos</h2>
          <p className="text-sm t-text-muted mb-4">
            Add photos to your proof submission. JPEG, PNG, or WebP, max 5 MB each.
          </p>
          <div
            className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed t-border p-8 cursor-pointer hover:border-eco/50 transition-colors"
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              handlePhotoUpload(e.dataTransfer.files);
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 t-text-faint mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
            </svg>
            <p className="text-sm font-medium t-text">
              {uploading ? "Uploading..." : "Click or drag photos here"}
            </p>
            <p className="text-xs t-text-faint mt-1">Supports multiple files</p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="hidden"
            onChange={(e) => handlePhotoUpload(e.target.files)}
          />
          <div className="flex justify-end mt-4">
            <button
              onClick={() => setActiveProofId(null)}
              className="text-sm font-medium text-eco hover:underline"
            >
              Done uploading
            </button>
          </div>
        </div>
      )}

      {/* Proofs List */}
      <div>
        <h2 className="text-lg font-semibold t-text mb-4">Your Proofs</h2>
        {proofs.length === 0 ? (
          <div className="card-elevated rounded-2xl p-8 text-center">
            <p className="t-text-muted text-sm">No event proofs yet. Submit one above to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {proofs.map((proof) => (
              <div key={proof.id} className="card-elevated rounded-2xl p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-sm font-semibold t-text">{proof.event_code}</p>
                    <p className="text-xs t-text-muted">{proof.location}</p>
                  </div>
                  {statusBadge(proof.status)}
                </div>

                {/* Photo thumbnails */}
                {Object.keys(proof.photos).length > 0 && (
                  <div className="flex gap-2 flex-wrap mb-3">
                    {Object.entries(proof.photos).map(([photoId, path]) => (
                      <img
                        key={photoId}
                        src={path.startsWith("http") ? path : `${API_URL}${path}`}
                        alt="Proof photo"
                        className="h-16 w-16 rounded-lg object-cover border t-border"
                      />
                    ))}
                  </div>
                )}

                {proof.admin_note && (
                  <p className="text-xs t-text-muted italic">Note: {proof.admin_note}</p>
                )}

                <div className="flex items-center justify-between mt-3">
                  <p className="text-xs t-text-faint">
                    {new Date(proof.created_at).toLocaleDateString()}
                  </p>
                  {proof.status === "pending" && (
                    <button
                      onClick={() => setActiveProofId(proof.id)}
                      className="text-xs font-medium text-eco hover:underline"
                    >
                      Add Photos
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
