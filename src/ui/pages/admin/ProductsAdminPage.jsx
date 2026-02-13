"use client";

import { useEffect, useMemo, useState } from "react";
import ProductsForm from "@/ui/components/admin/ProductsForm";
import ProductsToolbar from "@/ui/components/admin/ProductsToolbar";
import ProductsList from "@/ui/components/admin/ProductsList";

export default function ProductsAdminPage() {
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [filters, setFilters] = useState({
    status: "",
    categoryId: "",
    stock: "",
  });
  const [showFilters, setShowFilters] = useState(false);
  const [data, setData] = useState({ items: [], total: 0, take: 10, skip: 0 });
  const [categories, setCategories] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState(null);

  const [form, setForm] = useState({
    id: null,
    name: "",
    sku: "",
    barcode: "",
    price: "",
    cost: "",
    qtyOnHand: "",
    categoryId: "",
    imageUrl: "",
    isActive: true,
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState("");

  const mode = useMemo(() => (form.id ? "edit" : "create"), [form.id]);
  const isOwner = role === "OWNER";

  useEffect(() => {
    const loadMe = async () => {
      try {
        const res = await fetch("/api/auth/me");
        const json = await res.json();
        if (res.ok) setRole(json?.data?.role || null);
      } catch {
        setRole(null);
      }
    };

    loadMe();
  }, []);

  async function loadCategories() {
    try {
      const res = await fetch("/api/admin/categories");
      const json = await res.json();
      if (!res.ok)
        throw new Error(json.error?.message || "Failed load categories");
      setCategories(json.data || []);
    } catch (e) {
      setError(e.message);
    }
  }

  async function loadProducts({ page = currentPage } = {}) {
    setError(null);
    const params = new URLSearchParams();
    if (debouncedQ.trim()) params.set("q", debouncedQ.trim());
    params.set("take", String(itemsPerPage));
    params.set("skip", String((page - 1) * itemsPerPage));
    if (filters.status) params.set("status", filters.status);
    if (filters.categoryId) params.set("categoryId", filters.categoryId);
    if (filters.stock) params.set("stock", filters.stock);

    try {
      setLoading(true);
      const res = await fetch(`/api/admin/products?${params.toString()}`);
      const json = await res.json();
      if (!res.ok)
        throw new Error(json.error?.message || "Failed load products");
      setData(json.data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedQ(q);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    loadProducts({ page: currentPage });
  }, [currentPage, itemsPerPage, filters, debouncedQ]);

  function handleSearch(value) {
    setQ(value);
    setCurrentPage(1);
  }

  function handleItemsPerPageChange(e) {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  }

  function handleFilterChange(key, value) {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  }

  function clearFilters() {
    setFilters({ status: "", categoryId: "", stock: "" });
    setCurrentPage(1);
  }

  const hasActiveFilters = Object.values(filters).some((v) => v !== "");

  function resetForm() {
    setForm({
      id: null,
      name: "",
      sku: "",
      barcode: "",
      price: "",
      cost: "",
      qtyOnHand: "",
      categoryId: "",
      imageUrl: "",
      isActive: true,
    });
    setImageFile(null);
  }

  async function uploadProductImage(productId, file) {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch(`/api/admin/products/${productId}/image`, {
      method: "POST",
      body: fd,
    });
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.error?.message || "Failed upload image");
    }
    return json.data;
  }

  async function submit() {
    setBusy(true);
    setError(null);
    try {
      const payload = {
        name: form.name,
        sku: form.sku || null,
        barcode: form.barcode || null,
        price: Number(form.price) || 0,
        cost: Number(form.cost) || 0,
        qtyOnHand: Number(form.qtyOnHand) || 0,
        categoryId: form.categoryId || null,
        isActive: !!form.isActive,
      };

      const res = await fetch(
        form.id ? `/api/admin/products/${form.id}` : "/api/admin/products",
        {
          method: form.id ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || "Failed save");
      const saved = json.data;

      if (imageFile) {
        await uploadProductImage(saved.id, imageFile);
      }

      resetForm();
      await loadProducts({ page: 1 });
      setCurrentPage(1);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function edit(p) {
    setForm({
      id: p.id,
      name: p.name || "",
      sku: p.sku || "",
      barcode: p.barcode || "",
      price: p.price || "",
      cost: p.cost || "",
      qtyOnHand: p.inventory?.qtyOnHand || "",
      categoryId: p.categoryId || "",
      imageUrl: p.imageUrl || "",
      isActive: p.isActive !== false,
    });
    setImageFile(null);
  }

  async function toggleStatus(p) {
    const actionText = p.isActive ? "Nonaktifkan" : "Aktifkan";
    if (!confirm(`${actionText} product ini?`)) return;

    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/products/${p.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !p.isActive }),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok)
        throw new Error(json.error?.message || `Failed to ${actionText}`);

      await loadProducts({ page: currentPage });
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function deleteProduct(p) {
    if (!confirm(`Delete product "${p.name}"?`)) return;

    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/products/${p.id}`, {
        method: "DELETE",
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error?.message || "Failed delete product");

      const isLastItemInPage = (data.items?.length || 0) <= 1;
      const nextPage = isLastItemInPage && currentPage > 1 ? currentPage - 1 : currentPage;
      await loadProducts({ page: nextPage });
      if (nextPage !== currentPage) setCurrentPage(nextPage);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    if (!imageFile) {
      setImagePreviewUrl("");
      return;
    }
    const nextUrl = URL.createObjectURL(imageFile);
    setImagePreviewUrl(nextUrl);
    return () => URL.revokeObjectURL(nextUrl);
  }, [imageFile]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1 space-y-4">
        <ProductsForm
          mode={mode}
          form={form}
          setForm={setForm}
          categories={categories}
          busy={busy}
          error={error}
          imageFile={imageFile}
          imagePreviewUrl={imagePreviewUrl}
          onImageChange={setImageFile}
          onSubmit={submit}
          onReset={resetForm}
        />
      </div>

      <div className="lg:col-span-2 space-y-4">
        <ProductsToolbar q={q} setQ={handleSearch} busy={busy} />

        <div className="flex flex-wrap items-center justify-between gap-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-zinc-700 bg-white border border-zinc-300 rounded-lg hover:bg-zinc-50 transition-colors"
          >
            Filter
            {hasActiveFilters && (
              <span className="ml-1 px-2 py-0.5 text-xs bg-blue-600 text-white rounded-full">
                {Object.values(filters).filter((v) => v !== "").length}
              </span>
            )}
          </button>

          <div className="flex items-center gap-2">
            <label htmlFor="itemsPerPage" className="text-sm text-zinc-600">
              Tampilkan:
            </label>
            <select
              id="itemsPerPage"
              value={itemsPerPage}
              onChange={handleItemsPerPageChange}
              className="px-3 py-1.5 text-sm border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <span className="text-sm text-zinc-600">per halaman</span>
          </div>
        </div>

        {showFilters && (
          <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-zinc-900">
                Filter Produk
              </h3>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-red-600 hover:text-red-700"
                >
                  Clear All
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1">
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange("status", e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Semua Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1">
                  Kategori
                </label>
                <select
                  value={filters.categoryId}
                  onChange={(e) =>
                    handleFilterChange("categoryId", e.target.value)
                  }
                  className="w-full px-3 py-2 text-sm border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Semua Kategori</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1">
                  Stok
                </label>
                <select
                  value={filters.stock}
                  onChange={(e) => handleFilterChange("stock", e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Semua</option>
                  <option value="low">Stok Rendah (&lt; 5)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        <ProductsList
          items={data.items}
          skip={data.skip}
          take={data.take || itemsPerPage}
          total={data.total}
          busy={busy || loading}
          onPage={(page) => setCurrentPage(page)}
          onPrev={() => setCurrentPage((page) => Math.max(1, page - 1))}
          onNext={() => setCurrentPage((page) => page + 1)}
          onEdit={edit}
          onToggleStatus={toggleStatus}
          onDelete={deleteProduct}
          canDelete={isOwner}
        />
      </div>
    </div>
  );
}
