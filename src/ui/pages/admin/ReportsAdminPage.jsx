"use client";

import { useCallback, useEffect, useState } from "react";
import { Calendar, Filter, Download, RefreshCw } from "lucide-react";
import ReportSummary from "@/ui/components/pos/ReportSummary";
import SalesTable from "@/ui/components/admin/SalesTable";
import DateRangeFilter from "@/ui/components/admin/DateRangeFilter";
import { exportToCSV } from "@/lib/utils/exportCsv";
import SalesChart from "@/ui/components/admin/SalesChart";
import {
  ReportSkeleton,
  SummaryCardsSkeleton,
  PaymentCardsSkeleton,
  ChartSkeleton,
  TableSkeleton,
} from "@/ui/components/admin/AdminSkeletons";

function getLocalYmd(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export default function ReportsAdminPage() {
  const [report, setReport] = useState(null);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("today");
  const [role, setRole] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [dateRange, setDateRange] = useState({
    startDate: getLocalYmd(),
    endDate: getLocalYmd(),
  });

  const isOps = role === "OPS";

  useEffect(() => {
    const loadMe = async () => {
      try {
        const res = await fetch("/api/auth/me");
        const json = await res.json();
        if (res.ok) setRole(json?.data?.role || null);
      } catch {
        setRole(null);
      }
    };

    loadMe();
  }, []);

  useEffect(() => {
    if (!isOps) return;
    const todayStr = getLocalYmd();
    setPeriod("today");
    setDateRange({ startDate: todayStr, endDate: todayStr });
  }, [isOps]);

  const fetchReport = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        period: period,
      });

      const res = await fetch(`/api/admin/reports/sales?${params}`);

      if (!res.ok) {
        console.error("API Error:", res.status, res.statusText);
        throw new Error(`HTTP ${res.status}`);
      }

      const json = await res.json();
      setReport(json.data.summary);
      setSales(json.data.sales || []);
      setChartData(json.data.chartData || []);
    } catch (err) {
      console.error("Failed to load report:", err);
      setReport({
        totalSales: 0,
        totalRevenue: 0,
        totalProfit: 0,
        cashRevenue: 0,
        cashCount: 0,
        midtransRevenue: 0,
        midtransCount: 0,
      });
      setSales([]);
    } finally {
      setLoading(false);
    }
  }, [dateRange.endDate, dateRange.startDate, period]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const handleDateRangeChange = (start, end) => {
    setDateRange({ startDate: start, endDate: end });
  };

  const handleExport = async () => {
    if (isOps) return;
    try {
      setLoading(true);

      let page = 1;
      const limit = 200; // biar lebih cepat
      let all = [];

      while (true) {
        const params = new URLSearchParams({
          page: String(page),
          limit: String(limit),
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
        });

        const res = await fetch(`/api/admin/reports/sales?${params}`);
        if (!res.ok) throw new Error("Gagal mengambil data export");

        const json = await res.json();
        const rows = json.data || [];
        all = all.concat(rows);

        if (!json.pagination?.hasNextPage) break;
        page += 1;
      }

      if (all.length === 0) {
        alert("Tidak ada data untuk diexport");
        return;
      }

      const exportData = all.flatMap((sale) => {
        if (sale.items?.length) {
          return sale.items.map((item) => ({
            Tanggal: new Date(sale.createdAt).toLocaleDateString("id-ID"),
            Waktu: new Date(sale.createdAt).toLocaleTimeString("id-ID", {
              hour: "2-digit",
              minute: "2-digit",
            }),
            "ID Transaksi": sale.id.slice(0, 12),
            "Nama Produk": item.product?.name || item.name || "Unknown",
            Qty: item.qty,
            "Harga Satuan": item.price,
            Subtotal: item.subtotal,
            "Total Transaksi": sale.total,
            "Metode Pembayaran": sale.paymentMethod,
            Status: sale.status,
          }));
        }

        return [
          {
            Tanggal: new Date(sale.createdAt).toLocaleDateString("id-ID"),
            Waktu: new Date(sale.createdAt).toLocaleTimeString("id-ID", {
              hour: "2-digit",
              minute: "2-digit",
            }),
            "ID Transaksi": sale.id.slice(0, 12),
            "Nama Produk": "N/A",
            Qty: 0,
            "Harga Satuan": 0,
            Subtotal: 0,
            "Total Transaksi": sale.total,
            "Metode Pembayaran": sale.paymentMethod,
            Status: sale.status,
          },
        ];
      });

      const filename = `laporan-penjualan_${dateRange.startDate}_${dateRange.endDate}.csv`;
      exportToCSV(exportData, filename);
    } catch (e) {
      alert(e.message || "Export gagal");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !report) {
    return <ReportSkeleton />;
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="w-full px-3 sm:px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900">
              Laporan Penjualan
            </h1>
            <p className="text-sm text-zinc-500 flex items-center gap-2 mt-1">
              <Calendar size={14} />
              Semua transaksi dengan filter tanggal
            </p>
          </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchReport}
            disabled={loading}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-zinc-700 bg-white border border-zinc-200 rounded-lg hover:bg-zinc-50 transition-colors disabled:opacity-50"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
          <button
            onClick={handleExport}
            disabled={loading || isOps}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-zinc-900 rounded-lg hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:bg-zinc-400"
            title={isOps ? "Export hanya untuk OWNER" : undefined}
          >
            <Download size={16} />
            Export CSV
          </button>
        </div>
      </div>

      <DateRangeFilter
        startDate={dateRange.startDate}
        endDate={dateRange.endDate}
        onChange={handleDateRangeChange}
        onPeriodChange={setPeriod}
        loading={loading}
        allowedPresets={isOps ? ["today", "7days"] : undefined}
        disableCustomRange={isOps}
      />

        {loading ? (
          <ChartSkeleton />
        ) : (
          <SalesChart data={chartData} period={period} />
        )}

        {loading ? (
          <>
            <SummaryCardsSkeleton />
            <PaymentCardsSkeleton />
          </>
        ) : (
          <ReportSummary report={report} />
        )}

        {/* Sales Table */}
        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
          <div className="p-5 border-b flex items-center justify-between">
            <div>
              <h2 className="font-bold text-zinc-900">Riwayat Transaksi</h2>
              <p className="text-xs text-zinc-500 mt-1">
                Klik chevron untuk melihat detail barang
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <Filter size={14} />
              <span>{sales.length} transaksi</span>
            </div>
          </div>

        {loading ? (
          <TableSkeleton columns={9} rows={5} />
        ) : (
          <SalesTable
            forcedStartDate={isOps ? dateRange.startDate : undefined}
            forcedEndDate={isOps ? dateRange.endDate : undefined}
            lockDateFilter={isOps}
          />
        )}
      </div>
      </div>
    </div>
  );
}
