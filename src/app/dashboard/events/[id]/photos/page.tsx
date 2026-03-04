"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { api, getBearerToken } from "@/lib/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface Photo {
  id: string;
  url: string;
  filename?: string;
  created_at?: string;
}

export default function CelebrantPhotosPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params.id as string;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [dragOver, setDragOver] = useState(false);

  // Celebrant password
  const [password, setPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [passwordView, setPasswordView] = useState<"set" | "reset">("set");

  const [partyId, setPartyId] = useState("");

  const fetchPhotos = useCallback(async () => {
    try {
      const event = await api.get<{
        celebrant_photos: Record<string, string> | null;
        party_id: string | null;
        celebrant_password_set: boolean;
      }>(`/api/events/${eventId}`);
      const photosMap = event.celebrant_photos || {};
      const photoList: Photo[] = Object.entries(photosMap).map(([id, url]) => ({
        id,
        url: url as string,
        filename: id,
      }));
      setPhotos(photoList);
      setPartyId(event.party_id || "");
      // Show reset tab if password is already set
      if (event.celebrant_password_set) {
        setPasswordView("reset");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load photos");
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    fetchPhotos();
  }, [fetchPhotos]);

  const compressImage = (file: File, maxSizeMB = 4, maxDim = 2048): Promise<File> => {
    return new Promise((resolve, reject) => {
      if (file.size <= maxSizeMB * 1024 * 1024) {
        resolve(file);
        return;
      }

      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(url);
        let { width, height } = img;

        // Scale down if larger than maxDim
        if (width > maxDim || height > maxDim) {
          const ratio = Math.min(maxDim / width, maxDim / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) { reject(new Error("Canvas not supported")); return; }
        ctx.drawImage(img, 0, 0, width, height);

        // Try decreasing quality until under limit
        let quality = 0.8;
        const tryCompress = () => {
          canvas.toBlob(
            (blob) => {
              if (!blob) { reject(new Error("Compression failed")); return; }
              if (blob.size <= maxSizeMB * 1024 * 1024 || quality <= 0.3) {
                resolve(new File([blob], file.name, { type: "image/jpeg" }));
              } else {
                quality -= 0.1;
                tryCompress();
              }
            },
            "image/jpeg",
            quality,
          );
        };
        tryCompress();
      };
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Failed to load image")); };
      img.src = url;
    });
  };

  const uploadFiles = async (files: FileList | File[]) => {
    setUploading(true);
    setError("");
    setSuccess("");

    try {
      for (const file of Array.from(files)) {
        const compressed = await compressImage(file);
        const formData = new FormData();
        formData.append("file", compressed);

        const uploadHeaders: Record<string, string> = {};
        const token = getBearerToken();
        if (token) uploadHeaders["Authorization"] = `Bearer ${token}`;
        const response = await fetch(`${API_URL}/api/events/${eventId}/photos`, {
          method: "POST",
          body: formData,
          credentials: "include",
          headers: uploadHeaders,
        });

        if (!response.ok) {
          const err = await response.json().catch(() => ({ detail: "Upload failed" }));
          throw new Error(err.detail || `Upload failed for ${file.name}`);
        }
      }
      setSuccess("Photos uploaded successfully!");
      await fetchPhotos();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload photos");
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      uploadFiles(e.target.files);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      uploadFiles(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const validatePasswordFormat = (pwd: string): boolean => {
    // Format: 1 letter + 6 numbers (e.g., A123456)
    const regex = /^[A-Za-z]\d{6}$/;
    return regex.test(pwd);
  };

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingPassword(true);
    setError("");

    if (!validatePasswordFormat(password)) {
      setError("Password must be 1 letter followed by 6 numbers (e.g., A123456)");
      setSavingPassword(false);
      return;
    }

    try {
      await api.put(`/api/events/${eventId}/celebrant-password`, {
        password,
      });
      // Store the password to display it (plaintext, as required)
      setCurrentPassword(password);
      setPasswordView("reset");
      // Don't clear password or show success notification
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to set password");
    } finally {
      setSavingPassword(false);
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
    <div className="mx-auto max-w-4xl">
      <div className="mb-6">
        <button
          onClick={() => router.push(`/dashboard/events/${eventId}`)}
          className="text-sm t-text-muted hover:t-text-secondary transition-colors"
        >
          &larr; Back to Event
        </button>
      </div>

      <h1 className="text-2xl font-bold t-text">Celebrant Photos</h1>
      <p className="mt-1 text-sm t-text-muted">
        Upload photos for the celebrant gallery (max 6). Guests will see these during the event.
      </p>

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

      {/* Upload Area */}
      <div className="mt-6 rounded-xl border t-border t-bg-card p-6 shadow-sm">
        <h2 className="text-lg font-semibold t-text">Upload Photos</h2>
        {photos.length >= 6 ? (
          <div className="mt-4 rounded-xl border-2 border-dashed t-border p-10 text-center">
            <p className="text-sm font-medium t-text-muted">
              Maximum of 6 photos reached
            </p>
          </div>
        ) : (
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            className={`mt-4 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-10 transition-colors ${
              dragOver
                ? "border-eco/30 t-bg-secondary"
                : "t-border hover:border-gray-400"
            }`}
          >
            <svg
              className="h-10 w-10 t-text-faint"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a2.25 2.25 0 002.25-2.25V6.75a2.25 2.25 0 00-2.25-2.25H3.75A2.25 2.25 0 001.5 6.75v12a2.25 2.25 0 002.25 2.25z"
              />
            </svg>
            {uploading ? (
              <p className="mt-3 text-sm t-text-muted">Uploading...</p>
            ) : (
              <>
                <p className="mt-3 text-sm font-medium t-text-secondary">
                  Drag & drop photos here, or click to browse
                </p>
                <p className="mt-1 text-xs t-text-faint">PNG, JPG, WEBP up to 10MB each</p>
              </>
            )}
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* Photo Grid */}
      {photos.length > 0 && (
        <div className="mt-6 rounded-xl border t-border t-bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold t-text">
            Uploaded Photos ({photos.length}/6)
          </h2>
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {photos.map((photo) => (
              <div
                key={photo.id}
                className="group relative aspect-square overflow-hidden rounded-lg border t-border t-bg"
              >
                <img
                  src={photo.url.startsWith("http") ? photo.url : `${API_URL}${photo.url}`}
                  alt={photo.filename || "Photo"}
                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Celebrant Access */}
      <div className="mt-6 rounded-xl border t-border t-bg-card p-6 shadow-sm">
        <h2 className="text-lg font-semibold t-text">Celebrant Access</h2>
        <p className="mt-1 text-sm t-text-muted">
          Give your celebrant real-time access to monitor serving progress on their phone.
        </p>

        {/* Party ID Display */}
        <div className="mt-4 rounded-lg bg-gray-50 p-4 border t-border">
          <label className="block text-sm font-medium t-text-secondary mb-2">
            Party ID
          </label>
          <div className="flex items-center gap-3">
            <code className="flex-1 rounded-md bg-white border t-border px-4 py-3 text-lg font-mono font-bold t-text">
              {partyId || "Loading..."}
            </code>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(partyId);
                setLinkCopied(true);
                setTimeout(() => setLinkCopied(false), 2000);
              }}
              className="rounded-lg border t-border px-4 py-3 text-sm font-semibold t-text-secondary hover:t-bg transition-colors"
            >
              {linkCopied ? "Copied!" : "Copy"}
            </button>
          </div>
          <p className="mt-2 text-xs t-text-faint">
            Share this Party ID with your celebrant
          </p>
        </div>

        <ol className="mt-4 list-decimal list-inside space-y-1.5 text-sm t-text-muted">
          <li>Copy the Party ID above</li>
          <li>Set a password below for the celebrant</li>
          <li>Copy the celebrant link using the button</li>
          <li>Share the Party ID, link, and password with your event host/celebrant</li>
          <li>They&apos;ll use them to monitor serving progress live on their phone</li>
        </ol>

        {/* Password Tabs */}
        <div className="mt-5 border-b t-border flex gap-4">
          <button
            type="button"
            onClick={() => setPasswordView("set")}
            className={`pb-2 px-1 text-sm font-semibold transition-colors border-b-2 ${
              passwordView === "set"
                ? "border-eco text-eco"
                : "border-transparent t-text-muted hover:t-text-secondary"
            }`}
          >
            Set Password
          </button>
          <button
            type="button"
            onClick={() => setPasswordView("reset")}
            className={`pb-2 px-1 text-sm font-semibold transition-colors border-b-2 ${
              passwordView === "reset"
                ? "border-eco text-eco"
                : "border-transparent t-text-muted hover:t-text-secondary"
            }`}
          >
            Reset Password
          </button>
        </div>

        {passwordView === "set" ? (
          <form onSubmit={handleSetPassword} className="mt-5 space-y-4">
            <div>
              <label className="block text-sm font-medium t-text-secondary mb-2">
                Password (1 letter + 6 numbers, e.g. A123456)
              </label>
              <input
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value.toUpperCase())}
                placeholder="e.g., A123456"
                required
                maxLength={7}
                pattern="[A-Za-z]\d{6}"
                className="block w-full rounded-lg border t-border px-4 py-3 text-lg font-mono font-bold t-text placeholder-[#9C9C9C] focus:border-eco focus:outline-none focus:ring-2 focus:ring-eco"
              />
              <p className="mt-1 text-xs t-text-faint">
                Password will remain visible - save it securely
              </p>
            </div>
            <button
              type="submit"
              disabled={savingPassword}
              className="w-full rounded-lg bg-eco px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-eco-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {savingPassword ? "Saving..." : "Set Password"}
            </button>
          </form>
        ) : (
          <div className="mt-5 space-y-4">
            {currentPassword ? (
              <>
                <div className="rounded-lg bg-gray-50 border t-border p-4">
                  <label className="block text-sm font-medium t-text-secondary mb-2">
                    Current Password
                  </label>
                  <code className="block rounded-md bg-white border t-border px-4 py-3 text-lg font-mono font-bold t-text">
                    {currentPassword}
                  </code>
                  <p className="mt-2 text-xs t-text-faint">
                    Share this password with your celebrant
                  </p>
                </div>
                <form onSubmit={handleSetPassword}>
                  <label className="block text-sm font-medium t-text-secondary mb-2">
                    New Password (1 letter + 6 numbers)
                  </label>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={password}
                      onChange={(e) => setPassword(e.target.value.toUpperCase())}
                      placeholder="e.g., B654321"
                      required
                      maxLength={7}
                      pattern="[A-Za-z]\d{6}"
                      className="flex-1 rounded-lg border t-border px-4 py-3 text-lg font-mono font-bold t-text placeholder-[#9C9C9C] focus:border-eco focus:outline-none focus:ring-2 focus:ring-eco"
                    />
                    <button
                      type="submit"
                      disabled={savingPassword}
                      className="rounded-lg bg-eco px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-eco-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {savingPassword ? "Updating..." : "Reset"}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="rounded-lg border border-dashed t-border p-6 text-center">
                <p className="text-sm t-text-muted">
                  No password set yet. Go to "Set Password" tab to create one.
                </p>
              </div>
            )}
          </div>
        )}

        <div className="mt-4">
          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(`https://noojoro.vercel.app/celebrant?event=${eventId}`);
              setLinkCopied(true);
              setTimeout(() => setLinkCopied(false), 2000);
            }}
            className="rounded-lg border t-border px-4 py-2.5 text-sm font-semibold t-text-secondary hover:t-bg transition-colors"
          >
            {linkCopied ? "Copied!" : "Copy Celebrant Link"}
          </button>
          <p className="mt-2 text-xs t-text-faint">
            Share this link along with the password you set
          </p>
        </div>
      </div>

      {/* Continue to Menu Button */}
      <div className="mt-8 flex justify-end">
        <button
          onClick={() => router.push(`/dashboard/events/${eventId}/menu`)}
          className="inline-flex items-center gap-2 rounded-lg bg-eco px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-eco-dark"
        >
          Continue to Menu Setup
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </button>
      </div>
    </div>
  );
}
