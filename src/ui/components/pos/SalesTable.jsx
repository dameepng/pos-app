"use client";

import { useState, Fragment } from "react";
import { Clock, ChevronDown, ChevronUp, Package, Calendar } from "lucide-react";

function formatRp(n) {
  return `Rp ${Number(n || 0).toLocaleString("id-ID")}`;
}

function formatTime(dateString) {
  return new Date(dateString).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ✅ Format tanggal lengkap
function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function SalesTable({ sales }) {
  const [expandedSales, setExpandedSales] = useState(new Set());

  const toggleExpand = (saleId) => {
    setExpandedSales((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(saleId)) {
        newSet.delete(saleId);
      } else {
        newSet.add(saleId);
      }
      return newSet;
    });
  };

  if (sales.length === 0) {
    return (
      <div className="px-5 py-8 text-center">
        <p className="text-sm text-zinc-500">Belum ada transaksi hari ini</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-zinc-50 border-b">
          <tr>
            <th className="px-5 py-3 text-left text-xs font-semibold text-zinc-600 w-10">
              {/* Expand column */}
            </th>
            <th className="px-5 py-3 text-left text-xs font-semibold text-zinc-600">
              Tanggal & Waktu {/* ✅ Update header */}
            </th>
            <th className="px-5 py-3 text-left text-xs font-semibold text-zinc-600">
              ID Transaksi
            </th>
            <th className="px-5 py-3 text-left text-xs font-semibold text-zinc-600">
              Items
            </th>
            <th className="px-5 py-3 text-left text-xs font-semibold text-zinc-600">
              Status
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
          {sales.map((sale) => {
            const isExpanded = expandedSales.has(sale.id);

            // ✅ Gunakan Fragment dengan key
            return (
              <Fragment key={sale.id}>
                {/* Main Row */}
                <tr className="hover:bg-zinc-50">
                  <td className="px-5 py-4">
                    <button
                      onClick={() => toggleExpand(sale.id)}
                      className="p-1 hover:bg-zinc-100 rounded transition-colors"
                      title="Lihat detail barang"
                    >
                      {isExpanded ? (
                        <ChevronUp size={16} className="text-zinc-600" />
                      ) : (
                        <ChevronDown size={16} className="text-zinc-600" />
                      )}
                    </button>
                  </td>
                  {/* ✅ Tanggal & Waktu dengan styling lebih baik */}
                  <td className="px-5 py-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-sm font-medium text-zinc-900">
                        <Calendar size={14} className="text-zinc-400" />
                        {formatDate(sale.createdAt)}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-zinc-500">
                        <Clock size={12} className="text-zinc-400" />
                        {formatTime(sale.createdAt)}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-xs font-mono text-zinc-500">
                      {sale.id.slice(0, 8)}...
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm text-zinc-600">
                    {sale.items?.length || 0} item
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                        sale.status === "COMPLETED"
                          ? "bg-emerald-50 text-emerald-700"
                          : sale.status === "PENDING"
                            ? "bg-yellow-50 text-yellow-700"
                            : "bg-zinc-50 text-zinc-700"
                      }`}
                    >
                      {sale.status}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                        sale.paymentMethod === "CASH"
                          ? "bg-orange-50 text-orange-700"
                          : sale.paymentMethod === "MIDTRANS"
                            ? "bg-purple-50 text-purple-700"
                            : "bg-zinc-50 text-zinc-700"
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

                {/* Expanded Detail Row */}
                {isExpanded && (
                  <tr className="bg-zinc-50">
                    <td colSpan={7} className="px-5 py-4">
                      <div className="bg-white rounded-lg border p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <Package size={16} className="text-zinc-600" />
                          <h4 className="text-sm font-semibold text-zinc-900">
                            Detail Barang
                          </h4>
                        </div>

                        <div className="space-y-2">
                          {sale.items && sale.items.length > 0 ? (
                            sale.items.map((item, idx) => (
                              <div
                                key={idx}
                                className="flex items-center justify-between py-2 border-b last:border-b-0"
                              >
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-zinc-900">
                                    {item.product?.name || "Unknown Product"}
                                  </p>
                                  <p className="text-xs text-zinc-500">
                                    {formatRp(item.price)} × {item.qty}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm font-semibold text-zinc-900">
                                    {formatRp(item.subtotal)}
                                  </p>
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-zinc-500">
                              Tidak ada detail item
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
