"use client";

import { Search } from "lucide-react";

export default function ProductsToolbar({ q, setQ, busy }) {
  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm ring-1 ring-zinc-200/50">
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
          size={18}
        />
        <input
          className="w-full rounded-xl border border-zinc-200 pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-zinc-900 outline-none transition"
          placeholder="Search inventory..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          disabled={busy}
        />
      </div>
    </div>
  );
}
