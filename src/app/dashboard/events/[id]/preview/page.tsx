"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { api } from "@/lib/api";
import WizardSteps from "@/components/wizard/WizardSteps";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface MenuItem {
  id: string;
  name: string;
  total_quantity: number;
  display_order: number;
  category_id: string;
}

interface MenuCategory {
  id: string;
  name: string;
  description: string | null;
  display_order: number;
  items: MenuItem[];
}

interface EventData {
  id: string;
  name: string;
  primary_color: string | null;
  secondary_color: string | null;
  font_family: string | null;
  font_size: string | null;
  font_weight: string | null;
  font_style: string | null;
  letter_spacing: string | null;
  text_align: string | null;
  celebrant_message: string | null;
  celebrant_photos: Record<string, string> | null;
  background_photo_id: string | null;
}

const FONT_OPTIONS = [
  "Plus Jakarta Sans",
  "Inter",
  "Playfair Display",
  "Lora",
  "Montserrat",
];

const FONT_SIZE_MAP: Record<string, string> = {
  small: "0.875rem",
  normal: "1rem",
  large: "1.125rem",
};

const LETTER_SPACING_MAP: Record<string, string> = {
  tight: "-0.025em",
  normal: "0em",
  wide: "0.05em",
};

function getGoogleFontsUrl(family: string): string {
  const formatted = family.replace(/\s+/g, "+");
  return `https://fonts.googleapis.com/css2?family=${formatted}:ital,wght@0,400;0,700;1,400;1,700&display=swap`;
}

