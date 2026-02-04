"use client";

import { useState, Fragment } from "react";
import {
  Clock,
  ChevronDown,
  ChevronUp,
  Package,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

function formatRp(n) {
  return `Rp ${Number(n || 0).toLocaleString("id-ID")}`;
}

function formatTime(dateString) {
  return new Date(dateString).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function SalesTable({ sales }) {
  const [expandedSales, setExpandedSales] = useState(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

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

  // Pagination logic
  const totalItems = sales.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentSales = sales.slice(startIndex, endIndex);

  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  if (sales.length === 0) {
    return (
      <div className="px-5 py-8 text-center">
        <p className="text-sm text-zinc-500">Belum ada transaksi hari ini</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Items per page selector */}
      <div className="flex items-center justify-between px-5 pt-4">
        <div className="flex items-center gap-2">
          <label htmlFor="itemsPerPage" className="text-sm text-zinc-600">
            Tampilkan:
          </label>
          <select
            id="itemsPerPage"
            value={itemsPerPage}
            onChange={handleItemsPerPageChange}
            className="px-3 py-1.5 text-sm border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
          <span className="text-sm text-zinc-600">data per halaman</span>
        </div>

        <div className="text-sm text-zinc-600">
          Menampilkan {startIndex + 1}-{Math.min(endIndex, totalItems)} dari{" "}
          {totalItems} transaksi
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-zinc-50 border-b">
            <tr>
              <th className="px-5 py-3 text-left text-xs font-semibold text-zinc-600 w-10"></th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-zinc-600">
                Tanggal & Waktu
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-zinc-600">
                ID Transaksi
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-zinc-600">
                Customer
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
            {currentSales.map((sale) => {
              const isExpanded = expandedSales.has(sale.id);

              return (
                <Fragment key={sale.id}>
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
                    <td className="px-5 py-4">
                      <span className="text-sm text-zinc-700">
                        {sale.customerName || "-"}
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
                            : sale.paymentMethod === "QRIS"
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

                  {isExpanded && (
                    <tr className="bg-zinc-50">
                      <td colSpan={8} className="px-5 py-4">
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
                                      {item.product?.name ||
                                        item.name ||
                                        "Unknown Product"}
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

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-5 py-4 border-t">
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-zinc-700 bg-white border border-zinc-300 rounded-lg hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={16} />
            Sebelumnya
          </button>

          <div className="flex items-center gap-2">
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => goToPage(pageNum)}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    currentPage === pageNum
                      ? "bg-blue-600 text-white"
                      : "text-zinc-700 bg-white border border-zinc-300 hover:bg-zinc-50"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-zinc-700 bg-white border border-zinc-300 rounded-lg hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Selanjutnya
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
