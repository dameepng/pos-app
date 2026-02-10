import AdminNavbar from "@/ui/components/AdminNavbar";

export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-zinc-50">
      <main className="w-full px-3 sm:px-4 lg:px-4 py-6">
        <div className="space-y-6">{children}</div>
      </main>
    </div>
  );
}
