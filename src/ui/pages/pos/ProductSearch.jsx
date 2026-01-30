"use client";

import { useEffect, useMemo, useState } from "react";

function formatRp(n) {
  return `Rp ${Number(n || 0).toLocaleString("id-ID")}`;
}

export default function ProductSearch({ onSelect }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const canSearch = useMemo(() => query.trim().length >= 2, [query]);

  useEffect(() => {
    let active = true;

    async function run() {
      if (!canSearch) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        const res = await fetch(`/api/products/search?q=${encodeURIComponent(query.trim())}`);
        const json = await res.json();
        if (!active) return;
        setResults(json.data || []);
      } finally {
        if (active) setLoading(false);
      }
    }

    const t = setTimeout(run, 250);
    return () => {
      active = false;
      clearTimeout(t);
    };
  }, [query, canSearch]);

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
          {canSearch ? (
            loading ? (
              "Loading..."
            ) : (
              `${results.length} produk`
            )
          ) : (
            "Ketik minimal 2 huruf"
          )}
        </div>
      </div>

      <div className="mt-4">
        {!canSearch ? (
          <div className="rounded-xl border bg-zinc-50 p-4 text-sm text-zinc-600">
            Mulai ketik untuk menampilkan produk.
          </div>
        ) : loading ? (
          <div className="rounded-xl border bg-zinc-50 p-4 text-sm text-zinc-600">
            Memuat data...
          </div>
        ) : results.length === 0 ? (
          <div className="rounded-xl border bg-zinc-50 p-4 text-sm text-zinc-600">
            Produk tidak ditemukan.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
            {results.map((p) => (
              <button
                key={p.id}
                onClick={() => onSelect(p)}
                className="group text-left rounded-2xl border bg-white p-3 hover:shadow-sm transition"
              >
                <div className="aspect-[4/3] rounded-xl bg-gradient-to-br from-zinc-100 to-zinc-200 flex items-center justify-center text-xs text-zinc-600">
                  {p.sku ? p.sku : "SKU"}
                </div>

                <div className="mt-3 space-y-1">
                  <div className="font-medium leading-snug line-clamp-2">
                    {p.name}
                  </div>
                  <div className="text-sm text-zinc-700">{formatRp(p.price)}</div>
                  <div className="text-xs text-zinc-500 group-hover:text-zinc-700">
                    Klik untuk tambah
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
