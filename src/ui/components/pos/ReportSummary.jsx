import {
  DollarSign,
  ShoppingBag,
  TrendingUp,
  CreditCard,
  Banknote,
} from "lucide-react";
import SalesChart from "@/ui/components/admin/SalesChart";

function formatRp(n) {
  return `Rp ${Number(n || 0).toLocaleString("id-ID")}`;
}

export default function ReportSummary({ report, chartData, period }) {
  return (
    <>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Penjualan */}
        <div className="bg-white rounded-2xl border shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <DollarSign size={20} className="text-blue-600" />
            </div>
            <TrendingUp size={16} className="text-emerald-600" />
          </div>
          <p className="text-xs text-zinc-500 font-medium mb-1">
            Total Penjualan
          </p>
          <p className="text-2xl font-bold text-zinc-900">
            {formatRp(report?.totalRevenue || 0)}
          </p>
        </div>

        {/* Jumlah Transaksi */}
        <div className="bg-white rounded-2xl border shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-emerald-50 rounded-lg">
              <ShoppingBag size={20} className="text-emerald-600" />
            </div>
          </div>
          <p className="text-xs text-zinc-500 font-medium mb-1">
            Total Transaksi
          </p>
          <p className="text-2xl font-bold text-zinc-900">
            {report?.totalSales || 0}
          </p>
        </div>

        {/* Pembayaran Cash */}
        <div className="bg-white rounded-2xl border shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-orange-50 rounded-lg">
              <Banknote size={20} className="text-orange-600" />
            </div>
          </div>
          <p className="text-xs text-zinc-500 font-medium mb-1">Cash</p>
          <p className="text-2xl font-bold text-zinc-900">
            {formatRp(report?.cashRevenue || 0)}
          </p>
          <p className="text-xs text-zinc-500 mt-1">
            {report?.cashCount || 0} transaksi
          </p>
        </div>

        {/* Pembayaran Digital */}
        <div className="bg-white rounded-2xl border shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-purple-50 rounded-lg">
              <CreditCard size={20} className="text-purple-600" />
            </div>
          </div>
          <p className="text-xs text-zinc-500 font-medium mb-1">Digital</p>
          <p className="text-2xl font-bold text-zinc-900">
            {formatRp(report?.midtransRevenue || 0)}
          </p>
          <p className="text-xs text-zinc-500 mt-1">
            {report?.midtransCount || 0} transaksi
          </p>
        </div>
      </div>

      {/* Chart - Only show if chartData provided */}
      {chartData && chartData.length > 0 && (
        <SalesChart data={chartData} period={period || "7days"} />
      )}
    </>
  );
}
