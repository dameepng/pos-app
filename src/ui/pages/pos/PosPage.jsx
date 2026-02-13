"use client";

import { useEffect, useMemo, useState } from "react";
import ProductSearch from "@/ui/components/pos/ProductSearch";
import Cart from "@/ui/components/pos/Cart";
import PaymentPanel from "@/ui/components/pos/PaymentPanel";
import ProductCategories from "@/ui/components/pos/ProductCategories";

export default function PosPage() {
  const [cartItems, setCartItems] = useState([]);
  const [sale, setSale] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [customerName, setCustomerName] = useState("");
  const [paperWidth, setPaperWidth] = useState("80mm");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = window.localStorage.getItem("pos:paperWidth");
    if (saved === "58mm" || saved === "80mm" || saved === "100mm") {
      setPaperWidth(saved);
    }
  }, []);

  function handlePaperWidthChange(nextWidth) {
    setPaperWidth(nextWidth);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("pos:paperWidth", nextWidth);
    }
  }

  function addToCart(product) {
    setCartItems((prev) => {
      const existing = prev.find((it) => it.id === product.id);
      if (existing) {
        return prev.map((it) =>
          it.id === product.id ? { ...it, qty: it.qty + 1 } : it,
        );
      }
      return [
        ...prev,
        { id: product.id, name: product.name, price: product.price, qty: 1 },
      ];
    });
  }

  function setQty(productId, qty) {
    setCartItems((prev) =>
      prev
        .map((it) =>
          it.id === productId ? { ...it, qty: Math.max(1, qty) } : it,
        )
        .filter((it) => it.qty > 0),
    );
  }

  function removeItem(productId) {
    setCartItems((prev) => prev.filter((it) => it.id !== productId));
  }

  function clearCart() {
    setCartItems([]);
    setSale(null);
    setCustomerName("");
  }

  const total = useMemo(
    () => cartItems.reduce((sum, it) => sum + it.price * it.qty, 0),
    [cartItems],
  );

  const [refreshKey, setRefreshKey] = useState(0);

  function refreshProducts() {
    setRefreshKey((k) => k + 1);
  }

  return (
    <div className="min-h-screen">
      {/* Main */}
      <div className="mx-auto max-w-7xl px-4 py-6 grid grid-cols-12 gap-6">
        {/* Left: Catalog */}
        <div className="col-span-12 lg:col-span-8 space-y-4">
          <div className="rounded-2xl border bg-white shadow-sm overflow-hidden">
            <div className="p-4 border-b bg-white">
              <h2 className="text-sm font-bold text-zinc-900">
                Katalog Produk
              </h2>
              <p className="text-xs text-zinc-500">
                Pilih kategori atau cari produk langsung.
              </p>

              {/* Tambahkan di sini: di bawah judul, di atas search bar atau sebaliknya */}
              <div className="mt-4">
                <ProductCategories
                  activeCategory={selectedCategory}
                  onSelect={setSelectedCategory}
                />
              </div>
            </div>

            <div className="p-4">
              {/* Kirim selectedCategory ke ProductSearch agar list produk terfilter */}
              <ProductSearch
                onSelect={addToCart}
                categoryId={selectedCategory}
                refreshKey={refreshKey}
              />
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
              </div>

              <div className="p-4">
                <div className="mb-4">
                  <label
                    htmlFor="customerName"
                    className="text-xs font-medium text-zinc-700"
                  >
                    Nama Customer (Opsional)
                  </label>
                  <input
                    id="customerName"
                    type="text"
                    placeholder="Contoh: Budi Santoso"
                    className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-zinc-400"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                  />
                  <p className="mt-1 text-[11px] text-zinc-500">
                    Isi hanya untuk transaksi penting atau jumlah besar.
                  </p>
                </div>
                <Cart
                  items={cartItems}
                  total={total}
                  onSetQty={setQty}
                  onRemove={removeItem}
                />
              </div>
            </div>

            <div className="rounded-2xl border bg-white shadow-sm">
              <div className="p-4 border-b">
                <h2 className="text-sm font-semibold">Payment</h2>
                <p className="text-xs text-zinc-500">Cash atau Midtrans.</p>
                <div className="mt-3 flex items-center gap-2">
                  <label
                    htmlFor="paperWidth"
                    className="text-xs font-medium text-zinc-600"
                  >
                    Paper Size
                  </label>
                  <select
                    id="paperWidth"
                    value={paperWidth}
                    onChange={(e) => handlePaperWidthChange(e.target.value)}
                    className="rounded-lg border border-zinc-200 bg-white px-2 py-1 text-xs text-zinc-800"
                  >
                    <option value="58mm">58mm</option>
                    <option value="80mm">80mm</option>
                    <option value="100mm">100mm</option>
                  </select>
                </div>
              </div>
              <div className="p-4">
                <PaymentPanel
                  cartItems={cartItems}
                  total={total}
                  sale={sale}
                  setSale={setSale}
                  onClear={clearCart}
                  onPaidSuccess={refreshProducts}
                  customerName={customerName}
                  paperWidth={paperWidth}
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
