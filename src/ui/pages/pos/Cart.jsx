"use client";

function formatRp(n) {
  return `Rp ${Number(n || 0).toLocaleString("id-ID")}`;
}

export default function Cart({ items, total, onSetQty, onRemove }) {
  if (!items || items.length === 0) {
    return (
      <div className="rounded-xl border bg-zinc-50 p-4 text-sm text-zinc-600">
        Cart kosong.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((it) => (
        <div key={it.id} className="rounded-xl border p-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="font-medium truncate">{it.name}</div>
              <div className="text-xs text-zinc-500">
                {formatRp(it.price)} • Subtotal{" "}
                <span className="font-semibold text-zinc-900">{formatRp(it.price * it.qty)}</span>
              </div>
            </div>

            <button
              onClick={() => onRemove(it.id)}
              className="text-xs rounded-lg border px-2 py-1 hover:bg-zinc-50"
              title="Remove"
            >
              Remove
            </button>
          </div>

          <div className="mt-3 flex items-center justify-between">
            <div className="text-xs text-zinc-500">Qty</div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onSetQty(it.id, it.qty - 1)}
                className="h-8 w-8 rounded-lg border hover:bg-zinc-50"
                title="-"
              >
                -
              </button>

              <input
                type="number"
                min={1}
                value={it.qty}
                onChange={(e) => onSetQty(it.id, Number(e.target.value))}
                className="h-8 w-16 rounded-lg border text-center text-sm"
              />

              <button
                onClick={() => onSetQty(it.id, it.qty + 1)}
                className="h-8 w-8 rounded-lg border hover:bg-zinc-50"
                title="+"
              >
                +
              </button>
            </div>
          </div>
        </div>
      ))}

      <div className="pt-2 border-t flex items-center justify-between">
        <div className="text-sm text-zinc-600">Total</div>
        <div className="text-sm font-semibold">{formatRp(total)}</div>
      </div>
    </div>
  );
}
