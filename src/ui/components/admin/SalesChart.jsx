"use client";

import { useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ShoppingCart, DollarSign } from "lucide-react";

function formatRp(n) {
  return `Rp ${Number(n || 0).toLocaleString("id-ID")}`;
}

export default function SalesChart({ data, period }) {
  const [metric, setMetric] = useState("revenue"); // 'revenue' | 'transactions'

  const safeData = useMemo(() => (Array.isArray(data) ? data : []), [data]);
  const hasData = safeData.length > 0;

  const revenues = useMemo(
    () => safeData.map((d) => Number(d?.revenue ?? 0)),
    [safeData],
  );
  const txs = useMemo(
    () => safeData.map((d) => Number(d?.transactions ?? 0)),
    [safeData],
  );

  const stats = useMemo(() => {
    if (!hasData) {
      return {
        maxRevenue: 0,
        minRevenue: 0,
        avgRevenue: 0,
        maxTx: 0,
        minTx: 0,
        avgTx: 0,
      };
    }

    const maxRevenue = Math.max(...revenues);
    const minRevenue = Math.min(...revenues);
    const avgRevenue =
      revenues.reduce((sum, v) => sum + v, 0) / revenues.length;

    const maxTx = Math.max(...txs);
    const minTx = Math.min(...txs);
    const avgTx = txs.reduce((sum, v) => sum + v, 0) / txs.length;

    return { maxRevenue, minRevenue, avgRevenue, maxTx, minTx, avgTx };
  }, [hasData, revenues, txs]);

  const formatXAxis = (value) => value;

  const formatYAxis = (value) => {
    if (metric === "revenue") {
      const v = Number(value || 0);
      return v >= 1000000
        ? `${(v / 1000000).toFixed(1)}jt`
        : v >= 1000
          ? `${(v / 1000).toFixed(0)}rb`
          : v;
    }
    return value;
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const row = payload[0]?.payload;
      const val = Number(payload[0]?.value ?? 0);

      return (
        <div className="bg-white border border-zinc-200 rounded-lg shadow-lg p-3">
          <p className="text-xs font-medium text-zinc-900 mb-2">
            {row?.label ?? row?.date ?? "-"}
          </p>
          <p className="text-sm font-bold text-blue-600">
            {metric === "revenue" ? formatRp(val) : `${val} transaksi`}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-2xl border shadow-sm p-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h3 className="font-bold text-zinc-900">Trend Penjualan</h3>
          <p className="text-xs text-zinc-500 mt-1">
            {period === "today"
              ? "Hari Ini"
              : period === "7days"
                ? "7 Hari Terakhir"
                : period === "30days"
                  ? "30 Hari Terakhir"
                  : "12 Bulan Terakhir"}
          </p>
        </div>

        {/* Toggle Metric */}
        <div className="flex items-center gap-2 bg-zinc-100 p-1 rounded-lg">
          <button
            onClick={() => setMetric("revenue")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              metric === "revenue"
                ? "bg-white text-zinc-900 shadow-sm"
                : "text-zinc-600 hover:text-zinc-900"
            }`}
          >
            <DollarSign size={14} />
            Revenue
          </button>
          <button
            onClick={() => setMetric("transactions")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              metric === "transactions"
                ? "bg-white text-zinc-900 shadow-sm"
                : "text-zinc-600 hover:text-zinc-900"
            }`}
          >
            <ShoppingCart size={14} />
            Transaksi
          </button>
        </div>
      </div>

      {/* Chart / Empty state */}
      {!hasData ? (
        <div className="rounded-xl border bg-zinc-50 p-4 text-sm text-zinc-600">
          Tidak ada data untuk periode ini.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={safeData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" />
            <XAxis
              dataKey="date"
              tickFormatter={formatXAxis}
              stroke="#71717a"
              style={{ fontSize: "12px" }}
            />
            <YAxis
              tickFormatter={formatYAxis}
              stroke="#71717a"
              style={{ fontSize: "12px" }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey={metric}
              stroke={metric === "revenue" ? "#3b82f6" : "#10b981"}
              strokeWidth={2}
              dot={{
                fill: metric === "revenue" ? "#3b82f6" : "#10b981",
                r: 4,
              }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-zinc-100">
        <div>
          <p className="text-xs text-zinc-500 mb-1">Tertinggi</p>
          <p className="text-sm font-bold text-zinc-900">
            {metric === "revenue" ? formatRp(stats.maxRevenue) : stats.maxTx}
          </p>
        </div>

        <div>
          <p className="text-xs text-zinc-500 mb-1">Terendah</p>
          <p className="text-sm font-bold text-zinc-900">
            {metric === "revenue" ? formatRp(stats.minRevenue) : stats.minTx}
          </p>
        </div>

        <div>
          <p className="text-xs text-zinc-500 mb-1">Rata-rata</p>
          <p className="text-sm font-bold text-zinc-900">
            {metric === "revenue"
              ? formatRp(stats.avgRevenue)
              : Math.round(stats.avgTx)}
          </p>
        </div>
      </div>
    </div>
  );
}
