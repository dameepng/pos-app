"use client";

import { useState, Fragment, useEffect } from "react";
import {
  Clock,
  ChevronDown,
  ChevronUp,
  Package,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Filter,
  X,
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

export default function SalesTable() {
  const [expandedSales, setExpandedSales] = useState(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [sales, setSales] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [filters, setFilters] = useState({
    status: "",
    paymentMethod: "",
    startDate: "",
    endDate: "",
  });

  const [showFilters, setShowFilters] = useState(false);

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

  // Fetch data dari API dengan PATH YANG BENAR
  const fetchSales = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
      });

      if (filters.status) params.append("status", filters.status);
      if (filters.paymentMethod)
        params.append("paymentMethod", filters.paymentMethod);
      if (filters.startDate) params.append("startDate", filters.startDate);
      if (filters.endDate) params.append("endDate", filters.endDate);

      // ✅ PATH YANG BENAR: /api/admin/reports/sales
      const response = await fetch(
        `/api/admin/reports/sales?${params.toString()}`,
      );

      if (!response.ok) {
        throw new Error("Gagal mengambil data transaksi");
      }

      const result = await response.json();
      setSales(result.data || []);
      setPagination(result.pagination);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching sales:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, [currentPage, itemsPerPage, filters]);

  const goToPage = (page) => {
    if (pagination) {
      setCurrentPage(Math.max(1, Math.min(page, pagination.totalPages)));
    }
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      status: "",
      paymentMethod: "",
      startDate: "",
      endDate: "",
    });
    setCurrentPage(1);
  };

  const hasActiveFilters = Object.values(filters).some((v) => v !== "");

  if (loading) {
    return (
      <div className="px-5 py-16 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-3" />
        <p className="text-sm text-zinc-500">Memuat data transaksi...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-5 py-8 text-center">
        <p className="text-sm text-red-600 mb-3">Error: {error}</p>
        <button
          onClick={fetchSales}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with Filters Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-4 px-5 pt-4">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-zinc-700 bg-white border border-zinc-300 rounded-lg hover:bg-zinc-50 transition-colors"
        >
          <Filter size={16} />
          Filter
          {hasActiveFilters && (
            <span className="ml-1 px-2 py-0.5 text-xs bg-blue-600 text-white rounded-full">
              {Object.values(filters).filter((v) => v !== "").length}
            </span>
          )}
        </button>

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
            <option value={100}>100</option>
          </select>
          <span className="text-sm text-zinc-600">per halaman</span>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="mx-5 p-4 bg-zinc-50 border border-zinc-200 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-zinc-900">
              Filter Transaksi
            </h3>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700"
              >
                <X size={14} />
                Clear All
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Date Range */}
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">
                Tanggal Mulai
              </label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) =>
                  handleFilterChange("startDate", e.target.value)
                }
                className="w-full px-3 py-2 text-sm border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">
                Tanggal Akhir
              </label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange("endDate", e.target.value)}
                className="w-full px-3 py-2 text-sm border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
                className="w-full px-3 py-2 text-sm border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Semua Status</option>
                <option value="COMPLETED">Completed</option>
                <option value="PENDING">Pending</option>
              </select>
            </div>

            {/* Payment Method Filter */}
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">
                Metode Pembayaran
              </label>
              <select
                value={filters.paymentMethod}
                onChange={(e) =>
                  handleFilterChange("paymentMethod", e.target.value)
                }
                className="w-full px-3 py-2 text-sm border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Semua Metode</option>
                <option value="CASH">Cash</option>
                <option value="QRIS">QRIS</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Info */}
      {pagination && (
        <div className="px-5">
          <p className="text-sm text-zinc-600">
            Menampilkan {(currentPage - 1) * itemsPerPage + 1}-
            {Math.min(currentPage * itemsPerPage, pagination.totalItems)} dari{" "}
            {pagination.totalItems} transaksi
          </p>
        </div>
      )}

      {/* Empty State */}
      {sales.length === 0 ? (
        <div className="px-5 py-8 text-center">
          <p className="text-sm text-zinc-500">
            {hasActiveFilters
              ? "Tidak ada transaksi yang sesuai dengan filter"
              : "Belum ada transaksi"}
          </p>
        </div>
      ) : (
        <>
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
                    Kasir
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
                              <ChevronDown
                                size={16}
                                className="text-zinc-600"
                              />
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
                        <td className="px-5 py-4">
                          <div className="text-sm">
                            <p className="font-medium text-zinc-900">
                              {sale.cashier?.name || "-"}
                            </p>
                            <p className="text-xs text-zinc-500">
                              {sale.cashier?.email || ""}
                            </p>
                          </div>
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
                          <td colSpan={9} className="px-5 py-4">
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
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-4 border-t">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={!pagination.hasPreviousPage}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-zinc-700 bg-white border border-zinc-300 rounded-lg hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={16} />
                Sebelumnya
              </button>

              <div className="flex items-center gap-2">
                {currentPage > 3 && (
                  <>
                    <button
                      onClick={() => goToPage(1)}
                      className="px-3 py-2 text-sm font-medium text-zinc-700 bg-white border border-zinc-300 rounded-lg hover:bg-zinc-50"
                    >
                      1
                    </button>
                    {currentPage > 4 && (
                      <span className="px-2 text-zinc-500">...</span>
                    )}
                  </>
                )}

                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                  .filter((page) => {
                    return (
                      page === currentPage ||
                      page === currentPage - 1 ||
                      page === currentPage + 1 ||
                      page === currentPage - 2 ||
                      page === currentPage + 2
                    );
                  })
                  .map((page) => (
                    <button
                      key={page}
                      onClick={() => goToPage(page)}
                      className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                        currentPage === page
                          ? "bg-blue-600 text-white"
                          : "text-zinc-700 bg-white border border-zinc-300 hover:bg-zinc-50"
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                {currentPage < pagination.totalPages - 2 && (
                  <>
                    {currentPage < pagination.totalPages - 3 && (
                      <span className="px-2 text-zinc-500">...</span>
                    )}
                    <button
                      onClick={() => goToPage(pagination.totalPages)}
                      className="px-3 py-2 text-sm font-medium text-zinc-700 bg-white border border-zinc-300 rounded-lg hover:bg-zinc-50"
                    >
                      {pagination.totalPages}
                    </button>
                  </>
                )}
              </div>

              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={!pagination.hasNextPage}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-zinc-700 bg-white border border-zinc-300 rounded-lg hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Selanjutnya
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
