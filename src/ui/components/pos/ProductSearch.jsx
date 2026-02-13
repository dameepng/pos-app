"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";

function formatRp(n) {
  return `Rp ${Number(n || 0).toLocaleString("id-ID")}`;
}

export default function ProductSearch({ onSelect, categoryId, refreshKey }) {
  const ITEMS_PER_PAGE = 20;
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: ITEMS_PER_PAGE,
    hasNextPage: false,
    hasPreviousPage: false,
  });
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const canSearch = useMemo(() => query.trim().length >= 2, [query]);

  useEffect(() => {
    setCurrentPage(1);
  }, [query, categoryId, refreshKey]);

  useEffect(() => {
    if (pagination.totalPages > 0 && currentPage > pagination.totalPages) {
      setCurrentPage(pagination.totalPages);
    }
  }, [pagination.totalPages, currentPage]);

  useEffect(() => {
    let active = true;

    async function run() {
      // Jika ada categoryId (termasuk null dari "Semua"), tampilkan produk
      if (categoryId !== undefined) {
        setLoading(true);
        try {
          let url;
          const baseParams = `page=${currentPage}&limit=${ITEMS_PER_PAGE}`;

          // Jika "Semua" (categoryId = null) dan tidak ada query
          if (categoryId === null && !canSearch) {
            url = `/api/products/all?${baseParams}`;
          }
          // Jika ada kategori spesifik dan tidak ada query
          else if (categoryId && !canSearch) {
            url = `/api/products/by-category?categoryId=${categoryId}&${baseParams}`;
          }
          // Jika ada query (dengan atau tanpa kategori)
          else if (canSearch) {
            url =
              `/api/products/search?q=${encodeURIComponent(query.trim())}` +
              `&${baseParams}`;
            if (categoryId) {
              url += `&categoryId=${categoryId}`;
            }
          } else {
            // Tidak ada kategori dan tidak ada query yang cukup
            setProducts([]);
            setPagination({
              currentPage: 1,
              totalPages: 1,
              totalItems: 0,
              itemsPerPage: ITEMS_PER_PAGE,
              hasNextPage: false,
              hasPreviousPage: false,
            });
            if (active) setLoading(false);
            return;
          }

          const res = await fetch(url);
          const json = await res.json();
          if (!active) return;
          setProducts(json.data || []);
          setPagination(
            json.pagination || {
              currentPage: currentPage,
              totalPages: 1,
              totalItems: 0,
              itemsPerPage: ITEMS_PER_PAGE,
              hasNextPage: false,
              hasPreviousPage: false,
            },
          );
        } finally {
          if (active) setLoading(false);
        }
        return;
      }

      // Jika tidak ada kategori dipilih dan tidak ada query cukup
      if (!canSearch) {
        setProducts([]);
        setPagination({
          currentPage: 1,
          totalPages: 1,
          totalItems: 0,
          itemsPerPage: ITEMS_PER_PAGE,
          hasNextPage: false,
          hasPreviousPage: false,
        });
        return;
      }

      // Search dengan query saja
      setLoading(true);
      try {
        const url =
          `/api/products/search?q=${encodeURIComponent(query.trim())}` +
          `&page=${currentPage}&limit=${ITEMS_PER_PAGE}`;
        const res = await fetch(url);
        const json = await res.json();
        if (!active) return;
        setProducts(json.data || []);
        setPagination(
          json.pagination || {
            currentPage: currentPage,
            totalPages: 1,
            totalItems: 0,
            itemsPerPage: ITEMS_PER_PAGE,
            hasNextPage: false,
            hasPreviousPage: false,
          },
        );
      } finally {
        if (active) setLoading(false);
      }
    }

    const t = setTimeout(run, 250);
    return () => {
      active = false;
      clearTimeout(t);
    };
  }, [query, canSearch, categoryId, refreshKey, currentPage]);

  const totalPages = pagination?.totalPages || 1;

  return (
    <div>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div className="w-full sm:max-w-sm">
          <label className="text-xs text-zinc-500">Search</label>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Contoh: teh, mie, susu..."
            className="mt-1 w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-200"
          />
        </div>

        <div className="text-xs text-zinc-500">
          {canSearch
            ? loading
              ? "Loading..."
              : `${pagination.totalItems} produk | Halaman ${currentPage}/${totalPages}`
            : categoryId !== undefined
              ? loading
                ? "Loading..."
                : `${pagination.totalItems} produk | Halaman ${currentPage}/${totalPages}`
              : "Ketik minimal 2 huruf atau pilih kategori"}
        </div>
      </div>

      <div className="mt-4">
        {!canSearch && categoryId === undefined ? (
          <div className="rounded-xl border bg-zinc-50 p-4 text-sm text-zinc-600">
            Pilih kategori atau ketik untuk menampilkan produk.
          </div>
        ) : loading ? (
          <div className="rounded-xl border bg-zinc-50 p-4 text-sm text-zinc-600">
            Memuat data...
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-xl border bg-zinc-50 p-4 text-sm text-zinc-600">
            Produk tidak ditemukan.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {products.map((p) => {
                const stock = p.qtyOnHand ?? 0;
                const isLowStock = stock > 0 && stock <= 10;
                const isOutOfStock = stock === 0;
                const isRemoteImage = String(p.imageUrl || "").startsWith("http");

                return (
                  <button
                    key={p.id}
                    onClick={() => onSelect(p)}
                    disabled={isOutOfStock}
                    className={`group text-left rounded-2xl border bg-white p-3 hover:shadow-sm transition ${
                      isOutOfStock ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    <div className="relative aspect-[4/3] rounded-xl bg-gradient-to-br from-zinc-100 to-zinc-200 flex items-center justify-center text-xs text-zinc-600 overflow-hidden">
                      {p.imageUrl ? (
                        <Image
                          src={p.imageUrl}
                          alt={p.name || "Product image"}
                          fill
                          sizes="(max-width: 768px) 50vw, 25vw"
                          unoptimized={isRemoteImage}
                          className="object-cover"
                        />
                      ) : (
                        p.sku || "SKU"
                      )}
                    </div>

                    <div className="mt-3 space-y-1">
                      <div className="font-medium leading-snug line-clamp-2">
                        {p.name}
                      </div>
                      <div className="text-sm text-zinc-700">
                        {formatRp(p.price)}
                      </div>

                      <div
                        className={`text-xs font-medium ${
                          isOutOfStock
                            ? "text-red-600"
                            : isLowStock
                              ? "text-orange-600"
                              : "text-emerald-600"
                        }`}
                      >
                        Stock: {stock}
                        {isOutOfStock && " (Habis)"}
                        {isLowStock && " (Menipis)"}
                      </div>

                      <div className="text-xs text-zinc-500 group-hover:text-zinc-700">
                        {isOutOfStock ? "Stok habis" : "Klik untuk tambah"}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {totalPages > 1 && (
              <div className="mt-4 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                  disabled={!pagination.hasPreviousPage}
                  className="flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={16} />
                  Sebelumnya
                </button>

                <div className="flex items-center gap-1 text-sm">
                  {currentPage > 3 && (
                    <>
                      <button
                        type="button"
                        onClick={() => setCurrentPage(1)}
                        className="h-8 min-w-8 rounded-md border bg-white px-2 text-zinc-700"
                      >
                        1
                      </button>
                      {currentPage > 4 && (
                        <span className="px-1 text-zinc-500">...</span>
                      )}
                    </>
                  )}

                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(
                      (page) =>
                        page === currentPage ||
                        page === currentPage - 1 ||
                        page === currentPage + 1 ||
                        page === currentPage - 2 ||
                        page === currentPage + 2,
                    )
                    .map((page) => (
                      <button
                        key={page}
                        type="button"
                        onClick={() => setCurrentPage(page)}
                        className={`h-8 min-w-8 rounded-md px-2 ${
                          currentPage === page
                            ? "bg-zinc-900 text-white"
                            : "border bg-white text-zinc-700"
                        }`}
                      >
                        {page}
                      </button>
                    ))}

                  {currentPage < totalPages - 2 && (
                    <>
                      {currentPage < totalPages - 3 && (
                        <span className="px-1 text-zinc-500">...</span>
                      )}
                      <button
                        type="button"
                        onClick={() => setCurrentPage(totalPages)}
                        className="h-8 min-w-8 rounded-md border bg-white px-2 text-zinc-700"
                      >
                        {totalPages}
                      </button>
                    </>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage((page) => Math.min(totalPages, page + 1))
                  }
                  disabled={!pagination.hasNextPage}
                  className="flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Selanjutnya
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
