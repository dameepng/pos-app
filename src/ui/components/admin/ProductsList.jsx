"use client";

import { ChevronLeft, ChevronRight, Package } from "lucide-react";

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
  onEdit,
  onToggleStatus,
}) {
  const canPrev = skip > 0;
  const canNext = skip + take < total;

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
          items.map((p) => (
            <div
              key={p.id}
              className="p-4 hover:bg-zinc-50/50 transition flex items-center justify-between gap-4 group"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
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
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
