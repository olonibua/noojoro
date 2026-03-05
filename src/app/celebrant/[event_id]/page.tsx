"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/* ---------- Types ---------- */

interface CelebrantStats {
  event_name: string;
  total_guests: number;
  waiting: number;
  served: number;
  progress_percent: number;
  celebrant_photos: Record<string, string> | null;
  celebrant_message: string | null;
  background_photo_id: string | null;
  primary_color: string | null;
}

interface Photo {
  id: string;
  url: string;
}

/* ========== Component ========== */

export default function CelebrantLiveViewPage() {
  const params = useParams<{ event_id: string }>();
  const router = useRouter();
  const eventId = params.event_id;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState<CelebrantStats | null>(null);
  const [slideIndex, setSlideIndex] = useState(0);
  const slideTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchStats = useCallback(async () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("celebrant_token") : null;
    if (!token) {
      router.push("/celebrant");
      return;
    }

    try {
      const data = await api.get<CelebrantStats>(
        `/api/events/${eventId}/celebrant/stats`
      );
      setStats(data);
      setError("");
    } catch (err) {
      if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
        localStorage.removeItem("celebrant_token");
        router.push("/celebrant");
        return;
      }
      setError(err instanceof Error ? err.message : "Failed to load stats");
    } finally {
      setLoading(false);
    }
  }, [eventId, router]);

  /* --- Polling every 3s --- */
  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 3000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  /* --- Progress percentage --- */
  const progressPercent = stats ? Math.round(stats.progress_percent) : 0;
  const themeColor = stats?.primary_color || "#22C55E";

  /* --- Photos --- */
  const photos: Photo[] = (() => {
    if (!stats?.celebrant_photos) return [];
    return Object.entries(stats.celebrant_photos).map(([id, url]) => ({
      id,
      url: (url as string).startsWith("http") ? (url as string) : `${API_URL}${url}`,
    }));
  })();

  const backgroundPhoto = (() => {
    if (stats?.background_photo_id && photos.length > 0) {
      const found = photos.find((p) => p.id === stats.background_photo_id);
      if (found) return found;
    }
    return photos.length > 0 ? photos[0] : null;
  })();

  const slideshowPhotos = photos.filter((p) => p.id !== backgroundPhoto?.id);

  /* --- Slideshow auto-advance --- */
  useEffect(() => {
    if (slideshowPhotos.length <= 1) return;
    slideTimer.current = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % slideshowPhotos.length);
    }, 4000);
    return () => {
      if (slideTimer.current) clearInterval(slideTimer.current);
    };
  }, [slideshowPhotos.length]);

  /* ========== Render ========== */

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-emerald-500" />
          <p className="text-lg font-medium text-gray-700">Loading your event...</p>
        </div>
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white px-6">
        <div className="text-center">
          <p className="mb-4 text-lg text-red-600">{error}</p>
          <button
            onClick={fetchStats}
            className="min-h-[48px] rounded-xl bg-emerald-500 px-8 py-3 text-lg font-semibold text-white"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section with Background Photo */}
      {backgroundPhoto && (
        <div className="relative h-56 w-full overflow-hidden">
          <img
            src={backgroundPhoto.url}
            alt="Event"
            className="h-full w-full object-cover"
            style={{ filter: "brightness(0.5)" }}
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
            <h1 className="text-3xl font-bold text-white">
              {stats?.event_name || "Your Event"}
            </h1>
            <p className="mt-1 text-sm text-white/70">Live status</p>
          </div>
        </div>
      )}

      <div className="px-6 py-8">
        <div className="mx-auto max-w-sm">
          {/* Event Name (shown only when no background photo) */}
          {!backgroundPhoto && (
            <div className="mb-8 text-center">
              <h1 className="text-2xl font-bold text-gray-900">
                {stats?.event_name || "Your Event"}
              </h1>
              <p className="mt-1 text-sm text-gray-500">Live status</p>
            </div>
          )}

          {/* Celebrant Message */}
          {stats?.celebrant_message && (
            <div className="mb-6 rounded-xl border border-gray-200 bg-gray-50 px-5 py-4 text-center">
              <p className="text-sm italic text-gray-600 leading-relaxed">
                &ldquo;{stats.celebrant_message}&rdquo;
              </p>
            </div>
          )}

          {/* Photo Slideshow */}
          {slideshowPhotos.length > 0 && (
            <div className="mb-6">
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl">
                <img
                  src={slideshowPhotos[slideIndex % slideshowPhotos.length]?.url}
                  alt="Celebration photo"
                  className="h-full w-full object-cover transition-opacity duration-500"
                />
              </div>
              {/* Dots */}
              {slideshowPhotos.length > 1 && (
                <div className="mt-3 flex justify-center gap-1.5">
                  {slideshowPhotos.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setSlideIndex(i)}
                      className="h-2 w-2 rounded-full transition-colors"
                      style={{
                        backgroundColor: i === slideIndex % slideshowPhotos.length ? themeColor : "#D1D5DB",
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Progress Ring Section */}
          <div className="mb-8 flex flex-col items-center">
            <div className="relative mb-4 h-40 w-40">
              <svg className="h-40 w-40 -rotate-90" viewBox="0 0 160 160">
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  fill="none"
                  stroke="#E5E7EB"
                  strokeWidth="12"
                />
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  fill="none"
                  stroke={themeColor}
                  strokeWidth="12"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 70}`}
                  strokeDashoffset={`${2 * Math.PI * 70 * (1 - progressPercent / 100)}`}
                  className="transition-all duration-700"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold text-gray-900">
                  {progressPercent}%
                </span>
                <span className="text-sm text-gray-500">served</span>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-xl border-2 border-gray-200 px-5 py-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Guests</p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats?.total_guests ?? 0}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                <svg className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-xl border-2 border-amber-200 bg-amber-50 px-5 py-4">
              <div>
                <p className="text-sm font-medium text-amber-700">Waiting</p>
                <p className="text-3xl font-bold text-amber-700">
                  {stats?.waiting ?? 0}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-200">
                <svg className="h-6 w-6 text-amber-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-xl border-2 border-emerald-200 bg-emerald-50 px-5 py-4">
              <div>
                <p className="text-sm font-medium text-emerald-700">Served</p>
                <p className="text-3xl font-bold text-emerald-700">
                  {stats?.served ?? 0}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-200">
                <svg className="h-6 w-6 text-emerald-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-xl border-2 border-gray-200 px-5 py-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Remaining</p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats ? Math.max(stats.total_guests - stats.served - stats.waiting, 0) : 0}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                <svg className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
            </div>
          </div>

          {/* Green progress bar */}
          <div className="mt-8">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-gray-500">Progress</span>
              <span className="font-semibold" style={{ color: themeColor }}>{progressPercent}%</span>
            </div>
            <div className="h-4 w-full overflow-hidden rounded-full bg-gray-200">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${progressPercent}%`, backgroundColor: themeColor }}
              />
            </div>
          </div>

          <p className="mt-8 text-center text-xs text-gray-400">
            Auto-refreshing every 3 seconds
          </p>
          <p className="mt-2 text-center text-xs text-gray-400">Powered by No Ojoro</p>
        </div>
      </div>
    </div>
  );
}
