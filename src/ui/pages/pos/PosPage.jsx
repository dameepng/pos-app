"use client";

import { useMemo, useState } from "react";
import ProductSearch from "./ProductSearch";
import Cart from "./Cart";
import PaymentPanel from "./PaymentPanel";

export default function PosPage() {
  const [cartItems, setCartItems] = useState([]);
  const [sale, setSale] = useState(null);

  function addToCart(product) {
    setCartItems((prev) => {
      const existing = prev.find((it) => it.id === product.id);
      if (existing) {
        return prev.map((it) => (it.id === product.id ? { ...it, qty: it.qty + 1 } : it));
      }
      return [...prev, { id: product.id, name: product.name, price: product.price, qty: 1 }];
    });
  }

  function setQty(productId, qty) {
    setCartItems((prev) =>
      prev
        .map((it) => (it.id === productId ? { ...it, qty: Math.max(1, qty) } : it))
        .filter((it) => it.qty > 0)
    );
  }

  function removeItem(productId) {
    setCartItems((prev) => prev.filter((it) => it.id !== productId));
  }

  function clearCart() {
    setCartItems([]);
    setSale(null);
  }

  const total = useMemo(
    () => cartItems.reduce((sum, it) => sum + it.price * it.qty, 0),
    [cartItems]
  );

  return (
    <div className="min-h-screen">
      {/* Top bar */}
      <div className="sticky top-0 z-10 border-b bg-white/90 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-zinc-900 text-white flex items-center justify-center font-semibold">
              P
            </div>
            <div>
              <h1 className="text-lg font-semibold leading-tight">POS App</h1>
              <p className="text-xs text-zinc-500">MVP • Cash + Midtrans</p>
            </div>
          </div>

          <div className="text-sm">
            <span className="text-zinc-500">Total</span>{" "}
            <span className="font-semibold">Rp {total.toLocaleString("id-ID")}</span>
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="mx-auto max-w-7xl px-4 py-6 grid grid-cols-12 gap-6">
        {/* Left: Catalog */}
        <div className="col-span-12 lg:col-span-8">
          <div className="rounded-2xl border bg-white shadow-sm">
            <div className="p-4 border-b">
              <h2 className="text-sm font-semibold">Produk</h2>
              <p className="text-xs text-zinc-500">Cari dan klik kartu untuk menambah ke cart.</p>
            </div>
            <div className="p-4">
              <ProductSearch onSelect={addToCart} />
            </div>
          </div>
        </div>

        {/* Right: Cart + Payment */}
        <div className="col-span-12 lg:col-span-4">
          <div className="lg:sticky lg:top-24 space-y-4">
            <div className="rounded-2xl border bg-white shadow-sm">
              <div className="p-4 border-b flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold">Cart</h2>
                  <p className="text-xs text-zinc-500">Item dan qty.</p>
                </div>
                <div className="text-sm font-semibold">Rp {total.toLocaleString("id-ID")}</div>
              </div>

              <div className="p-4">
                <Cart items={cartItems} total={total} onSetQty={setQty} onRemove={removeItem} />
              </div>
            </div>

            <div className="rounded-2xl border bg-white shadow-sm">
              <div className="p-4 border-b">
                <h2 className="text-sm font-semibold">Payment</h2>
                <p className="text-xs text-zinc-500">Cash atau Midtrans.</p>
              </div>
              <div className="p-4">
                <PaymentPanel
                  cartItems={cartItems}
                  total={total}
                  sale={sale}
                  setSale={setSale}
                  onClear={clearCart}
                />
              </div>
            </div>

            <div className="text-xs text-zinc-500">
              Tips: ketik minimal 2 huruf untuk search.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
