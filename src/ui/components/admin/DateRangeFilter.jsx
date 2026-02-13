"use client";

import { useEffect, useState } from "react";
import { Calendar } from "lucide-react";

function getLocalYmd(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export default function DateRangeFilter({
  startDate,
  endDate,
  onChange,
  onPeriodChange,
  loading,
  allowedPresets,
  disableCustomRange,
}) {
  const [localStart, setLocalStart] = useState(startDate);
  const [localEnd, setLocalEnd] = useState(endDate);

  useEffect(() => {
    setLocalStart(startDate);
    setLocalEnd(endDate);
  }, [startDate, endDate]);

  const handleApply = () => {
    onChange(localStart, localEnd);
  };

  const presets = [
    {
      label: "Hari Ini",
      period: "today", // ✅ ganti dari 7days
      getValue: () => {
        const today = getLocalYmd();
        return { start: today, end: today };
      },
    },
    {
      label: "7 Hari Terakhir",
      period: "7days",
      getValue: () => {
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - 6);
        return {
          start: getLocalYmd(start),
          end: getLocalYmd(end),
        };
      },
    },
    {
      label: "30 Hari Terakhir",
      period: "30days",
      getValue: () => {
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - 29);
        return {
          start: getLocalYmd(start),
          end: getLocalYmd(end),
        };
      },
    },
    {
      label: "1 Tahun Terakhir",
      period: "1year",
      getValue: () => {
        const end = new Date();
        const start = new Date();
        start.setFullYear(start.getFullYear() - 1);
        return {
          start: getLocalYmd(start),
          end: getLocalYmd(end),
        };
      },
    },
  ];

  const visiblePresets = Array.isArray(allowedPresets)
    ? presets.filter((preset) => allowedPresets.includes(preset.period))
    : presets;

  const applyPreset = (preset) => {
    const { start, end } = preset.getValue();
    setLocalStart(start);
    setLocalEnd(end);
    // ✅ update period di parent
    onPeriodChange?.(preset.period);
    onChange(start, end);
  };

  return (
    <div className="bg-white rounded-2xl border shadow-sm p-5">
      <div className="flex items-center gap-2 mb-4">
        <Calendar size={18} className="text-zinc-600" />
        <h3 className="font-semibold text-zinc-900">Filter Tanggal</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Date Inputs */}
        <div className="lg:col-span-2 grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-zinc-600 mb-1.5 block">
              Dari Tanggal
            </label>
            <input
              type="date"
              value={localStart}
              onChange={(e) => setLocalStart(e.target.value)}
              disabled={loading || disableCustomRange}
              className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 disabled:opacity-50"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-zinc-600 mb-1.5 block">
              Sampai Tanggal
            </label>
            <input
              type="date"
              value={localEnd}
              onChange={(e) => setLocalEnd(e.target.value)}
              disabled={loading || disableCustomRange}
              className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 disabled:opacity-50"
            />
          </div>
        </div>

        {/* Quick Presets */}
        <div className="lg:col-span-2 flex flex-wrap items-end gap-2">
          {visiblePresets.map((preset) => (
            <button
              key={preset.label}
              onClick={() => applyPreset(preset)}
              disabled={loading}
              className="px-3 py-2 text-xs font-medium text-zinc-700 bg-zinc-50 border border-zinc-200 rounded-lg hover:bg-zinc-100 hover:border-zinc-300 transition-colors disabled:opacity-50"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Apply Button - only show if dates changed */}
      {(localStart !== startDate || localEnd !== endDate) && (
        <div className="mt-4 pt-4 border-t border-zinc-100">
          <button
            onClick={handleApply}
            disabled={loading}
            className="w-full sm:w-auto px-6 py-2 text-sm font-medium text-white bg-zinc-900 rounded-lg hover:bg-zinc-800 transition-colors disabled:opacity-50"
          >
            Terapkan Filter
          </button>
        </div>
      )}
    </div>
  );
}


