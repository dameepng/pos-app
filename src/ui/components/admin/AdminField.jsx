"use client";

export default function AdminField({ label, children }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider ml-1">
        {label}
      </label>
      {children}
    </div>
  );
}
