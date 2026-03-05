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
  secondary_color: string | null;
}

interface Photo {
  id: string;
  url: string;
}

/* ---------- Helpers ---------- */

/** Lighten/darken a hex color by a percentage (-1 to 1) */
function adjustColor(hex: string, amount: number): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.min(255, Math.max(0, ((num >> 16) & 0xff) + Math.round(255 * amount)));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0xff) + Math.round(255 * amount)));
  const b = Math.min(255, Math.max(0, (num & 0xff) + Math.round(255 * amount)));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

function hexToRgba(hex: string, alpha: number): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = (num >> 16) & 0xff;
  const g = (num >> 8) & 0xff;
  const b = num & 0xff;
  return `rgba(${r},${g},${b},${alpha})`;
}

/** Derive a warm gold accent from the primary color */
function deriveGold(hex: string): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.min(255, ((num >> 16) & 0xff) + 80);
  const g = Math.min(255, ((num >> 8) & 0xff) + 40);
  const b = Math.max(0, (num & 0xff) - 40);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
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

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 3000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  /* --- Colors --- */
  const primary = stats?.primary_color || "#22C55E";
  const secondary = stats?.secondary_color || "#1a1a2e";
  const primaryLight = hexToRgba(primary, 0.12);
  const primaryMedium = hexToRgba(primary, 0.25);
  const gold = deriveGold(primary);
  const goldLight = hexToRgba(gold, 0.15);

  /* --- Progress --- */
  const progressPercent = stats ? Math.round(stats.progress_percent) : 0;
  const remaining = stats ? Math.max(stats.total_guests - stats.served - stats.waiting, 0) : 0;

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
      <div className="flex min-h-screen items-center justify-center celebrant-bg">
        <div className="text-center animate-fade-in">
          <div
            className="mx-auto mb-4 h-14 w-14 animate-spin rounded-full border-4"
            style={{ borderColor: hexToRgba(gold, 0.15), borderTopColor: gold }}
          />
          <p className="font-elegant text-lg text-white/40 italic tracking-wide">Preparing your celebration...</p>
        </div>
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6 celebrant-bg">
        <div className="text-center animate-fade-in">
          <p className="mb-4 font-elegant text-lg text-red-300/80 italic">{error}</p>
          <button
            onClick={fetchStats}
            className="min-h-[48px] rounded-full px-8 py-3 text-lg font-semibold text-white transition-all hover:scale-[1.02]"
            style={{ backgroundColor: primary, boxShadow: `0 8px 24px ${hexToRgba(primary, 0.3)}` }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen celebrant-bg">
      {/* Hero Section */}
      {backgroundPhoto ? (
        <div className="relative h-80 w-full overflow-hidden">
          <img
            src={backgroundPhoto.url}
            alt="Event"
            className="h-full w-full object-cover"
            style={{ filter: "brightness(0.3) saturate(1.2)" }}
          />
          {/* Warm gradient overlay */}
          <div
            className="absolute inset-0"
            style={{ background: `linear-gradient(to bottom, rgba(12,10,8,0.2) 0%, rgba(12,10,8,0.6) 50%, rgba(12,10,8,0.98) 100%)` }}
          />
          {/* Subtle gold accent line at top */}
          <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: `linear-gradient(90deg, transparent, ${hexToRgba(gold, 0.4)}, transparent)` }} />
          <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
            {/* Decorative sparkles */}
            <div className="flex items-center gap-3 mb-3">
              <span className="inline-block h-1 w-1 rounded-full animate-sparkle" style={{ backgroundColor: gold, animationDelay: "0s" }} />
              <span className="inline-block h-1.5 w-1.5 rounded-full animate-sparkle" style={{ backgroundColor: gold, animationDelay: "0.5s" }} />
              <span className="inline-block h-1 w-1 rounded-full animate-sparkle" style={{ backgroundColor: gold, animationDelay: "1s" }} />
            </div>
            <h1 className="font-display text-4xl font-bold text-white drop-shadow-lg tracking-tight">
              {stats?.event_name || "Your Event"}
            </h1>
            <div
              className="mt-4 rounded-full px-5 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] backdrop-blur-md"
              style={{ backgroundColor: hexToRgba(gold, 0.15), color: hexToRgba(gold, 1), border: `1px solid ${hexToRgba(gold, 0.25)}` }}
            >
              <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full animate-pulse" style={{ backgroundColor: gold }} />
              Live
            </div>
          </div>
        </div>
      ) : (
        <div className="px-6 pt-12 pb-4 text-center">
          {/* Decorative sparkles */}
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="inline-block h-1 w-1 rounded-full animate-sparkle" style={{ backgroundColor: gold, animationDelay: "0s" }} />
            <span className="inline-block h-1.5 w-1.5 rounded-full animate-sparkle" style={{ backgroundColor: gold, animationDelay: "0.5s" }} />
            <span className="inline-block h-1 w-1 rounded-full animate-sparkle" style={{ backgroundColor: gold, animationDelay: "1s" }} />
          </div>
          <h1 className="font-display text-4xl font-bold text-white tracking-tight">
            {stats?.event_name || "Your Event"}
          </h1>
          <div
            className="mx-auto mt-3 w-fit rounded-full px-5 py-1.5 text-xs font-semibold uppercase tracking-[0.2em]"
            style={{ backgroundColor: hexToRgba(gold, 0.12), color: gold }}
          >
            Live Status
          </div>
        </div>
      )}

      <div className="px-6 py-6">
        <div className="mx-auto max-w-sm">
          {/* Celebrant Message */}
          {stats?.celebrant_message && (
            <div
              className="relative mb-6 rounded-2xl px-6 py-5 text-center flourish-corner"
              style={{ backgroundColor: hexToRgba(gold, 0.05), border: `1px solid ${hexToRgba(gold, 0.12)}` }}
            >
              <p className="font-elegant text-base italic leading-relaxed text-white/75 tracking-wide">
                &ldquo;{stats.celebrant_message}&rdquo;
              </p>
            </div>
          )}

          {/* Photo Slideshow */}
          {slideshowPhotos.length > 0 && (
            <div className="mb-6">
              <div
                className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl"
                style={{ border: `1px solid ${hexToRgba(gold, 0.2)}`, boxShadow: `0 8px 32px ${hexToRgba(gold, 0.08)}` }}
              >
                <img
                  src={slideshowPhotos[slideIndex % slideshowPhotos.length]?.url}
                  alt="Celebration photo"
                  className="h-full w-full object-cover transition-opacity duration-500"
                />
              </div>
              {slideshowPhotos.length > 1 && (
                <div className="mt-3 flex justify-center gap-2">
                  {slideshowPhotos.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setSlideIndex(i)}
                      className="h-1.5 rounded-full transition-all duration-300"
                      style={{
                        backgroundColor: i === slideIndex % slideshowPhotos.length ? gold : "rgba(255,255,255,0.15)",
                        width: i === slideIndex % slideshowPhotos.length ? "20px" : "6px",
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Elegant divider */}
          <div className="divider-elegant mb-6">
            <span className="text-xs tracking-[0.3em] uppercase font-medium" style={{ color: hexToRgba(gold, 0.5) }}>Progress</span>
          </div>

          {/* Progress Ring */}
          <div className="mb-6 flex flex-col items-center">
            <div className="relative h-48 w-48">
              <svg className="h-48 w-48 -rotate-90" viewBox="0 0 192 192">
                {/* Outer decorative ring */}
                <circle
                  cx="96" cy="96" r="90"
                  fill="none"
                  stroke={hexToRgba(gold, 0.06)}
                  strokeWidth="1"
                />
                {/* Track */}
                <circle
                  cx="96" cy="96" r="78"
                  fill="none"
                  stroke={hexToRgba(primary, 0.1)}
                  strokeWidth="12"
                />
                {/* Progress */}
                <circle
                  cx="96" cy="96" r="78"
                  fill="none"
                  stroke={primary}
                  strokeWidth="12"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 78}`}
                  strokeDashoffset={`${2 * Math.PI * 78 * (1 - progressPercent / 100)}`}
                  className="transition-all duration-700"
                  style={{ filter: `drop-shadow(0 0 8px ${hexToRgba(primary, 0.4)})` }}
                />
                {/* Inner decorative ring */}
                <circle
                  cx="96" cy="96" r="66"
                  fill="none"
                  stroke={hexToRgba(gold, 0.08)}
                  strokeWidth="1"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-display text-5xl font-bold text-white tracking-tight">
                  {progressPercent}
                  <span className="text-2xl text-white/60">%</span>
                </span>
                <span className="font-elegant text-xs italic tracking-wider text-white/40 mt-1">guests served</span>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            {/* Total Guests */}
            <div
              className="rounded-2xl px-4 py-4"
              style={{ backgroundColor: hexToRgba(primary, 0.06), border: `1px solid ${hexToRgba(primary, 0.12)}` }}
            >
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="flex h-7 w-7 items-center justify-center rounded-lg"
                  style={{ backgroundColor: primaryLight }}
                >
                  <svg className="h-4 w-4" style={{ color: primary }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <span className="text-xs font-medium text-white/40 uppercase tracking-wide">Guests</span>
              </div>
              <p className="font-display text-3xl font-bold text-white">{stats?.total_guests ?? 0}</p>
            </div>

            {/* Waiting */}
            <div
              className="rounded-2xl px-4 py-4"
              style={{ backgroundColor: hexToRgba(gold, 0.06), border: `1px solid ${hexToRgba(gold, 0.15)}` }}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ backgroundColor: goldLight }}>
                  <svg className="h-4 w-4" style={{ color: gold }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-xs font-medium text-white/40 uppercase tracking-wide">Waiting</span>
              </div>
              <p className="font-display text-3xl font-bold" style={{ color: gold }}>{stats?.waiting ?? 0}</p>
            </div>

            {/* Served */}
            <div
              className="rounded-2xl px-4 py-4"
              style={{ backgroundColor: hexToRgba(primary, 0.06), border: `1px solid ${hexToRgba(primary, 0.15)}` }}
            >
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="flex h-7 w-7 items-center justify-center rounded-lg"
                  style={{ backgroundColor: primaryLight }}
                >
                  <svg className="h-4 w-4" style={{ color: primary }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-xs font-medium text-white/40 uppercase tracking-wide">Served</span>
              </div>
              <p className="font-display text-3xl font-bold" style={{ color: primary }}>{stats?.served ?? 0}</p>
            </div>

            {/* Remaining */}
            <div
              className="rounded-2xl px-4 py-4"
              style={{ backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/5">
                  <svg className="h-4 w-4 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <span className="text-xs font-medium text-white/40 uppercase tracking-wide">Left</span>
              </div>
              <p className="font-display text-3xl font-bold text-white/70">{remaining}</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-6">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="font-elegant text-xs italic text-white/30 tracking-wide">Overall progress</span>
              <span className="font-display font-bold" style={{ color: primary }}>{progressPercent}%</span>
            </div>
            <div
              className="h-2.5 w-full overflow-hidden rounded-full"
              style={{ backgroundColor: hexToRgba(primary, 0.08) }}
            >
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${progressPercent}%`,
                  background: `linear-gradient(90deg, ${primary}, ${adjustColor(primary, 0.15)})`,
                  boxShadow: `0 0 16px ${hexToRgba(primary, 0.35)}`,
                }}
              />
            </div>
          </div>

          {/* Elegant footer */}
          <div className="mt-10 flex flex-col items-center gap-2">
            <div className="flex items-center gap-2">
              <span className="inline-block h-px w-8" style={{ background: `linear-gradient(90deg, transparent, ${hexToRgba(gold, 0.2)})` }} />
              <span className="inline-block h-1 w-1 rounded-full" style={{ backgroundColor: hexToRgba(gold, 0.3) }} />
              <span className="inline-block h-px w-8" style={{ background: `linear-gradient(90deg, ${hexToRgba(gold, 0.2)}, transparent)` }} />
            </div>
            <p className="text-center text-[11px] font-elegant italic text-white/15 tracking-wider">
              Auto-refreshing · Powered by No Ojoro
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
