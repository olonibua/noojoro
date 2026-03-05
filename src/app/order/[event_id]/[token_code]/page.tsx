"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/* ---------- Types ---------- */

/* Backend response types */

interface BackendMenuItem {
  id: string;
  category_id: string;
  name: string;
  price: number | null;
  is_available: boolean;
  image_url: string | null;
}

interface BackendCategory {
  id: string;
  name: string;
  display_order: number;
  is_vip_only: boolean;
  items: BackendMenuItem[];
}

interface BackendTokenData {
  event_name: string;
  primary_color: string | null;
  secondary_color: string | null;
  celebrant_photos: Record<string, string> | null;
  celebrant_message: string | null;
  background_photo_id: string | null;
  font_family: string | null;
  font_size: string | null;
  font_weight: string | null;
  font_style: string | null;
  letter_spacing: string | null;
  text_align: string | null;
  menu: BackendCategory[];
  table_number: number;
  seat_number: number;
  is_vip: boolean;
}

/* Display types */

interface MenuItem {
  id: string;
  name: string;
  description?: string;
  image_url?: string;
  is_depleted: boolean;
}

interface CategoryGroup {
  category: string;
  items: MenuItem[];
}

interface Photo {
  url: string;
}

interface FontStyle {
  fontFamily: string;
  fontSize: string;
  fontWeight: string;
  fontStyle: string;
  letterSpacing: string;
  textAlign: "left" | "center" | "right";
}

interface TokenData {
  event_name: string;
  primary_color: string;
  secondary_color: string;
  celebrant_message: string | null;
  background_photo: Photo | null;
  photos: Photo[];
  menu: CategoryGroup[];
  fontStyle: FontStyle;
}

interface OrderResult {
  order_number: string;
}

/* ---------- Helpers ---------- */

function formatNaira(amount: number): string {
  return "\u20A6" + amount.toLocaleString();
}

/* ---------- Phases ---------- */

type Phase = "loading" | "error" | "slideshow" | "menu" | "summary" | "placing" | "confirmed";

/* ========== Component ========== */

