"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";

interface MenuItem {
  id: string;
  name: string;
  price: number;
  total_quantity: number;
  is_available: boolean;
  category_id: string;
}

interface Category {
  id: string;
  name: string;
  display_order: number;
  items: MenuItem[];
}

interface MenuResponse {
  categories: Category[];
}

export default function MenuBuilderPage() {
  const params = useParams();
  const venueId = params.id as string;

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // New category form
  const [newCategoryName, setNewCategoryName] = useState("");
  const [addingCategory, setAddingCategory] = useState(false);

  // New item form per category
  const [itemForms, setItemForms] = useState<
    Record<string, { name: string; price: string; stock: string }>
  >({});
  const [addingItem, setAddingItem] = useState<string | null>(null);

  // Inline editing
  const [editingStock, setEditingStock] = useState<string | null>(null);
  const [editStockValue, setEditStockValue] = useState("");

  useEffect(() => {
    fetchMenu();
  }, [venueId]);

  async function fetchMenu() {
    try {
      const data = await api.get<MenuResponse>(
        `/api/venues/${venueId}/menu/manage`
      );
      setCategories(data.categories);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load menu");
    } finally {
      setLoading(false);
    }
  }

  async function handleAddCategory(e: React.FormEvent) {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    setAddingCategory(true);
    setError("");

    try {
      const created = await api.post<Category>(
        `/api/venues/${venueId}/menu/categories`,
        { name: newCategoryName.trim() }
      );
      setCategories((prev) => [...prev, { ...created, items: created.items || [] }]);
      setNewCategoryName("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create category"
      );
    } finally {
      setAddingCategory(false);
    }
  }

  function openItemForm(categoryId: string) {
    setItemForms((prev) => ({
      ...prev,
      [categoryId]: { name: "", price: "", stock: "" },
    }));
  }

  function updateItemForm(
    categoryId: string,
    field: "name" | "price" | "stock",
    value: string
  ) {
    setItemForms((prev) => ({
      ...prev,
      [categoryId]: { ...prev[categoryId], [field]: value },
    }));
  }

  function closeItemForm(categoryId: string) {
    setItemForms((prev) => {
      const copy = { ...prev };
      delete copy[categoryId];
      return copy;
    });
  }

  async function handleAddItem(categoryId: string) {
    const form = itemForms[categoryId];
    if (!form || !form.name.trim() || !form.price) return;
    setAddingItem(categoryId);
    setError("");

    try {
      const item = await api.post<MenuItem>(
        `/api/venues/${venueId}/menu/items`,
        {
          name: form.name.trim(),
          price: parseFloat(form.price),
          total_quantity: form.stock ? parseInt(form.stock, 10) : 0,
          category_id: categoryId,
          is_available: true,
        }
      );
      setCategories((prev) =>
        prev.map((cat) =>
          cat.id === categoryId
            ? { ...cat, items: [...cat.items, item] }
            : cat
        )
      );
      closeItemForm(categoryId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add item");
    } finally {
      setAddingItem(null);
    }
  }

  async function toggleAvailability(categoryId: string, item: MenuItem) {
    setError("");
    try {
      const updated = await api.put<MenuItem>(
        `/api/venues/${venueId}/menu/items/${item.id}`,
        { is_available: !item.is_available }
      );
      setCategories((prev) =>
        prev.map((cat) =>
          cat.id === categoryId
            ? {
                ...cat,
                items: cat.items.map((i) =>
                  i.id === item.id ? { ...i, is_available: updated.is_available } : i
                ),
              }
            : cat
        )
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update availability"
      );
    }
  }

  async function handleStockSave(categoryId: string, itemId: string) {
    setError("");
    try {
      const updated = await api.put<MenuItem>(
        `/api/venues/${venueId}/menu/items/${itemId}`,
        { total_quantity: parseInt(editStockValue, 10) }
      );
      setCategories((prev) =>
        prev.map((cat) =>
          cat.id === categoryId
            ? {
                ...cat,
                items: cat.items.map((i) =>
                  i.id === itemId
                    ? { ...i, total_quantity: updated.total_quantity }
                    : i
                ),
              }
            : cat
        )
      );
      setEditingStock(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update stock"
      );
    }
  }

  function formatPrice(amount: number): string {
    return new Intl.NumberFormat("en-NG").format(amount);
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="text-sm font-medium text-gray-500 hover:text-gray-700"
            >
              Dashboard
            </Link>
            <span className="text-gray-300">/</span>
            <Link
              href={`/dashboard/venues/${venueId}`}
              className="text-sm font-medium text-gray-500 hover:text-gray-700"
            >
              Venue
            </Link>
            <span className="text-gray-300">/</span>
            <span className="text-sm font-semibold text-gray-900">Menu</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <h1 className="mb-1 text-2xl font-bold text-gray-900">Menu Builder</h1>
        <p className="mb-8 text-sm text-gray-500">
          Add categories and drink items with pricing and stock quantities.
        </p>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Add Category */}
        <div className="mb-8 rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-base font-semibold text-gray-900">
            Add Category
          </h2>
          <form
            onSubmit={handleAddCategory}
            className="flex flex-col gap-3 sm:flex-row sm:items-end"
          >
            <div className="flex-1">
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Category Name
              </label>
              <input
                type="text"
                required
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="e.g. Spirits, Cocktails, Beer"
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
            <button
              type="submit"
              disabled={addingCategory}
              className="rounded-lg bg-emerald-500 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-600 disabled:opacity-50"
            >
              {addingCategory ? "Adding..." : "Add Category"}
            </button>
          </form>
        </div>

        {/* Categories & Items */}
        {categories.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white px-6 py-12 text-center">
            <p className="text-sm text-gray-500">
              No categories yet. Add a category above to get started.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {categories.map((category) => (
              <div
                key={category.id}
                className="rounded-xl border border-gray-200 bg-white"
              >
                {/* Category Header */}
                <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {category.name}
                  </h3>
                  <span className="text-xs font-medium text-gray-400">
                    {category.items.length}{" "}
                    {category.items.length === 1 ? "item" : "items"}
                  </span>
                </div>

                {/* Items */}
                <div className="divide-y divide-gray-50">
                  {category.items.map((item) => (
                    <div
                      key={item.id}
                      className={`flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between ${
                        !item.is_available ? "opacity-60" : ""
                      }`}
                    >
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{item.name}</p>
                        <p className="mt-0.5 text-sm text-emerald-600 font-semibold">
                          {"\u20A6"}{formatPrice(item.price)}
                        </p>
                      </div>

                      <div className="flex items-center gap-4">
                        {/* Stock */}
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">Stock:</span>
                          {editingStock === item.id ? (
                            <div className="flex items-center gap-1">
                              <input
                                type="number"
                                min={0}
                                value={editStockValue}
                                onChange={(e) =>
                                  setEditStockValue(e.target.value)
                                }
                                className="w-20 rounded border border-gray-300 px-2 py-1 text-sm text-gray-900 outline-none focus:border-emerald-500"
                              />
                              <button
                                onClick={() =>
                                  handleStockSave(category.id, item.id)
                                }
                                className="rounded bg-emerald-500 px-2 py-1 text-xs font-medium text-white hover:bg-emerald-600"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => setEditingStock(null)}
                                className="rounded px-2 py-1 text-xs font-medium text-gray-500 hover:text-gray-700"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setEditingStock(item.id);
                                setEditStockValue(
                                  item.total_quantity.toString()
                                );
                              }}
                              className="rounded bg-gray-100 px-2.5 py-1 text-sm font-medium text-gray-700 hover:bg-gray-200"
                            >
                              {item.total_quantity}
                            </button>
                          )}
                        </div>

                        {/* Availability toggle */}
                        <button
                          onClick={() =>
                            toggleAvailability(category.id, item)
                          }
                          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                            item.is_available ? "bg-emerald-500" : "bg-gray-300"
                          }`}
                          role="switch"
                          aria-checked={item.is_available}
                          aria-label={`Toggle availability for ${item.name}`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition-transform ${
                              item.is_available
                                ? "translate-x-5"
                                : "translate-x-0"
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add Item Form */}
                <div className="border-t border-gray-100 px-6 py-4">
                  {itemForms[category.id] ? (
                    <div className="space-y-3">
                      <div className="grid gap-3 sm:grid-cols-3">
                        <input
                          type="text"
                          placeholder="Item name"
                          value={itemForms[category.id].name}
                          onChange={(e) =>
                            updateItemForm(category.id, "name", e.target.value)
                          }
                          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                        />
                        <input
                          type="number"
                          placeholder="Price (NGN)"
                          min={0}
                          step="0.01"
                          value={itemForms[category.id].price}
                          onChange={(e) =>
                            updateItemForm(category.id, "price", e.target.value)
                          }
                          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                        />
                        <input
                          type="number"
                          placeholder="Stock quantity"
                          min={0}
                          value={itemForms[category.id].stock}
                          onChange={(e) =>
                            updateItemForm(category.id, "stock", e.target.value)
                          }
                          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleAddItem(category.id)}
                          disabled={addingItem === category.id}
                          className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-600 disabled:opacity-50"
                        >
                          {addingItem === category.id
                            ? "Adding..."
                            : "Add Item"}
                        </button>
                        <button
                          onClick={() => closeItemForm(category.id)}
                          className="rounded-lg px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => openItemForm(category.id)}
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600 hover:text-emerald-700"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                      Add Item
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
