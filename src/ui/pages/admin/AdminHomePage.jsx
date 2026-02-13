"use client";

import { useEffect, useState } from "react";
import {
  TrendingUp,
  DollarSign,
  ShoppingCart,
  AlertTriangle,
  ArrowRight,
  Calendar,
  Trophy,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { DashboardSkeleton } from "@/ui/components/admin/AdminSkeletons";

function formatRp(n) {
  return `Rp ${Number(n || 0).toLocaleString("id-ID")}`;
}

function formatDateTime(dateString) {
  return new Date(dateString).toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminHomePage({ initialDashboard = null }) {
  const [dashboard, setDashboard] = useState(initialDashboard);
  const [loading, setLoading] = useState(!initialDashboard);
  const [topSortBy, setTopSortBy] = useState("qty");

  useEffect(() => {
    if (initialDashboard) return;

    async function fetchDashboard() {
      try {
        const res = await fetch("/api/admin/dashboard");
        const json = await res.json();
        setDashboard(json.data);
      } catch (err) {
        console.error("Failed to load dashboard:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, [initialDashboard]);

  if (loading) {
    return <DashboardSkeleton />;
  }

  const today = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Dashboard</h1>
        <p className="text-sm text-zinc-500 flex items-center gap-2 mt-1">
          <Calendar size={14} />
          {today}
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Penjualan Hari Ini */}
        <div className="bg-white rounded-2xl border shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <DollarSign size={20} className="text-blue-600" />
            </div>
            <TrendingUp size={16} className="text-emerald-600" />
          </div>
          <p className="text-xs text-zinc-500 font-medium mb-1">
            Penjualan Hari Ini
          </p>
          <p className="text-2xl font-bold text-zinc-900">
            {formatRp(dashboard?.today?.revenue || 0)}
          </p>
          <p className="text-xs text-zinc-500 mt-2">
            {dashboard?.today?.transactions || 0} transaksi
          </p>
        </div>

        {/* Laba Hari Ini */}
        <div className="bg-white rounded-2xl border shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-emerald-50 rounded-lg">
              <TrendingUp size={20} className="text-emerald-600" />
            </div>
          </div>
          <p className="text-xs text-zinc-500 font-medium mb-1">
            Laba Hari Ini
          </p>
          <p className="text-2xl font-bold text-zinc-900">
            {formatRp(dashboard?.today?.profit || 0)}
          </p>
        </div>

        {/* Produk Terjual Hari Ini */}
        <div className="bg-white rounded-2xl border shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-purple-50 rounded-lg">
              <ShoppingCart size={20} className="text-purple-600" />
            </div>
          </div>
          <p className="text-xs text-zinc-500 font-medium mb-1">
            Produk Terjual Hari Ini
          </p>
          <p className="text-2xl font-bold text-zinc-900">
            {dashboard?.today?.itemsSold || 0}
          </p>
          <p className="text-xs text-zinc-500 mt-2">unit</p>
        </div>

        {/* Penjualan Bulan Ini */}
        <div className="bg-white rounded-2xl border shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-emerald-50 rounded-lg">
              <TrendingUp size={20} className="text-emerald-600" />
            </div>
          </div>
          <p className="text-xs text-zinc-500 font-medium mb-1">
            Penjualan Bulan Ini
          </p>
          <p className="text-2xl font-bold text-zinc-900">
            {formatRp(dashboard?.month?.revenue || 0)}
          </p>
          <p className="text-xs text-zinc-500 mt-2">
            {dashboard?.month?.transactions || 0} transaksi
          </p>
        </div>

        {/* Laba Bulan Ini */}
        <div className="bg-white rounded-2xl border shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <DollarSign size={20} className="text-blue-600" />
            </div>
          </div>
          <p className="text-xs text-zinc-500 font-medium mb-1">
            Laba Bulan Ini
          </p>
          <p className="text-2xl font-bold text-zinc-900">
            {formatRp(dashboard?.month?.profit || 0)}
          </p>
        </div>

        {/* Stock Menipis */}
        <div className="bg-white rounded-2xl border shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-orange-50 rounded-lg">
              <AlertTriangle size={20} className="text-orange-600" />
            </div>
          </div>
          <p className="text-xs text-zinc-500 font-medium mb-1">
            Stock Menipis
          </p>
          <p className="text-2xl font-bold text-zinc-900">
            {dashboard?.lowStockCount || 0}
          </p>
          <p className="text-xs text-zinc-500 mt-2">produk perlu restock</p>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
          <div className="p-5 border-b flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy size={18} className="text-amber-600" />
              <h2 className="font-bold text-zinc-900">Produk Terlaris</h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setTopSortBy("qty")}
                className={`px-2.5 py-1 text-[11px] font-semibold rounded-full border transition-colors ${
                  topSortBy === "qty"
                    ? "bg-zinc-900 text-white border-zinc-900"
                    : "bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50"
                }`}
              >
                Qty Terjual
              </button>
              <button
                onClick={() => setTopSortBy("revenue")}
                className={`px-2.5 py-1 text-[11px] font-semibold rounded-full border transition-colors ${
                  topSortBy === "revenue"
                    ? "bg-zinc-900 text-white border-zinc-900"
                    : "bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50"
                }`}
              >
                Omzet
              </button>
            </div>
          </div>
          <div className="p-5">
            {(() => {
              const topProducts =
                topSortBy === "revenue"
                  ? dashboard?.topProductsByRevenue
                  : dashboard?.topProductsByQty;

              if (!topProducts || topProducts.length === 0) {
                return (
                  <p className="text-sm text-zinc-500 text-center py-8">
                    Belum ada data penjualan
                  </p>
                );
              }

              return (
                <div className="space-y-3">
                  {topProducts.map((product, idx) => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between p-3 bg-zinc-50 rounded-lg hover:bg-zinc-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 bg-white border border-zinc-200 rounded-lg text-sm font-bold text-zinc-700">
                          {idx + 1}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-zinc-900">
                            {product.name}
                          </p>
                          <p className="text-xs text-zinc-500">
                            {product.totalSold} terjual
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-zinc-900">
                          {formatRp(product.revenue)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        </div>

        {/* Low Stock Products */}
        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
          <div className="p-5 border-b flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle size={18} className="text-orange-600" />
              <h2 className="font-bold text-zinc-900">Stock Menipis</h2>
            </div>
            <Link
              href="/admin/products"
              prefetch={false}
              className="text-xs text-zinc-500 hover:text-zinc-900 flex items-center gap-1"
            >
              Kelola Stock <ArrowRight size={12} />
            </Link>
          </div>
          <div className="p-5">
            {!dashboard?.lowStock || dashboard.lowStock.length === 0 ? (
              <p className="text-sm text-emerald-600 text-center py-8">
                ✓ Semua produk stock aman
              </p>
            ) : (
              <div className="space-y-3">
                {dashboard.lowStock.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-100"
                  >
                    <div>
                      <p className="text-sm font-medium text-zinc-900">
                        {product.name}
                      </p>
                      <p className="text-xs text-zinc-500">{product.sku}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-orange-600">
                        {product.stock} unit
                      </p>
                      <p className="text-xs text-orange-500">Perlu restock</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        <div className="p-5 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock size={18} className="text-zinc-600" />
            <h2 className="font-bold text-zinc-900">Transaksi Terakhir</h2>
          </div>
          <Link
            href="/admin/reports"
            prefetch={false}
            className="text-xs text-zinc-500 hover:text-zinc-900 flex items-center gap-1"
          >
            Lihat Semua <ArrowRight size={12} />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-zinc-50 border-b">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-semibold text-zinc-600">
                  Waktu
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-zinc-600">
                  ID Transaksi
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-zinc-600">
                  Items
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-zinc-600">
                  Metode
                </th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-zinc-600">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {!dashboard?.recentSales || dashboard.recentSales.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center">
                    <p className="text-sm text-zinc-500">
                      Belum ada transaksi hari ini
                    </p>
                  </td>
                </tr>
              ) : (
                dashboard.recentSales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-zinc-50">
                    <td className="px-5 py-4 text-sm text-zinc-600">
                      {formatDateTime(sale.createdAt)}
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-xs font-mono text-zinc-500">
                        {sale.id.slice(0, 8)}...
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-zinc-600">
                      {sale.itemCount} item
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                          sale.paymentMethod === "CASH"
                            ? "bg-orange-50 text-orange-700"
                            : "bg-purple-50 text-purple-700"
                        }`}
                      >
                        {sale.paymentMethod}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <span className="text-sm font-semibold text-zinc-900">
                        {formatRp(sale.total)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