export default function GuestCateringOrderPage() {
  const params = useParams<{ event_id: string; token_code: string }>();
  const eventId = params.event_id;
  const tokenCode = params.token_code;

  const [phase, setPhase] = useState<Phase>("loading");
  const [errorMsg, setErrorMsg] = useState("");
  const [tokenData, setTokenData] = useState<TokenData | null>(null);
  const [slideIndex, setSlideIndex] = useState(0);
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [orderNumber, setOrderNumber] = useState("");
  const [waiterRequested, setWaiterRequested] = useState(false);
  const slideTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const themeColor = tokenData?.primary_color || "#22C55E";

  /* --- Load token data --- */
  useEffect(() => {
    async function validate() {
      try {
        const raw = await api.get<BackendTokenData>(
          `/api/order/catering/${eventId}/${tokenCode}`
        );

        // Convert celebrant_photos dict to photos array
        const photosMap = raw.celebrant_photos || {};
        const photoEntries = Object.entries(photosMap);
        const allPhotos: { id: string; photo: Photo }[] = photoEntries.map(([id, url]) => ({
          id,
          photo: { url: (url as string).startsWith("http") ? (url as string) : `${API_URL}${url}` },
        }));

        // Use background_photo_id if set, otherwise fall back to first photo
        let backgroundPhoto: Photo | null = null;
        const slideshowPhotos: Photo[] = [];

        if (raw.background_photo_id) {
          const bgEntry = allPhotos.find((p) => p.id === raw.background_photo_id);
          if (bgEntry) {
            backgroundPhoto = bgEntry.photo;
            // Remaining photos go to slideshow
            for (const p of allPhotos) {
              if (p.id !== raw.background_photo_id) slideshowPhotos.push(p.photo);
            }
          }
        }

        // Fallback: first photo = background, rest = slideshow
        if (!backgroundPhoto && allPhotos.length > 0) {
          backgroundPhoto = allPhotos[0].photo;
          for (let i = 1; i < allPhotos.length; i++) slideshowPhotos.push(allPhotos[i].photo);
        }

        // Map font settings
        const FONT_SIZE_MAP: Record<string, string> = { small: "0.875rem", normal: "1rem", large: "1.125rem" };
        const LETTER_SPACING_MAP: Record<string, string> = { tight: "-0.025em", normal: "0em", wide: "0.05em" };

        const fontSettings: FontStyle = {
          fontFamily: raw.font_family || "Plus Jakarta Sans",
          fontSize: FONT_SIZE_MAP[raw.font_size || "normal"] || "1rem",
          fontWeight: raw.font_weight || "normal",
          fontStyle: raw.font_style || "normal",
          letterSpacing: LETTER_SPACING_MAP[raw.letter_spacing || "normal"] || "0em",
          textAlign: (raw.text_align as "left" | "center" | "right") || "center",
        };

        // Map backend categories to display format
        const menu: CategoryGroup[] = raw.menu.map((cat) => ({
          category: cat.name,
          items: cat.items.map((item) => ({
            id: item.id,
            name: item.name,
            image_url: item.image_url || undefined,
            is_depleted: !item.is_available,
          })),
        }));

        const mapped: TokenData = {
          event_name: raw.event_name,
          primary_color: raw.primary_color || "#22C55E",
          secondary_color: raw.secondary_color || "#FFFFFF",
          celebrant_message: raw.celebrant_message || null,
          background_photo: backgroundPhoto,
          photos: slideshowPhotos,
          menu,
          fontStyle: fontSettings,
        };

        setTokenData(mapped);
        if (slideshowPhotos.length > 0) {
          setPhase("slideshow");
        } else {
          setPhase("menu");
        }
      } catch (err) {
        setErrorMsg(
          err instanceof Error ? err.message : "Invalid or already used token"
        );
        setPhase("error");
      }
    }
    validate();
  }, [eventId, tokenCode]);

  /* --- Slideshow auto-advance --- */
  useEffect(() => {
    if (phase !== "slideshow" || !tokenData) return;
    const photos = tokenData.photos;
    if (!photos || photos.length === 0) {
      setPhase("menu");
      return;
    }
    slideTimer.current = setInterval(() => {
      setSlideIndex((prev) => {
        if (prev >= photos.length - 1) {
          if (slideTimer.current) clearInterval(slideTimer.current);
          setPhase("menu");
          return prev;
        }
        return prev + 1;
      });
    }, 3000);

    return () => {
      if (slideTimer.current) clearInterval(slideTimer.current);
    };
  }, [phase, tokenData]);

  /* --- Dynamic font loading --- */
  useEffect(() => {
    if (!tokenData) return;
    const fontFamily = tokenData.fontStyle.fontFamily;
    if (fontFamily === "Plus Jakarta Sans") return; // Already loaded in layout

    const linkId = `dynamic-font-${fontFamily.replace(/\s+/g, "-")}`;
    if (document.getElementById(linkId)) return;

    const link = document.createElement("link");
    link.id = linkId;
    link.rel = "stylesheet";
    link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontFamily)}:ital,wght@0,400;0,700;1,400;1,700&display=swap`;
    document.head.appendChild(link);
  }, [tokenData]);

  const skipSlideshow = useCallback(() => {
    if (slideTimer.current) clearInterval(slideTimer.current);
    setPhase("menu");
  }, []);

  /* --- Select item per category --- */
  const selectItem = useCallback((category: string, itemId: string) => {
    setSelections((prev) => ({ ...prev, [category]: itemId }));
  }, []);

  /* --- Place order --- */
  const placeOrder = useCallback(async () => {
    setPhase("placing");
    try {
      const items = Object.values(selections).map((id) => ({
        menu_item_id: id,
        quantity: 1,
      }));
      const result = await api.post<OrderResult>(
        `/api/order/catering/${eventId}/${tokenCode}/place`,
        { items }
      );
      setOrderNumber(result.order_number);
      setPhase("confirmed");
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : "Failed to place order"
      );
      setPhase("error");
    }
  }, [selections, eventId, tokenCode]);

  /* --- Request waiter --- */
  const requestWaiter = useCallback(async () => {
    try {
      await api.post(`/api/order/catering/${eventId}/${tokenCode}/waiter`);
      setWaiterRequested(true);
      setTimeout(() => setWaiterRequested(false), 5000);
    } catch {
      // silent fail
    }
  }, [eventId, tokenCode]);

  /* --- Get selected item details for summary --- */
  const getSelectedItems = useCallback((): { category: string; item: MenuItem }[] => {
    if (!tokenData) return [];
    const result: { category: string; item: MenuItem }[] = [];
    for (const group of tokenData.menu) {
      const selectedId = selections[group.category];
      if (selectedId) {
        const item = group.items.find((i) => i.id === selectedId);
        if (item) result.push({ category: group.category, item });
      }
    }
    return result;
  }, [tokenData, selections]);

  /* ========== Render helpers ========== */

  /* --- Loading --- */
  if (phase === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center guest-bg">
        <div className="text-center animate-fade-in">
          <div
            className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-gray-200"
            style={{ borderTopColor: themeColor }}
          />
          <p className="text-lg font-medium text-gray-500">Loading your menu...</p>
        </div>
      </div>
    );
  }

  /* --- Error --- */
  if (phase === "error") {
    return (
      <div className="flex min-h-screen items-center justify-center guest-bg px-6">
        <div className="text-center animate-fade-in">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 border border-red-100">
            <svg className="h-8 w-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="mb-2 text-2xl font-bold text-gray-900">Oops!</h1>
          <p className="text-base text-gray-500">{errorMsg}</p>
        </div>
      </div>
    );
  }

  /* --- Slideshow --- */
  if (phase === "slideshow" && tokenData) {
    const photos = tokenData.photos;
    const current = photos[slideIndex];
    return (
      <div className="relative flex min-h-screen flex-col items-center justify-center px-6">
        {/* Background photo (first uploaded photo) */}
        {tokenData.background_photo && (
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${tokenData.background_photo.url})` }}
          >
            <div className="absolute inset-0 bg-black/50" />
          </div>
        )}
        {!tokenData.background_photo && <div className="absolute inset-0 bg-white" />}

        <div className="relative z-10">
          <h2
            className="mb-4 text-center text-2xl font-bold"
            style={{ color: tokenData.background_photo ? "#FFFFFF" : themeColor }}
          >
            Welcome to {tokenData.event_name}!
          </h2>

          {tokenData.celebrant_message && (
            <p
              className="mb-6 text-center text-base"
              style={{
                color: tokenData.background_photo ? "#FFFFFFCC" : "#6B7280",
                fontFamily: tokenData.fontStyle.fontFamily,
                fontStyle: tokenData.fontStyle.fontStyle,
              }}
            >
              {tokenData.celebrant_message}
            </p>
          )}

          {current && (
            <div className="relative mb-6 w-full max-w-sm overflow-hidden rounded-2xl">
              <img
                src={current.url}
                alt="Celebration photo"
                className="h-72 w-full object-cover"
              />
            </div>
          )}

          {/* Dots */}
          <div className="mb-6 flex justify-center gap-2">
            {photos.map((_, i) => (
              <div
                key={i}
                className="h-2 w-2 rounded-full transition-colors"
                style={{
                  backgroundColor: i === slideIndex ? themeColor : "#D1D5DB",
                }}
              />
            ))}
          </div>

          <button
            onClick={skipSlideshow}
            className="min-h-[48px] min-w-[120px] rounded-full border border-white/30 px-6 py-3 text-base font-semibold text-white/90 backdrop-blur-sm active:bg-white/10 transition-all"
          >
            Skip to Menu
          </button>
        </div>
      </div>
    );
  }

  /* --- Menu --- */
  if (phase === "menu" && tokenData) {
    const allSelected = tokenData.menu.every(
      (g) => selections[g.category] !== undefined
    );

    return (
      <div className="min-h-screen guest-bg pb-40">
        {/* Header */}
        <div className="guest-header sticky top-0 z-10 px-4 py-4">
          <h1 className="text-center text-xl font-bold text-gray-900">
            {tokenData.event_name}
          </h1>
          <p className="mt-1 text-center text-sm text-gray-400">
            Select one item per category
          </p>
        </div>

        {/* Celebrant Message */}
        {tokenData.celebrant_message && (
          <div className="mx-auto max-w-lg px-4 pt-4">
            <p
              className="rounded-xl bg-gray-50 p-4 text-gray-600"
              style={{
                fontFamily: tokenData.fontStyle.fontFamily,
                fontSize: tokenData.fontStyle.fontSize,
                fontWeight: tokenData.fontStyle.fontWeight,
                fontStyle: tokenData.fontStyle.fontStyle,
                letterSpacing: tokenData.fontStyle.letterSpacing,
                textAlign: tokenData.fontStyle.textAlign,
              }}
            >
              {tokenData.celebrant_message}
            </p>
          </div>
        )}

        {/* Categories */}
        <div
          className="mx-auto max-w-lg px-4 py-4"
          style={{
            fontFamily: tokenData.fontStyle.fontFamily,
            fontSize: tokenData.fontStyle.fontSize,
            fontWeight: tokenData.fontStyle.fontWeight,
            fontStyle: tokenData.fontStyle.fontStyle,
            letterSpacing: tokenData.fontStyle.letterSpacing,
            textAlign: tokenData.fontStyle.textAlign,
          }}
        >
          {tokenData.menu.map((group) => (
            <div key={group.category} className="mb-8">
              <h2
                className="mb-3 text-lg font-bold"
                style={{ color: themeColor }}
              >
                {group.category}
              </h2>
              <div className="space-y-3">
                {group.items.map((item) => {
                  const isSelected = selections[group.category] === item.id;
                  const isDepleted = item.is_depleted;

                  return (
                    <button
                      key={item.id}
                      disabled={isDepleted}
                      onClick={() => selectItem(group.category, item.id)}
                      className={`flex w-full items-center gap-4 rounded-xl border-2 p-4 text-left transition-colors ${
                        isDepleted
                          ? "cursor-not-allowed border-gray-200 bg-gray-50 opacity-60"
                          : isSelected
                          ? "border-current bg-opacity-5"
                          : "border-gray-200 bg-white active:bg-gray-50"
                      }`}
                      style={
                        isSelected && !isDepleted
                          ? { borderColor: themeColor, backgroundColor: themeColor + "0D" }
                          : undefined
                      }
                    >
                      {/* Radio circle */}
                      <div
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2"
                        style={{
                          borderColor: isSelected ? themeColor : "#D1D5DB",
                          backgroundColor: isSelected ? themeColor : "transparent",
                        }}
                      >
                        {isSelected && (
                          <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>

                      {/* Item image */}
                      {item.image_url && (
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="h-14 w-14 shrink-0 rounded-lg object-cover"
                        />
                      )}

                      {/* Item info */}
                      <div className="flex-1">
                        <p className="text-base font-semibold text-gray-900">
                          {item.name}
                        </p>
                        {item.description && (
                          <p className="mt-0.5 text-sm text-gray-500">
                            {item.description}
                          </p>
                        )}
                        {isDepleted && (
                          <p className="mt-1 text-sm font-medium text-red-500">
                            Sorry, this meal is finished
                          </p>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Fixed bottom bar */}
        <div className="guest-bottom-bar fixed bottom-0 left-0 right-0 px-4 py-4">
          <div className="mx-auto max-w-lg space-y-3">
            <button
              disabled={!allSelected}
              onClick={() => setPhase("summary")}
              className="min-h-[52px] w-full rounded-full px-6 py-3 text-lg font-bold text-white transition-all disabled:opacity-40"
              style={{ backgroundColor: themeColor, boxShadow: allSelected ? `0 8px 24px ${themeColor}33` : 'none' }}
            >
              Review Order ({Object.keys(selections).length}/{tokenData.menu.length})
            </button>
            <button
              onClick={requestWaiter}
              className="min-h-[48px] w-full rounded-full border border-gray-200 px-6 py-3 text-base font-semibold text-gray-600 active:bg-gray-50 transition-colors"
            >
              {waiterRequested ? "Waiter Notified!" : "Request a Waiter"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* --- Summary --- */
  if (phase === "summary" && tokenData) {
    const selectedItems = getSelectedItems();

    return (
      <div className="min-h-screen guest-bg pb-40">
        <div className="guest-header sticky top-0 z-10 px-4 py-4">
          <h1 className="text-center text-xl font-bold text-gray-900">
            Order Summary
          </h1>
        </div>

        <div className="mx-auto max-w-lg px-4 py-6">
          <div className="space-y-3">
            {selectedItems.map(({ category, item }) => (
              <div
                key={category}
                className="guest-card flex items-center justify-between p-4"
              >
                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">{category}</p>
                  <p className="mt-0.5 text-base font-semibold text-gray-900">{item.name}</p>
                </div>
                {item.image_url && (
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="h-12 w-12 rounded-xl object-cover"
                  />
                )}
              </div>
            ))}
          </div>

          <button
            onClick={() => setPhase("menu")}
            className="mt-6 min-h-[48px] w-full rounded-full border border-gray-200 px-6 py-3 text-base font-semibold text-gray-600 active:bg-gray-50 transition-colors"
          >
            Edit Selections
          </button>
        </div>

        <div className="guest-bottom-bar fixed bottom-0 left-0 right-0 px-4 py-4">
          <div className="mx-auto max-w-lg space-y-3">
            <button
              onClick={placeOrder}
              className="min-h-[52px] w-full rounded-full px-6 py-3 text-lg font-bold text-white transition-all"
              style={{ backgroundColor: themeColor, boxShadow: `0 8px 24px ${themeColor}33` }}
            >
              Place Order
            </button>
            <button
              onClick={requestWaiter}
              className="min-h-[48px] w-full rounded-full border border-gray-200 px-6 py-3 text-base font-semibold text-gray-600 active:bg-gray-50 transition-colors"
            >
              {waiterRequested ? "Waiter Notified!" : "Request a Waiter"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* --- Placing --- */
  if (phase === "placing") {
    return (
      <div className="flex min-h-screen items-center justify-center guest-bg">
        <div className="text-center animate-fade-in">
          <div
            className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-gray-200"
            style={{ borderTopColor: themeColor }}
          />
          <p className="text-lg font-medium text-gray-500">Placing your order...</p>
        </div>
      </div>
    );
  }

  /* --- Confirmed --- */
  if (phase === "confirmed") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center guest-bg px-6">
        <div className="text-center animate-slide-up">
          {/* Green checkmark */}
          <div
            className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border"
            style={{ backgroundColor: themeColor + "12", borderColor: themeColor + "20" }}
          >
            <svg
              className="h-10 w-10"
              style={{ color: themeColor }}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 className="mb-2 text-2xl font-bold text-gray-900">Order Placed!</h1>
          <p className="mb-1 text-lg text-gray-500">
            Order #{orderNumber}
          </p>
          <p className="text-sm text-gray-400">
            Your food is being prepared. A waiter will bring it to you.
          </p>
        </div>

        <button
          onClick={requestWaiter}
          className="mt-8 min-h-[52px] w-full max-w-sm rounded-full border border-gray-200 px-6 py-3 text-lg font-semibold text-gray-600 active:bg-gray-50 transition-colors"
        >
          {waiterRequested ? "Waiter Notified!" : "Request a Waiter"}
        </button>

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="mb-1 text-sm font-medium text-gray-400">
            Planning a party? Let&apos;s make it unforgettable!
          </p>
          <p className="text-xs text-gray-300">Powered by No Ojoro</p>
        </div>
      </div>
    );
  }

  return null;
}
