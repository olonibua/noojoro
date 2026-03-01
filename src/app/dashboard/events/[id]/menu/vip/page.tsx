"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { api } from "@/lib/api";

interface MenuItem {
  id: string;
  name: string;
  category_id: string;
  price: number | null;
  total_quantity: number;
  remaining_quantity: number;
  is_available: boolean;
  image_url: string | null;
}

interface MenuCategory {
  id: string;
  name: string;
  display_order: number;
  is_vip_only: boolean;
  items: MenuItem[];
}

interface FullMenuResponse {
  categories: MenuCategory[];
}

export default function VipMenuPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params.id as string;

  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // New category form
  const [newCatName, setNewCatName] = useState("");
  const [newCatOrder, setNewCatOrder] = useState("0");
  const [addingCat, setAddingCat] = useState(false);

  // New item form
  const [addingItemCatId, setAddingItemCatId] = useState<string | null>(null);
  const [newItemName, setNewItemName] = useState("");
  const [newItemQty, setNewItemQty] = useState("100");
  const [addingItem, setAddingItem] = useState(false);

  // Edit category
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editCatName, setEditCatName] = useState("");
  const [editCatOrder, setEditCatOrder] = useState("");

  // Edit item
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editItemName, setEditItemName] = useState("");
  const [editItemQty, setEditItemQty] = useState("");

  const fetchMenu = useCallback(async () => {
    try {
      const data = await api.get<FullMenuResponse>(
        `/api/events/${eventId}/menu/manage?is_vip=true`
      );
      // Filter to only VIP categories (is_vip=true returns all categories)
      const vipCategories = (data.categories || []).filter(
        (c) => c.is_vip_only
      );
      setCategories(vipCategories);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load VIP menu");
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    fetchMenu();
  }, [fetchMenu]);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddingCat(true);
    setError("");
    setSuccess("");
    try {
      await api.post(`/api/events/${eventId}/menu/vip/categories`, {
        name: newCatName,
        display_order: parseInt(newCatOrder) || 0,
      });
      setNewCatName("");
      setNewCatOrder(String(categories.length));
      setSuccess("VIP category added!");
      await fetchMenu();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add category");
    } finally {
      setAddingCat(false);
    }
  };

  const handleUpdateCategory = async (catId: string) => {
    setError("");
    setSuccess("");
    try {
      await api.put(`/api/events/${eventId}/menu/categories/${catId}`, {
        name: editCatName,
        display_order: parseInt(editCatOrder) || 0,
      });
      setEditingCatId(null);
      setSuccess("Category updated!");
      await fetchMenu();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update category");
    }
  };

  const handleDeleteCategory = async (catId: string) => {
    if (!confirm("Delete this VIP category and all its items?")) return;
    setError("");
    try {
      await api.delete(`/api/events/${eventId}/menu/categories/${catId}`);
      setSuccess("Category deleted.");
      await fetchMenu();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete category");
    }
  };

  const handleAddItem = async (catId: string) => {
    setAddingItem(true);
    setError("");
    setSuccess("");
    try {
      await api.post(`/api/events/${eventId}/menu/vip/items`, {
        category_id: catId,
        name: newItemName,
        total_quantity: parseInt(newItemQty) || 0,
      });
      setAddingItemCatId(null);
      setNewItemName("");
      setNewItemQty("100");
      setSuccess("VIP item added!");
      await fetchMenu();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add item");
    } finally {
      setAddingItem(false);
    }
  };

  const handleUpdateItem = async (itemId: string) => {
    setError("");
    setSuccess("");
    try {
      await api.put(`/api/events/${eventId}/menu/items/${itemId}`, {
        name: editItemName,
        total_quantity: parseInt(editItemQty) || 0,
      });
      setEditingItemId(null);
      setSuccess("Item updated!");
      await fetchMenu();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update item");
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm("Delete this VIP menu item?")) return;
    setError("");
    try {
      await api.delete(`/api/events/${eventId}/menu/items/${itemId}`);
      setSuccess("Item deleted.");
      await fetchMenu();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete item");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-[#22C55E]" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => router.push(`/dashboard/events/${eventId}/menu`)}
          className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          &larr; Regular Menu
        </button>
      </div>

      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold text-gray-900">VIP Menu Builder</h1>
        <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
          VIP
        </span>
      </div>
      <p className="mt-1 text-sm text-gray-500">
        Create the VIP menu with categories and items. No prices -- catering mode.
      </p>

      {error && (
        <div className="mt-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div className="mt-4 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
          {success}
        </div>
      )}

      {/* Add Category */}
      <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50/30 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">Add VIP Category</h2>
        <form onSubmit={handleAddCategory} className="mt-3 flex flex-wrap gap-3">
          <input
            required
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
            placeholder="Category name (e.g. Premium Drinks)"
            className="flex-1 min-w-[200px] rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-[#22C55E] focus:outline-none focus:ring-1 focus:ring-[#22C55E]"
          />
          <input
            type="number"
            value={newCatOrder}
            onChange={(e) => setNewCatOrder(e.target.value)}
            placeholder="Order"
            className="w-24 rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-[#22C55E] focus:outline-none focus:ring-1 focus:ring-[#22C55E]"
          />
          <button
            type="submit"
            disabled={addingCat}
            className="rounded-lg bg-[#22C55E] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#16A34A] disabled:opacity-50 transition-colors"
          >
            {addingCat ? "Adding..." : "Add Category"}
          </button>
        </form>
      </div>

      {/* Categories & Items */}
      <div className="mt-6 space-y-6">
        {categories.length === 0 && (
          <div className="rounded-xl border border-gray-200 bg-white py-12 text-center text-sm text-gray-500">
            No VIP categories yet. Add one above to get started.
          </div>
        )}

        {categories
          .sort((a, b) => a.display_order - b.display_order)
          .map((cat) => (
            <div
              key={cat.id}
              className="rounded-xl border border-gray-200 bg-white shadow-sm"
            >
              {/* Category Header */}
              <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                {editingCatId === cat.id ? (
                  <div className="flex flex-1 flex-wrap gap-2">
                    <input
                      value={editCatName}
                      onChange={(e) => setEditCatName(e.target.value)}
                      className="flex-1 min-w-[150px] rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-[#22C55E] focus:outline-none focus:ring-1 focus:ring-[#22C55E]"
                    />
                    <input
                      type="number"
                      value={editCatOrder}
                      onChange={(e) => setEditCatOrder(e.target.value)}
                      className="w-20 rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-[#22C55E] focus:outline-none focus:ring-1 focus:ring-[#22C55E]"
                      title="Display order"
                    />
                    <button
                      onClick={() => handleUpdateCategory(cat.id)}
                      className="rounded-lg bg-[#22C55E] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#16A34A]"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingCatId(null)}
                      className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-semibold text-gray-900">{cat.name}</h3>
                        <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700">
                          VIP
                        </span>
                      </div>
                      <p className="text-xs text-gray-400">
                        Order: {cat.display_order} &middot; {cat.items?.length || 0} items
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setEditingCatId(cat.id);
                          setEditCatName(cat.name);
                          setEditCatOrder(String(cat.display_order));
                        }}
                        className="rounded px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(cat.id)}
                        className="rounded px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* Items */}
              <div className="divide-y divide-gray-50">
                {(cat.items || []).map((item) => (
                    <div key={item.id} className="px-6 py-3">
                      {editingItemId === item.id ? (
                        <div className="flex flex-wrap gap-2">
                          <input
                            value={editItemName}
                            onChange={(e) => setEditItemName(e.target.value)}
                            placeholder="Item name"
                            className="flex-1 min-w-[150px] rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-[#22C55E] focus:outline-none focus:ring-1 focus:ring-[#22C55E]"
                          />
                          <input
                            type="number"
                            value={editItemQty}
                            onChange={(e) => setEditItemQty(e.target.value)}
                            placeholder="Qty"
                            className="w-24 rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-[#22C55E] focus:outline-none focus:ring-1 focus:ring-[#22C55E]"
                          />
                          <button
                            onClick={() => handleUpdateItem(item.id)}
                            className="rounded-lg bg-[#22C55E] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#16A34A]"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingItemId(null)}
                            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-sm text-gray-900">{item.name}</span>
                            <span className="ml-3 text-xs text-gray-400">
                              Qty: {item.total_quantity}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setEditingItemId(item.id);
                                setEditItemName(item.name);
                                setEditItemQty(String(item.total_quantity));
                              }}
                              className="rounded px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteItem(item.id)}
                              className="rounded px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
              </div>

              {/* Add Item */}
              <div className="border-t border-gray-100 px-6 py-3">
                {addingItemCatId === cat.id ? (
                  <div className="flex flex-wrap gap-2">
                    <input
                      value={newItemName}
                      onChange={(e) => setNewItemName(e.target.value)}
                      placeholder="Item name"
                      className="flex-1 min-w-[150px] rounded-lg border border-gray-300 px-3 py-1.5 text-sm placeholder-gray-400 focus:border-[#22C55E] focus:outline-none focus:ring-1 focus:ring-[#22C55E]"
                    />
                    <input
                      type="number"
                      value={newItemQty}
                      onChange={(e) => setNewItemQty(e.target.value)}
                      placeholder="Total qty"
                      className="w-28 rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-[#22C55E] focus:outline-none focus:ring-1 focus:ring-[#22C55E]"
                    />
                    <button
                      onClick={() => handleAddItem(cat.id)}
                      disabled={addingItem || !newItemName}
                      className="rounded-lg bg-[#22C55E] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#16A34A] disabled:opacity-50"
                    >
                      {addingItem ? "Adding..." : "Add"}
                    </button>
                    <button
                      onClick={() => {
                        setAddingItemCatId(null);
                        setNewItemName("");
                        setNewItemQty("100");
                      }}
                      className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setAddingItemCatId(cat.id)}
                    className="text-sm font-medium text-[#22C55E] hover:text-[#16A34A] transition-colors"
                  >
                    + Add VIP Item
                  </button>
                )}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
