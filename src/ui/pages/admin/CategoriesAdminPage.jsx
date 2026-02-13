"use client";

import { useEffect, useState } from "react";

export default function CategoriesAdminPage() {
  const [items, setItems] = useState([]);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  async function load() {
    setError(null);
    const res = await fetch("/api/admin/categories");
    const json = await res.json();
    if (!res.ok) throw new Error(json.error?.message || "Failed load categories");
    setItems(json.data || []);
  }

  useEffect(() => {
    load().catch((e) => setError(e.message));
  }, []);

  async function createCategory() {
    const n = name.trim();
    if (!n) return;

    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: n }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || "Failed create");
      setName("");
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function renameCategory(id, current) {
    const next = prompt("Rename category:", current);
    if (!next) return;

    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: next }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || "Failed update");
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function deleteCategory(id) {
    if (!confirm("Delete category? (akan gagal kalau masih dipakai product)")) return;

    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || "Failed delete");
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold">Categories</h1>
        <p className="mt-1 text-sm text-zinc-600">CRUD kategori produk.</p>

        <div className="mt-4 flex gap-2">
          <input
            className="w-full max-w-sm rounded-xl border px-3 py-2 text-sm"
            placeholder="Nama kategori..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={busy}
          />
          <button
            className="rounded-xl bg-zinc-900 px-4 py-2 text-sm text-white hover:bg-zinc-800 disabled:opacity-50"
            onClick={createCategory}
            disabled={busy}
          >
            Add
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}
      </div>

      <div className="rounded-2xl border bg-white shadow-sm">
        <div className="border-b p-4">
          <div className="text-sm font-semibold">List</div>
        </div>
        <div className="p-4 space-y-2">
          {items.length === 0 ? (
            <div className="text-sm text-zinc-600">No categories.</div>
          ) : (
            items.map((c) => (
              <div key={c.id} className="flex items-center justify-between rounded-xl border p-3">
                <div className="text-sm font-medium">{c.name}</div>
                <div className="flex gap-2">
                  <button
                    className="rounded-lg border px-3 py-1 text-sm hover:bg-zinc-50"
                    onClick={() => renameCategory(c.id, c.name)}
                    disabled={busy}
                  >
                    Edit
                  </button>
                  <button
                    className="rounded-lg border border-red-200 bg-red-50 px-3 py-1 text-sm font-medium text-red-700 hover:bg-red-100"
                    onClick={() => deleteCategory(c.id)}
                    disabled={busy}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
