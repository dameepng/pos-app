"use client";

import { ChevronLeft, ChevronRight, Package } from "lucide-react";
import Image from "next/image";

function rp(n) {
  return `Rp ${Number(n || 0).toLocaleString("id-ID")}`;
}

export default function ProductsList({
  items,
  skip,
  take,
  total,
  busy,
  onPrev,
  onNext,
  onPage,
  onEdit,
  onToggleStatus,
  onDelete,
  canDelete = false,
}) {
  const canPrev = skip > 0;
  const canNext = skip + take < total;
  const totalPages = Math.max(1, Math.ceil((total || 0) / (take || 1)));
  const currentPage = Math.max(1, Math.floor((skip || 0) / (take || 1)) + 1);

  const goToPage = (page) => {
    if (onPage) {
      const nextPage = Math.max(1, Math.min(page, totalPages));
      onPage(nextPage);
    }
  };

  return (
    <div className="rounded-2xl border bg-white shadow-sm ring-1 ring-zinc-200/50 overflow-hidden">
      <div className="border-b bg-zinc-50/50 p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Package size={16} className="text-zinc-400" />
          <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-widest">
            Master Data
          </h3>
        </div>

        <div className="flex gap-2">
          <button
            className="p-2 rounded-lg border bg-white hover:bg-zinc-50 disabled:opacity-30"
            disabled={!canPrev || busy}
            onClick={onPrev}
          >
            <ChevronLeft size={16} />
          </button>
          <button
            className="p-2 rounded-lg border bg-white hover:bg-zinc-50 disabled:opacity-30"
            disabled={!canNext || busy}
            onClick={onNext}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="divide-y divide-zinc-100">
        {items.length === 0 ? (
          <div className="p-12 text-center text-sm text-zinc-400 italic font-medium">
            No records found.
          </div>
        ) : (
          items.map((p) => {
            const isRemoteImage = String(p.imageUrl || "").startsWith("http");
            return (
            <div
              key={p.id}
              className="p-4 hover:bg-zinc-50/50 transition flex items-center justify-between gap-4 group"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <div className="h-10 w-10 rounded-lg bg-zinc-100 border border-zinc-200 overflow-hidden flex items-center justify-center text-[10px] font-bold text-zinc-400">
                    {p.imageUrl ? (
                      <Image
                        src={p.imageUrl}
                        alt={p.name || "Product image"}
                        width={40}
                        height={40}
                        sizes="40px"
                        unoptimized={isRemoteImage}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      "No Image"
                    )}
                  </div>

                  <span className="font-bold text-zinc-900 truncate">
                    {p.name}
                  </span>

                  <span
                    className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-tight ${
                      p.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-zinc-100 text-zinc-400"
                    }`}
                  >
                    {p.isActive ? "Active" : "Inactive"}
                  </span>
                </div>

                <div className="text-[11px] text-zinc-500 font-medium">
                  SKU: <span className="text-zinc-800">{p.sku || "-"}</span> •
                  Cat:{" "}
                  <span className="text-zinc-800">
                    {p.category?.name || "None"}
                  </span>
                </div>

                <div className="flex items-center gap-5 mt-3">
                  <div>
                    <span className="block text-[9px] uppercase font-bold text-zinc-400">
                      Sell Price
                    </span>
                    <span className="font-bold text-zinc-900 text-sm">
                      {rp(p.price)}
                    </span>
                  </div>

                  <div>
                    <span className="block text-[9px] uppercase font-bold text-zinc-400">
                      Capital Cost
                    </span>
                    <span className="font-bold text-zinc-900 text-sm">
                      {rp(p.cost)}
                    </span>
                  </div>

                  <div>
                    <span className="block text-[9px] uppercase font-bold text-zinc-400">
                      Stock
                    </span>
                    <span
                      className={`font-bold text-sm ${
                        (p.inventory?.qtyOnHand ?? 0) < 5
                          ? "text-red-500"
                          : "text-zinc-900"
                      }`}
                    >
                      {p.inventory?.qtyOnHand ?? 0}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  className="h-9 px-3 rounded-lg border border-zinc-200 bg-white text-xs font-bold text-zinc-700 hover:bg-zinc-100 shadow-sm transition"
                  onClick={() => onEdit(p)}
                  disabled={busy}
                >
                  Edit
                </button>

                <button
                  className={`h-9 px-3 rounded-lg border text-xs font-bold shadow-sm transition ${
                    p.isActive
                      ? "border-red-100 bg-red-50 text-red-600 hover:bg-red-100"
                      : "border-green-100 bg-green-50 text-green-600 hover:bg-green-100"
                  }`}
                  onClick={() => onToggleStatus(p)}
                  disabled={busy}
                >
                  {p.isActive ? "Disable" : "Enable"}
                </button>

                {canDelete && (
                  <button
                    className="h-9 px-3 rounded-lg border border-red-200 bg-white text-xs font-bold text-red-700 hover:bg-red-50 shadow-sm transition"
                    onClick={() => onDelete?.(p)}
                    disabled={busy}
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
            );
          })
        )}
      </div>

      <div className="border-t bg-white">
        <div className="px-4 py-3 text-sm text-zinc-600">
          Menampilkan {total === 0 ? 0 : skip + 1}-
          {Math.min(skip + take, total)} dari {total} produk
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-4 border-t">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={!canPrev || busy}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-zinc-700 bg-white border border-zinc-300 rounded-lg hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={16} />
              Sebelumnya
            </button>

            <div className="flex items-center gap-2">
              {currentPage > 3 && (
                <>
                  <button
                    onClick={() => goToPage(1)}
                    className="px-3 py-2 text-sm font-medium text-zinc-700 bg-white border border-zinc-300 rounded-lg hover:bg-zinc-50"
                  >
                    1
                  </button>
                  {currentPage > 4 && (
                    <span className="px-2 text-zinc-500">...</span>
                  )}
                </>
              )}

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((page) => {
                  return (
                    page === currentPage ||
                    page === currentPage - 1 ||
                    page === currentPage + 1 ||
                    page === currentPage - 2 ||
                    page === currentPage + 2
                  );
                })
                .map((page) => (
                  <button
                    key={page}
                    onClick={() => goToPage(page)}
                    className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      currentPage === page
                        ? "bg-blue-600 text-white"
                        : "text-zinc-700 bg-white border border-zinc-300 hover:bg-zinc-50"
                    }`}
                  >
                    {page}
                  </button>
                ))}

              {currentPage < totalPages - 2 && (
                <>
                  {currentPage < totalPages - 3 && (
                    <span className="px-2 text-zinc-500">...</span>
                  )}
                  <button
                    onClick={() => goToPage(totalPages)}
                    className="px-3 py-2 text-sm font-medium text-zinc-700 bg-white border border-zinc-300 rounded-lg hover:bg-zinc-50"
                  >
                    {totalPages}
                  </button>
                </>
              )}
            </div>

            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={!canNext || busy}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-zinc-700 bg-white border border-zinc-300 rounded-lg hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Selanjutnya
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
