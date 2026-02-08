"use client";

function CardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border shadow-sm p-5 animate-pulse">
      <div className="flex items-center justify-between mb-3">
        <div className="h-8 w-8 rounded-lg bg-zinc-100" />
        <div className="h-4 w-4 rounded bg-zinc-100" />
      </div>
      <div className="h-3 w-28 rounded bg-zinc-100 mb-2" />
      <div className="h-7 w-40 rounded bg-zinc-100" />
      <div className="h-3 w-20 rounded bg-zinc-100 mt-3" />
    </div>
  );
}

export function SummaryCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <CardSkeleton />
      <CardSkeleton />
      <CardSkeleton />
    </div>
  );
}

export function PaymentCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
      <CardSkeleton />
      <CardSkeleton />
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="bg-white rounded-2xl border shadow-sm p-5 h-64 animate-pulse">
      <div className="h-full w-full rounded bg-zinc-100" />
    </div>
  );
}

export function TableSkeleton({ columns = 5, rows = 3 }) {
  return (
    <div className="bg-white rounded-2xl border shadow-sm overflow-hidden animate-pulse">
      <div className="p-5 border-b">
        <div className="h-4 w-40 rounded bg-zinc-100" />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-zinc-50 border-b">
            <tr>
              {Array.from({ length: columns }).map((_, idx) => (
                <th key={idx} className="px-5 py-3">
                  <div className="h-3 w-20 rounded bg-zinc-100" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {Array.from({ length: rows }).map((_, idx) => (
              <TableRowSkeleton key={idx} columns={columns} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TableRowSkeleton({ columns = 5 }) {
  return (
    <tr className="animate-pulse">
      {Array.from({ length: columns }).map((_, idx) => (
        <td key={idx} className="px-5 py-4">
          <div className="h-3 w-full rounded bg-zinc-100" />
        </td>
      ))}
    </tr>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <div className="h-7 w-40 rounded bg-zinc-100 mb-2 animate-pulse" />
        <div className="h-4 w-56 rounded bg-zinc-100 animate-pulse" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden animate-pulse">
          <div className="p-5 border-b">
            <div className="h-4 w-32 rounded bg-zinc-100" />
          </div>
          <div className="p-5 space-y-3">
            <div className="h-12 rounded bg-zinc-100" />
            <div className="h-12 rounded bg-zinc-100" />
            <div className="h-12 rounded bg-zinc-100" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden animate-pulse">
          <div className="p-5 border-b">
            <div className="h-4 w-32 rounded bg-zinc-100" />
          </div>
          <div className="p-5 space-y-3">
            <div className="h-12 rounded bg-zinc-100" />
            <div className="h-12 rounded bg-zinc-100" />
            <div className="h-12 rounded bg-zinc-100" />
          </div>
        </div>
      </div>

      <TableSkeleton columns={5} rows={3} />
    </div>
  );
}

export function ReportSkeleton() {
  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="h-7 w-44 rounded bg-zinc-100 mb-2 animate-pulse" />
            <div className="h-4 w-56 rounded bg-zinc-100 animate-pulse" />
          </div>
          <div className="flex items-center gap-3">
            <div className="h-9 w-24 rounded bg-zinc-100 animate-pulse" />
            <div className="h-9 w-28 rounded bg-zinc-100 animate-pulse" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border shadow-sm p-5 animate-pulse">
          <div className="h-4 w-36 rounded bg-zinc-100" />
        </div>

        <ChartSkeleton />
        <SummaryCardsSkeleton />
        <PaymentCardsSkeleton />
        <TableSkeleton columns={9} rows={3} />
      </div>
    </div>
  );
}