export default function EventPreviewPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params.id as string;

  const [event, setEvent] = useState<EventData | null>(null);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Style state
  const [primaryColor, setPrimaryColor] = useState("#22c55e");
  const [secondaryColor, setSecondaryColor] = useState("#1a1a2e");
  const [fontFamily, setFontFamily] = useState("Plus Jakarta Sans");
  const [fontSize, setFontSize] = useState("normal");
  const [fontWeight, setFontWeight] = useState("normal");
  const [fontStyle, setFontStyle] = useState("normal");
  const [letterSpacing, setLetterSpacing] = useState("normal");
  const [textAlign, setTextAlign] = useState("center");

  // Simulated selected items for preview
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  const fetchData = useCallback(async () => {
    try {
      const [eventRes, menuRes] = await Promise.all([
        api.get<EventData>(`/api/events/${eventId}`),
        api.get<{ categories: MenuCategory[] }>(`/api/events/${eventId}/menu/manage`),
      ]);

      setEvent(eventRes);
      setCategories(Array.isArray(menuRes.categories) ? menuRes.categories : []);

      // Populate style state from event data
      if (eventRes.primary_color) setPrimaryColor(eventRes.primary_color);
      if (eventRes.secondary_color) setSecondaryColor(eventRes.secondary_color);
      if (eventRes.font_family) setFontFamily(eventRes.font_family);
      if (eventRes.font_size) setFontSize(eventRes.font_size);
      if (eventRes.font_weight) setFontWeight(eventRes.font_weight);
      if (eventRes.font_style) setFontStyle(eventRes.font_style);
      if (eventRes.letter_spacing) setLetterSpacing(eventRes.letter_spacing);
      if (eventRes.text_align) setTextAlign(eventRes.text_align);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load event data");
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Dynamically inject Google Fonts link when fontFamily changes
  useEffect(() => {
    const linkId = "preview-google-font";
    let link = document.getElementById(linkId) as HTMLLinkElement | null;

    if (!link) {
      link = document.createElement("link");
      link.id = linkId;
      link.rel = "stylesheet";
      document.head.appendChild(link);
    }

    link.href = getGoogleFontsUrl(fontFamily);

    return () => {
      // Cleanup on unmount
      const existing = document.getElementById(linkId);
      if (existing) existing.remove();
    };
  }, [fontFamily]);

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      await api.put(`/api/events/${eventId}`, {
        primary_color: primaryColor,
        secondary_color: secondaryColor,
        font_family: fontFamily,
        font_size: fontSize,
        font_weight: fontWeight,
        font_style: fontStyle,
        letter_spacing: letterSpacing,
        text_align: textAlign,
      });
      setSuccess("Style settings saved successfully!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save style settings");
    } finally {
      setSaving(false);
    }
  };

  const toggleItem = (itemId: string) => {
    setSelectedItems((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  };

  // Resolve background photo URL
  const backgroundPhotoUrl = (() => {
    if (!event?.background_photo_id || !event.celebrant_photos) return null;
    const url = event.celebrant_photos[event.background_photo_id];
    if (!url) return null;
    return url.startsWith("http") ? url : `${API_URL}${url}`;
  })();

  // Computed style values for preview
  const previewFontSize = FONT_SIZE_MAP[fontSize] || "1rem";
  const previewLetterSpacing = LETTER_SPACING_MAP[letterSpacing] || "0em";
  const previewTextAlign = textAlign as "left" | "center" | "right";

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 t-border border-t-eco" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl">
      <WizardSteps currentStep={5} />

      <div className="mb-6">
        <button
          onClick={() => router.push(`/dashboard/events/${eventId}/photos`)}
          className="text-sm t-text-muted hover:t-text-secondary transition-colors"
        >
          &larr; Back
        </button>
      </div>

      <h1 className="text-2xl font-bold t-text">Event Preview</h1>
      <p className="mt-1 text-sm t-text-muted">
        Customize the look and feel of your guest order page. Changes are reflected live in the preview.
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

      {/* Two-column layout */}
      <div className="mt-6 grid gap-8 lg:grid-cols-2">
        {/* Left: Customization Panel */}
        <div className="space-y-6">
          <div className="rounded-xl border t-border t-bg-card p-6 shadow-sm">
            <h2 className="text-lg font-semibold t-text mb-5">Style Customization</h2>

            {/* Primary Color */}
            <div className="mb-5">
              <label className="block text-sm font-medium t-text-secondary mb-1.5">
                Primary Color
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  placeholder="#22c55e"
                  className="flex-1 rounded-lg border t-border px-3 py-2.5 text-sm t-text font-mono focus:border-eco focus:outline-none focus:ring-1 focus:ring-eco"
                />
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="h-10 w-10 cursor-pointer rounded-lg border t-border p-0.5"
                />
              </div>
            </div>

            {/* Secondary Color */}
            <div className="mb-5">
              <label className="block text-sm font-medium t-text-secondary mb-1.5">
                Secondary Color
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  placeholder="#1a1a2e"
                  className="flex-1 rounded-lg border t-border px-3 py-2.5 text-sm t-text font-mono focus:border-eco focus:outline-none focus:ring-1 focus:ring-eco"
                />
                <input
                  type="color"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="h-10 w-10 cursor-pointer rounded-lg border t-border p-0.5"
                />
              </div>
            </div>

            {/* Font Family */}
            <div className="mb-5">
              <label className="block text-sm font-medium t-text-secondary mb-1.5">
                Font Family
              </label>
              <select
                value={fontFamily}
                onChange={(e) => setFontFamily(e.target.value)}
                className="w-full rounded-lg border t-border px-3 py-2.5 text-sm t-text focus:border-eco focus:outline-none focus:ring-1 focus:ring-eco"
              >
                {FONT_OPTIONS.map((font) => (
                  <option key={font} value={font}>
                    {font}
                  </option>
                ))}
              </select>
            </div>

            {/* Font Size */}
            <div className="mb-5">
              <label className="block text-sm font-medium t-text-secondary mb-1.5">
                Font Size
              </label>
              <div className="flex rounded-lg border t-border overflow-hidden">
                {(["small", "normal", "large"] as const).map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setFontSize(size)}
                    className={`flex-1 px-4 py-2.5 text-sm font-medium capitalize transition-colors ${
                      fontSize === size
                        ? "bg-eco text-white"
                        : "t-bg t-text-secondary hover:t-bg-secondary"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Font Weight */}
            <div className="mb-5">
              <label className="block text-sm font-medium t-text-secondary mb-1.5">
                Font Weight
              </label>
              <div className="flex rounded-lg border t-border overflow-hidden">
                {(["normal", "bold"] as const).map((weight) => (
                  <button
                    key={weight}
                    type="button"
                    onClick={() => setFontWeight(weight)}
                    className={`flex-1 px-4 py-2.5 text-sm font-medium capitalize transition-colors ${
                      fontWeight === weight
                        ? "bg-eco text-white"
                        : "t-bg t-text-secondary hover:t-bg-secondary"
                    }`}
                  >
                    {weight}
                  </button>
                ))}
              </div>
            </div>

            {/* Font Style */}
            <div className="mb-5">
              <label className="block text-sm font-medium t-text-secondary mb-1.5">
                Font Style
              </label>
              <div className="flex rounded-lg border t-border overflow-hidden">
                {(["normal", "italic"] as const).map((style) => (
                  <button
                    key={style}
                    type="button"
                    onClick={() => setFontStyle(style)}
                    className={`flex-1 px-4 py-2.5 text-sm font-medium capitalize transition-colors ${
                      fontStyle === style
                        ? "bg-eco text-white"
                        : "t-bg t-text-secondary hover:t-bg-secondary"
                    }`}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>

            {/* Letter Spacing */}
            <div className="mb-5">
              <label className="block text-sm font-medium t-text-secondary mb-1.5">
                Letter Spacing
              </label>
              <div className="flex rounded-lg border t-border overflow-hidden">
                {(["tight", "normal", "wide"] as const).map((spacing) => (
                  <button
                    key={spacing}
                    type="button"
                    onClick={() => setLetterSpacing(spacing)}
                    className={`flex-1 px-4 py-2.5 text-sm font-medium capitalize transition-colors ${
                      letterSpacing === spacing
                        ? "bg-eco text-white"
                        : "t-bg t-text-secondary hover:t-bg-secondary"
                    }`}
                  >
                    {spacing}
                  </button>
                ))}
              </div>
            </div>

            {/* Text Alignment */}
            <div className="mb-6">
              <label className="block text-sm font-medium t-text-secondary mb-1.5">
                Text Alignment
              </label>
              <div className="flex rounded-lg border t-border overflow-hidden">
                {(["left", "center", "right"] as const).map((align) => (
                  <button
                    key={align}
                    type="button"
                    onClick={() => setTextAlign(align)}
                    className={`flex-1 px-4 py-2.5 text-sm font-medium capitalize transition-colors ${
                      textAlign === align
                        ? "bg-eco text-white"
                        : "t-bg t-text-secondary hover:t-bg-secondary"
                    }`}
                  >
                    {align}
                  </button>
                ))}
              </div>
            </div>

            {/* Save Button */}
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full rounded-lg bg-eco px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-eco-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? "Saving..." : "Save Style Settings"}
            </button>
          </div>
        </div>

        {/* Right: Live Phone Preview */}
        <div className="flex justify-center lg:sticky lg:top-6 lg:self-start">
          <div
            className="relative overflow-hidden rounded-[2.5rem] border-[6px] border-gray-800 bg-gray-800 shadow-2xl"
            style={{ width: 375, height: 667 }}
          >
            {/* Phone notch */}
            <div className="absolute left-1/2 top-0 z-20 h-6 w-32 -translate-x-1/2 rounded-b-2xl bg-gray-800" />

            {/* Phone screen */}
            <div
              className="relative h-full w-full overflow-y-auto bg-white"
              style={{
                fontFamily: `'${fontFamily}', sans-serif`,
                fontSize: previewFontSize,
                fontWeight: fontWeight === "bold" ? 700 : 400,
                fontStyle: fontStyle,
                letterSpacing: previewLetterSpacing,
                textAlign: previewTextAlign,
              }}
            >
              {/* Background photo with blur */}
              {backgroundPhotoUrl && (
                <div className="absolute inset-0 z-0">
                  <img
                    src={backgroundPhotoUrl}
                    alt="Background"
                    className="h-full w-full object-cover"
                    style={{ filter: "blur(8px) brightness(0.4)", transform: "scale(1.1)" }}
                  />
                </div>
              )}

              {/* Content overlay */}
              <div
                className="relative z-10 flex flex-col min-h-full"
                style={{ color: backgroundPhotoUrl ? "#ffffff" : secondaryColor }}
              >
                {/* Header area */}
                <div className="pt-10 px-5 pb-4">
                  <h2
                    className="text-xl font-bold leading-tight"
                    style={{ color: primaryColor }}
                  >
                    {event?.name || "Event Name"}
                  </h2>

                  {event?.celebrant_message && (
                    <p
                      className="mt-2 text-sm opacity-80 leading-relaxed"
                      style={{ fontSize: previewFontSize }}
                    >
                      {event.celebrant_message}
                    </p>
                  )}
                </div>

                {/* Divider */}
                <div
                  className="mx-5 h-px opacity-20"
                  style={{ backgroundColor: primaryColor }}
                />

                {/* Menu categories */}
                <div className="flex-1 px-5 py-4 space-y-5">
                  {categories.length === 0 && (
                    <p className="text-sm opacity-60 py-8">
                      No menu items yet. Add items in the Menu Builder.
                    </p>
                  )}

                  {categories
                    .sort((a, b) => a.display_order - b.display_order)
                    .map((cat) => (
                      <div key={cat.id}>
                        <h3
                          className="text-sm font-bold uppercase tracking-wider mb-2"
                          style={{ color: primaryColor, fontSize: "0.75rem" }}
                        >
                          {cat.name}
                        </h3>
                        <div className="space-y-1.5">
                          {(cat.items || [])
                            .sort((a, b) => a.display_order - b.display_order)
                            .map((item) => {
                              const isSelected = selectedItems.has(item.id);
                              return (
                                <button
                                  key={item.id}
                                  type="button"
                                  onClick={() => toggleItem(item.id)}
                                  className="w-full rounded-lg px-3 py-2.5 text-left transition-all"
                                  style={{
                                    backgroundColor: isSelected
                                      ? primaryColor
                                      : backgroundPhotoUrl
                                      ? "rgba(255,255,255,0.1)"
                                      : "#f5f5f5",
                                    color: isSelected
                                      ? "#ffffff"
                                      : backgroundPhotoUrl
                                      ? "#ffffff"
                                      : secondaryColor,
                                    fontSize: previewFontSize,
                                    fontWeight: fontWeight === "bold" ? 700 : 400,
                                    fontStyle: fontStyle,
                                    letterSpacing: previewLetterSpacing,
                                    textAlign: previewTextAlign,
                                  }}
                                >
                                  <span className="flex items-center gap-2">
                                    <span
                                      className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border"
                                      style={{
                                        borderColor: isSelected ? "#ffffff" : primaryColor,
                                        backgroundColor: isSelected ? "#ffffff" : "transparent",
                                      }}
                                    >
                                      {isSelected && (
                                        <svg
                                          className="h-2.5 w-2.5"
                                          fill="none"
                                          viewBox="0 0 24 24"
                                          stroke={primaryColor}
                                          strokeWidth={4}
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M5 13l4 4L19 7"
                                          />
                                        </svg>
                                      )}
                                    </span>
                                    <span className="text-sm">{item.name}</span>
                                  </span>
                                </button>
                              );
                            })}
                        </div>
                      </div>
                    ))}
                </div>

                {/* Request a Waiter button */}
                <div className="px-5 pb-6 pt-2">
                  <button
                    type="button"
                    className="w-full rounded-xl py-3 text-sm font-bold text-white shadow-lg transition-transform hover:scale-[1.02]"
                    style={{ backgroundColor: primaryColor }}
                  >
                    Request a Waiter
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="mt-8 flex justify-between gap-3">
        <button
          onClick={() => router.push(`/dashboard/events/${eventId}/photos`)}
          className="rounded-lg border t-border px-6 py-3 text-sm font-semibold t-text-secondary transition-colors hover:t-bg"
        >
          &larr; Back
        </button>
        <button
          onClick={() => router.push(`/dashboard/events/${eventId}/tokens`)}
          className="inline-flex items-center gap-2 rounded-lg bg-eco px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-eco-dark"
        >
          Proceed to Payment
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </button>
      </div>
    </div>
  );
}
