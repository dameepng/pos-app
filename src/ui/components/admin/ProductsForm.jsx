"use client";

import { Save, RotateCcw, PackagePlus, PencilLine } from "lucide-react";
import AdminField from "./AdminField";

export default function ProductsForm({
  mode,
  form,
  setForm,
  categories,
  busy,
  error,
  onSubmit,
  onReset,
}) {
  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm ring-1 ring-zinc-200/50">
      <div className="flex items-center gap-2 mb-6">
        <div
          className={`p-2 rounded-lg ${
            mode === "create"
              ? "bg-zinc-100 text-zinc-600"
              : "bg-blue-50 text-blue-600"
          }`}
        >
          {mode === "create" ? (
            <PackagePlus size={20} />
          ) : (
            <PencilLine size={20} />
          )}
        </div>
        <h2 className="text-lg font-bold text-zinc-900 tracking-tight">
          {mode === "create" ? "New Product" : "Edit Product"}
        </h2>
      </div>

      <div className="space-y-4">
        <AdminField label="Product Name">
          <input
            className="w-full rounded-xl border border-zinc-200 px-3 py-2.5 text-sm focus:ring-2 focus:ring-zinc-900 outline-none transition"
            placeholder="Mineral Water 500ml"
            value={form.name}
            onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
            disabled={busy}
          />
        </AdminField>

        <div className="grid grid-cols-2 gap-4">
          <AdminField label="SKU">
            <input
              className="w-full rounded-xl border border-zinc-200 px-3 py-2.5 text-sm focus:ring-2 focus:ring-zinc-900 outline-none transition"
              placeholder="SKU-XXX"
              value={form.sku}
              onChange={(e) => setForm((s) => ({ ...s, sku: e.target.value }))}
              disabled={busy}
            />
          </AdminField>
          <AdminField label="Barcode">
            <input
              className="w-full rounded-xl border border-zinc-200 px-3 py-2.5 text-sm focus:ring-2 focus:ring-zinc-900 outline-none transition"
              placeholder="899..."
              value={form.barcode}
              onChange={(e) =>
                setForm((s) => ({ ...s, barcode: e.target.value }))
              }
              disabled={busy}
            />
          </AdminField>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <AdminField label="Selling Price">
            <input
              type="number"
              className="w-full rounded-xl border border-zinc-200 px-3 py-2.5 text-sm focus:ring-2 focus:ring-zinc-900 outline-none transition"
              placeholder="0"
              value={form.price}
              onChange={(e) =>
                setForm((s) => ({ ...s, price: e.target.value }))
              }
              disabled={busy}
            />
          </AdminField>
          <AdminField label="Capital Cost">
            <input
              type="number"
              className="w-full rounded-xl border border-zinc-200 px-3 py-2.5 text-sm focus:ring-2 focus:ring-zinc-900 outline-none transition"
              placeholder="0"
              value={form.cost}
              onChange={(e) => setForm((s) => ({ ...s, cost: e.target.value }))}
              disabled={busy}
            />
          </AdminField>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <AdminField label="Stock Level">
            <input
              type="number"
              className="w-full rounded-xl border border-zinc-200 px-3 py-2.5 text-sm focus:ring-2 focus:ring-zinc-900 outline-none transition"
              placeholder="0"
              value={form.qtyOnHand}
              onChange={(e) =>
                setForm((s) => ({ ...s, qtyOnHand: e.target.value }))
              }
              disabled={busy}
            />
          </AdminField>

          <AdminField label="Category">
            <select
              className="w-full rounded-xl border border-zinc-200 px-3 py-2.5 text-sm focus:ring-2 focus:ring-zinc-900 outline-none transition bg-white"
              value={form.categoryId || ""}
              onChange={(e) =>
                setForm((s) => ({ ...s, categoryId: e.target.value }))
              }
              disabled={busy}
            >
              <option value="">(None)</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </AdminField>
        </div>

        <label className="flex items-center gap-3 p-3 rounded-xl border border-zinc-100 bg-zinc-50/50 cursor-pointer hover:bg-zinc-50 transition">
          <input
            type="checkbox"
            className="w-4 h-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"
            checked={!!form.isActive}
            onChange={(e) =>
              setForm((s) => ({ ...s, isActive: e.target.checked }))
            }
            disabled={busy}
          />
          <span className="text-sm font-medium text-zinc-700">
            Display in POS
          </span>
        </label>

        <div className="flex gap-3 pt-2">
          <button
            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-zinc-900 px-4 py-3 text-sm font-bold text-white hover:bg-zinc-800 disabled:opacity-50 transition shadow-sm shadow-zinc-200"
            onClick={onSubmit}
            disabled={busy}
          >
            <Save size={18} />
            {mode === "create" ? "Save Product" : "Update Product"}
          </button>

          <button
            className="flex items-center justify-center gap-2 rounded-xl border border-zinc-200 px-4 py-3 text-sm font-medium text-zinc-600 hover:bg-zinc-50 disabled:opacity-50 transition"
            onClick={onReset}
            disabled={busy}
          >
            <RotateCcw size={18} />
          </button>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-700">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
