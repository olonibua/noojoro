"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { api } from "@/lib/api";

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
  display_order: number;
  items: MenuItem[];
}

export default function MenuBuilderPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params.id as string;

  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // New category form
  const [newCatName, setNewCatName] = useState("");
  const [newCatOrder, setNewCatOrder] = useState("");
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
  const [editItemOrder, setEditItemOrder] = useState("");

  const fetchMenu = useCallback(async () => {
    try {
      const res = await api.get<{ categories: MenuCategory[] }>(
        `/api/events/${eventId}/menu/manage`
      );
      const data = res.categories;
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load menu");
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
      await api.post(`/api/events/${eventId}/menu/categories`, {
        name: newCatName,
        display_order: parseInt(newCatOrder) || 0,
      });
      setNewCatName("");
      setNewCatOrder(String(categories.length));
      setSuccess("Category added!");
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
    if (!confirm("Delete this category and all its items?")) return;
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
      await api.post(`/api/events/${eventId}/menu/items`, {
        category_id: catId,
        name: newItemName,
        total_quantity: parseInt(newItemQty) || 0,
        display_order: 0,
      });
      setAddingItemCatId(null);
      setNewItemName("");
      setNewItemQty("100");
      setSuccess("Item added!");
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
        display_order: parseInt(editItemOrder) || 0,
      });
      setEditingItemId(null);
      setSuccess("Item updated!");
      await fetchMenu();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update item");
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm("Delete this menu item?")) return;
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
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#E3E8E1] border-t-eco" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => router.push(`/dashboard/events/${eventId}`)}
          className="text-sm text-[#6B7366] hover:text-[#3A3D37] transition-colors"
        >
          &larr; Back to Event
        </button>
        <button
          onClick={() => router.push(`/dashboard/events/${eventId}/menu/vip`)}
          className="rounded-lg border border-eco px-4 py-2 text-sm font-medium text-eco hover:bg-eco/5 transition-colors"
        >
          VIP Menu &rarr;
        </button>
      </div>

      <h1 className="text-2xl font-bold text-[#1C1F1A]">Menu Builder</h1>
      <p className="mt-1 text-sm text-[#6B7366]">
        Create categories and add items. No prices -- catering mode.
      </p>

      {error && (
        <div className="mt-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div className="mt-4 rounded-lg bg-[#F1F8E9] border border-[#C5E1A5] px-4 py-3 text-sm text-eco-dark">
          {success}
        </div>
      )}

      {/* Add Category */}
      <div className="mt-6 rounded-xl border border-[#E3E8E1] bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-[#1C1F1A]">Add Category</h2>
        <form onSubmit={handleAddCategory} className="mt-3 flex flex-wrap gap-3">
          <input
            required
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
            placeholder="Category name (e.g. Starters)"
            className="flex-1 min-w-[200px] rounded-lg border border-[#E3E8E1] px-3 py-2.5 text-sm text-[#1C1F1A] placeholder-[#9CA396] focus:border-eco focus:outline-none focus:ring-1 focus:ring-eco"
          />
          <input
            type="number"
            value={newCatOrder}
            onChange={(e) => setNewCatOrder(e.target.value)}
            placeholder="Order"
            className="w-24 rounded-lg border border-[#E3E8E1] px-3 py-2.5 text-sm text-[#1C1F1A] focus:border-eco focus:outline-none focus:ring-1 focus:ring-eco"
          />
          <button
            type="submit"
            disabled={addingCat}
            className="rounded-lg bg-eco px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-eco-dark disabled:opacity-50 transition-colors"
          >
            {addingCat ? "Adding..." : "Add Category"}
          </button>
        </form>
      </div>

      {/* Categories & Items */}
      <div className="mt-6 space-y-6">
        {categories.length === 0 && (
          <div className="rounded-xl border border-[#E3E8E1] bg-white py-12 text-center text-sm text-[#6B7366]">
            No categories yet. Add one above to get started.
          </div>
        )}

        {categories
          .sort((a, b) => a.display_order - b.display_order)
          .map((cat) => (
            <div
              key={cat.id}
              className="rounded-xl border border-[#E3E8E1] bg-white shadow-sm"
            >
              {/* Category Header */}
              <div className="flex items-center justify-between border-b border-[#E3E8E1]/50 px-6 py-4">
                {editingCatId === cat.id ? (
                  <div className="flex flex-1 flex-wrap gap-2">
                    <input
                      value={editCatName}
                      onChange={(e) => setEditCatName(e.target.value)}
                      className="flex-1 min-w-[150px] rounded-lg border border-[#E3E8E1] px-3 py-1.5 text-sm focus:border-eco focus:outline-none focus:ring-1 focus:ring-eco"
                    />
                    <input
                      type="number"
                      value={editCatOrder}
                      onChange={(e) => setEditCatOrder(e.target.value)}
                      className="w-20 rounded-lg border border-[#E3E8E1] px-3 py-1.5 text-sm focus:border-eco focus:outline-none focus:ring-1 focus:ring-eco"
                      title="Display order"
                    />
                    <button
                      onClick={() => handleUpdateCategory(cat.id)}
                      className="rounded-lg bg-eco px-3 py-1.5 text-sm font-medium text-white hover:bg-eco-dark"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingCatId(null)}
                      className="rounded-lg border border-[#E3E8E1] px-3 py-1.5 text-sm font-medium text-[#3A3D37] hover:bg-[#F4F6F3]"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <>
                    <div>
                      <h3 className="text-base font-semibold text-[#1C1F1A]">{cat.name}</h3>
                      <p className="text-xs text-[#9CA396]">
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
                        className="rounded px-2 py-1 text-xs font-medium text-[#6B7366] hover:bg-[#F0F3EF]"
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
                {(cat.items || [])
                  .sort((a, b) => a.display_order - b.display_order)
                  .map((item) => (
                    <div key={item.id} className="px-6 py-3">
                      {editingItemId === item.id ? (
                        <div className="flex flex-wrap gap-2">
                          <input
                            value={editItemName}
                            onChange={(e) => setEditItemName(e.target.value)}
                            placeholder="Item name"
                            className="flex-1 min-w-[150px] rounded-lg border border-[#E3E8E1] px-3 py-1.5 text-sm focus:border-eco focus:outline-none focus:ring-1 focus:ring-eco"
                          />
                          <input
                            type="number"
                            value={editItemQty}
                            onChange={(e) => setEditItemQty(e.target.value)}
                            placeholder="Qty"
                            className="w-24 rounded-lg border border-[#E3E8E1] px-3 py-1.5 text-sm focus:border-eco focus:outline-none focus:ring-1 focus:ring-eco"
                            title="Total quantity"
                          />
                          <input
                            type="number"
                            value={editItemOrder}
                            onChange={(e) => setEditItemOrder(e.target.value)}
                            placeholder="Order"
                            className="w-20 rounded-lg border border-[#E3E8E1] px-3 py-1.5 text-sm focus:border-eco focus:outline-none focus:ring-1 focus:ring-eco"
                            title="Display order"
                          />
                          <button
                            onClick={() => handleUpdateItem(item.id)}
                            className="rounded-lg bg-eco px-3 py-1.5 text-sm font-medium text-white hover:bg-eco-dark"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingItemId(null)}
                            className="rounded-lg border border-[#E3E8E1] px-3 py-1.5 text-sm font-medium text-[#3A3D37] hover:bg-[#F4F6F3]"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-sm text-[#1C1F1A]">{item.name}</span>
                            <span className="ml-3 text-xs text-[#9CA396]">
                              Qty: {item.total_quantity}
                            </span>
                            <span className="ml-2 text-xs text-[#C5C9C2]">
                              (#{item.display_order})
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setEditingItemId(item.id);
                                setEditItemName(item.name);
                                setEditItemQty(String(item.total_quantity));
                                setEditItemOrder(String(item.display_order));
                              }}
                              className="rounded px-2 py-1 text-xs font-medium text-[#6B7366] hover:bg-[#F0F3EF]"
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
              <div className="border-t border-[#E3E8E1]/50 px-6 py-3">
                {addingItemCatId === cat.id ? (
                  <div className="flex flex-wrap gap-2">
                    <input
                      value={newItemName}
                      onChange={(e) => setNewItemName(e.target.value)}
                      placeholder="Item name"
                      className="flex-1 min-w-[150px] rounded-lg border border-[#E3E8E1] px-3 py-1.5 text-sm placeholder-[#9CA396] focus:border-eco focus:outline-none focus:ring-1 focus:ring-eco"
                    />
                    <input
                      type="number"
                      value={newItemQty}
                      onChange={(e) => setNewItemQty(e.target.value)}
                      placeholder="Total qty"
                      className="w-28 rounded-lg border border-[#E3E8E1] px-3 py-1.5 text-sm focus:border-eco focus:outline-none focus:ring-1 focus:ring-eco"
                    />
                    <button
                      onClick={() => handleAddItem(cat.id)}
                      disabled={addingItem || !newItemName}
                      className="rounded-lg bg-eco px-3 py-1.5 text-sm font-medium text-white hover:bg-eco-dark disabled:opacity-50"
                    >
                      {addingItem ? "Adding..." : "Add"}
                    </button>
                    <button
                      onClick={() => {
                        setAddingItemCatId(null);
                        setNewItemName("");
                        setNewItemQty("100");
                      }}
                      className="rounded-lg border border-[#E3E8E1] px-3 py-1.5 text-sm font-medium text-[#3A3D37] hover:bg-[#F4F6F3]"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setAddingItemCatId(cat.id)}
                    className="text-sm font-medium text-eco hover:text-eco-dark transition-colors"
                  >
                    + Add Item
                  </button>
                )}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
