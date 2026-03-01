"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";

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

interface BackendVenueData {
  venue_name: string;
  logo_url: string | null;
  menu: BackendCategory[];
  table_number: number;
}

interface BackendOrderItem {
  menu_item_name: string;
  quantity: number;
}

interface BackendOrder {
  id: string;
  order_number: string;
  status: string | null;
  bar_status: string | null;
  items: BackendOrderItem[];
  total_price: number | null;
  created_at: string;
}

interface BackendOrderHistory {
  orders: BackendOrder[];
}

/* Display types */

interface DrinkItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  is_available: boolean;
}

interface CategoryGroup {
  category: string;
  items: DrinkItem[];
}

interface VenueData {
  venue_name: string;
  venue_logo?: string;
  table_number: string;
  menu: CategoryGroup[];
}

interface OrderResult {
  order_number: string;
}

interface PastOrder {
  order_number: string;
  items: { name: string; quantity: number }[];
  total: number;
  status: string;
  created_at: string;
}

/* ---------- Helpers ---------- */

function formatNaira(amount: number): string {
  return "\u20A6" + amount.toLocaleString();
}

/* ---------- Phases ---------- */

type Phase = "loading" | "error" | "menu" | "placing" | "confirmed";

/* ========== Component ========== */

export default function BarOrderPage() {
  const params = useParams<{ venue_id: string; table_number: string }>();
  const venueId = params.venue_id;
  const tableNumber = params.table_number;

  const [phase, setPhase] = useState<Phase>("loading");
  const [errorMsg, setErrorMsg] = useState("");
  const [venueData, setVenueData] = useState<VenueData | null>(null);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [orderNumber, setOrderNumber] = useState("");
  const [pastOrders, setPastOrders] = useState<PastOrder[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  /* --- Load venue data --- */
  useEffect(() => {
    async function load() {
      try {
        const raw = await api.get<BackendVenueData>(
          `/api/order/bar/${venueId}/${tableNumber}`
        );
        const mapped: VenueData = {
          venue_name: raw.venue_name,
          venue_logo: raw.logo_url || undefined,
          table_number: String(raw.table_number),
          menu: raw.menu.map((cat) => ({
            category: cat.name,
            items: cat.items
              .filter((item) => item.price !== null)
              .map((item) => ({
                id: item.id,
                name: item.name,
                price: item.price!,
                image_url: item.image_url || undefined,
                is_available: item.is_available,
              })),
          })),
        };
        setVenueData(mapped);
        setPhase("menu");
        loadPastOrders();
      } catch (err) {
        setErrorMsg(
          err instanceof Error ? err.message : "Unable to load menu"
        );
        setPhase("error");
      }
    }
    load();
  }, [venueId, tableNumber]);

  /* --- Load past orders --- */
  const loadPastOrders = useCallback(
    async () => {
      try {
        const result = await api.get<BackendOrderHistory>(
          `/api/order/bar/${venueId}/${tableNumber}/session`
        );
        const mapped: PastOrder[] = result.orders.map((o) => ({
          order_number: o.order_number,
          items: o.items.map((i) => ({
            name: i.menu_item_name,
            quantity: i.quantity,
          })),
          total: o.total_price || 0,
          status: o.bar_status || o.status || "placed",
          created_at: o.created_at,
        }));
        setPastOrders(mapped);
      } catch {
        // silent
      }
    },
    [venueId, tableNumber]
  );

  /* --- Cart helpers --- */
  const addToCart = useCallback((itemId: string) => {
    setCart((prev) => ({ ...prev, [itemId]: (prev[itemId] || 0) + 1 }));
  }, []);

  const removeFromCart = useCallback((itemId: string) => {
    setCart((prev) => {
      const next = { ...prev };
      if (next[itemId] > 1) {
        next[itemId]--;
      } else {
        delete next[itemId];
      }
      return next;
    });
  }, []);

  const getItemById = useCallback(
    (id: string): DrinkItem | undefined => {
      if (!venueData) return undefined;
      for (const group of venueData.menu) {
        const item = group.items.find((i) => i.id === id);
        if (item) return item;
      }
      return undefined;
    },
    [venueData]
  );

  const cartTotal = Object.entries(cart).reduce((sum, [id, qty]) => {
    const item = getItemById(id);
    return sum + (item ? item.price * qty : 0);
  }, 0);

  const cartCount = Object.values(cart).reduce((sum, qty) => sum + qty, 0);

  /* --- Place order --- */
  const placeOrder = useCallback(async () => {
    setPhase("placing");
    try {
      const items = Object.entries(cart).map(([id, quantity]) => ({
        menu_item_id: id,
        quantity,
      }));
      const result = await api.post<OrderResult>(
        `/api/order/bar/${venueId}/${tableNumber}/place`,
        { items }
      );
      setOrderNumber(result.order_number);
      setCart({});
      setPhase("confirmed");
      loadPastOrders();
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : "Failed to place order"
      );
      setPhase("error");
    }
  }, [cart, venueId, tableNumber, venueData, loadPastOrders]);

  /* ========== Render ========== */

  /* --- Loading --- */
  if (phase === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-emerald-500" />
          <p className="text-lg font-medium text-gray-700">Loading menu...</p>
        </div>
      </div>
    );
  }

  /* --- Error --- */
  if (phase === "error") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white px-6">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <svg className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="mb-2 text-2xl font-bold text-gray-900">Error</h1>
          <p className="text-lg text-gray-600">{errorMsg}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 min-h-[48px] rounded-xl bg-emerald-500 px-8 py-3 text-lg font-semibold text-white"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  /* --- Confirmed --- */
  if (phase === "confirmed") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-white px-6">
        <div className="text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
            <svg className="h-10 w-10 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="mb-2 text-2xl font-bold text-gray-900">Order Placed!</h1>
          <p className="mb-1 text-lg text-gray-600">Order #{orderNumber}</p>
          <p className="text-sm text-gray-500">
            Your drinks are being prepared. We&apos;ll bring them to your table.
          </p>
        </div>

        <button
          onClick={() => setPhase("menu")}
          className="mt-8 min-h-[52px] w-full max-w-sm rounded-xl bg-emerald-500 px-6 py-3 text-lg font-bold text-white"
        >
          Order More
        </button>

        <button
          onClick={() => setShowHistory(true)}
          className="mt-3 min-h-[48px] w-full max-w-sm rounded-xl border-2 border-gray-300 px-6 py-3 text-base font-semibold text-gray-700"
        >
          View Order History
        </button>

        <p className="mt-8 text-xs text-gray-400">Powered by No Ojoro</p>
      </div>
    );
  }

  /* --- Menu + Cart --- */
  if (phase === "menu" && venueData) {
    return (
      <div className="min-h-screen bg-white pb-44">
        {/* Header */}
        <div className="sticky top-0 z-10 border-b border-gray-200 bg-white px-4 py-4">
          <div className="mx-auto flex max-w-lg items-center gap-3">
            {venueData.venue_logo && (
              <img
                src={venueData.venue_logo}
                alt={venueData.venue_name}
                className="h-10 w-10 rounded-full object-cover"
              />
            )}
            <div className="flex-1">
              <h1 className="text-lg font-bold text-gray-900">
                {venueData.venue_name}
              </h1>
              <p className="text-sm text-gray-500">
                Table {venueData.table_number}
              </p>
            </div>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="min-h-[44px] min-w-[44px] rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700"
            >
              History
            </button>
          </div>
        </div>

        {/* Order History Drawer */}
        {showHistory && (
          <div className="mx-auto max-w-lg border-b border-gray-200 bg-gray-50 px-4 py-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Order History</h2>
              <button
                onClick={() => setShowHistory(false)}
                className="min-h-[44px] min-w-[44px] text-sm font-medium text-gray-500"
              >
                Close
              </button>
            </div>
            {pastOrders.length === 0 ? (
              <p className="text-sm text-gray-500">No orders yet this session.</p>
            ) : (
              <div className="space-y-3">
                {pastOrders.map((order) => (
                  <div
                    key={order.order_number}
                    className="rounded-xl border border-gray-200 bg-white p-3"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm font-bold text-gray-900">
                        #{order.order_number}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          order.status === "fulfilled"
                            ? "bg-emerald-100 text-emerald-700"
                            : order.status === "preparing"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                    {order.items.map((item, i) => (
                      <p key={i} className="text-sm text-gray-600">
                        {item.quantity}x {item.name}
                      </p>
                    ))}
                    <p className="mt-1 text-sm font-semibold text-gray-900">
                      Total: {formatNaira(order.total)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Drink Menu */}
        <div className="mx-auto max-w-lg px-4 py-4">
          {venueData.menu.map((group) => (
            <div key={group.category} className="mb-8">
              <h2 className="mb-3 text-lg font-bold text-gray-900">
                {group.category}
              </h2>
              <div className="space-y-3">
                {group.items.map((item) => {
                  const qty = cart[item.id] || 0;

                  return (
                    <div
                      key={item.id}
                      className={`flex items-center gap-4 rounded-xl border border-gray-200 p-4 ${
                        !item.is_available ? "opacity-50" : ""
                      }`}
                    >
                      {item.image_url && (
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="h-14 w-14 shrink-0 rounded-lg object-cover"
                        />
                      )}
                      <div className="flex-1">
                        <p className="text-base font-semibold text-gray-900">
                          {item.name}
                        </p>
                        {item.description && (
                          <p className="text-sm text-gray-500">{item.description}</p>
                        )}
                        <p className="mt-1 text-base font-bold text-emerald-600">
                          {formatNaira(item.price)}
                        </p>
                        {!item.is_available && (
                          <p className="text-sm font-medium text-red-500">
                            Unavailable
                          </p>
                        )}
                      </div>

                      {/* Quantity selector */}
                      {item.is_available && (
                        <div className="flex items-center gap-1">
                          {qty > 0 && (
                            <>
                              <button
                                onClick={() => removeFromCart(item.id)}
                                className="flex h-11 w-11 items-center justify-center rounded-lg border border-gray-300 text-xl font-bold text-gray-700 active:bg-gray-100"
                              >
                                -
                              </button>
                              <span className="w-8 text-center text-lg font-bold text-gray-900">
                                {qty}
                              </span>
                            </>
                          )}
                          <button
                            onClick={() => addToCart(item.id)}
                            className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-500 text-xl font-bold text-white active:bg-emerald-600"
                          >
                            +
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Fixed bottom cart bar */}
        {cartCount > 0 && (
          <div className="fixed bottom-0 left-0 right-0 border-t border-gray-200 bg-white px-4 py-4">
            <div className="mx-auto max-w-lg">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-base text-gray-600">
                  {cartCount} item{cartCount !== 1 ? "s" : ""}
                </span>
                <span className="text-xl font-bold text-gray-900">
                  {formatNaira(cartTotal)}
                </span>
              </div>
              <button
                onClick={placeOrder}
                className="min-h-[52px] w-full rounded-xl bg-emerald-500 px-6 py-3 text-lg font-bold text-white active:bg-emerald-600"
              >
                Place Order
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-4 py-6 text-center">
          <p className="text-xs text-gray-400">Powered by No Ojoro</p>
        </div>
      </div>
    );
  }

  /* --- Placing --- */
  if (phase === "placing") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-emerald-500" />
          <p className="text-lg font-medium text-gray-700">Placing your order...</p>
        </div>
      </div>
    );
  }

  return null;
}
