"use client";

import { useEffect, useRef, useState } from "react";

function formatRp(n) {
  return `Rp ${Number(n || 0).toLocaleString("id-ID")}`;
}

export default function Cart({ items, total, onSetQty, onRemove }) {
  const [draftQtys, setDraftQtys] = useState({});
  const commitTimersRef = useRef({});

  useEffect(() => {
    setDraftQtys((prev) => {
      const next = {};
      items.forEach((it) => {
        const prevVal = prev[it.id];
        if (prevVal == null || prevVal === String(it.qty)) {
          next[it.id] = String(it.qty);
        } else {
          next[it.id] = prevVal;
        }
      });
      return next;
    });
  }, [items]);

  function clearCommitTimer(itemId) {
    const timers = commitTimersRef.current;
    if (timers[itemId]) {
      clearTimeout(timers[itemId]);
      delete timers[itemId];
    }
  }

  function commitQty(item, rawValue) {
    clearCommitTimer(item.id);
    const parsed = Number.parseInt(rawValue, 10);
    if (!Number.isFinite(parsed) || parsed < 1) {
      setDraftQtys((prev) => ({ ...prev, [item.id]: String(item.qty) }));
      return;
    }
    if (parsed !== item.qty) {
      onSetQty(item.id, parsed);
    }
    setDraftQtys((prev) => ({ ...prev, [item.id]: String(parsed) }));
  }

  function scheduleAutoCommit(item, rawValue) {
    clearCommitTimer(item.id);
    commitTimersRef.current[item.id] = setTimeout(() => {
      commitQty(item, rawValue);
    }, 500);
  }

  useEffect(() => {
    return () => {
      Object.values(commitTimersRef.current).forEach((timer) =>
        clearTimeout(timer),
      );
      commitTimersRef.current = {};
    };
  }, []);

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
                <span className="font-semibold text-zinc-900">
                  {formatRp(it.price * it.qty)}
                </span>
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
                onClick={() => {
                  const nextQty = Math.max(1, it.qty - 1);
                  setDraftQtys((prev) => ({
                    ...prev,
                    [it.id]: String(nextQty),
                  }));
                  onSetQty(it.id, nextQty);
                }}
                className="h-8 w-8 rounded-lg border hover:bg-zinc-50"
                title="-"
              >
                -
              </button>

              <input
                type="number"
                min={1}
                value={draftQtys[it.id] ?? String(it.qty)}
                onChange={(e) => {
                  const raw = e.target.value;
                  setDraftQtys((prev) => ({ ...prev, [it.id]: raw }));
                  scheduleAutoCommit(it, raw);
                }}
                onFocus={(e) => e.currentTarget.select()}
                onBlur={(e) => commitQty(it, e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    commitQty(it, e.currentTarget.value);
                    e.currentTarget.blur();
                  }
                }}
                className="h-8 w-16 rounded-lg border text-center text-sm"
              />

              <button
                onClick={() => {
                  const nextQty = it.qty + 1;
                  setDraftQtys((prev) => ({
                    ...prev,
                    [it.id]: String(nextQty),
                  }));
                  onSetQty(it.id, nextQty);
                }}
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
