"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import {
  ShoppingCart,
  LogOut,
  Menu,
  X,
  LayoutDashboard,
  UserCircle,
  FileText,
} from "lucide-react";

export default function PosNavbar({ user }) {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const userInitials = user?.email
    ? user.email.substring(0, 2).toUpperCase()
    : "ST";

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-zinc-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="bg-white h-10 w-10 rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
              <img
                src="/logopos.svg"
                alt="POS"
                className="h-full w-full object-contain"
              />
            </div>
            <div>
              <h1 className="text-sm font-bold text-zinc-900 tracking-tight leading-none">
                Point of Sale
              </h1>
              <p className="text-[10px] font-medium text-blue-600 uppercase tracking-widest mt-1">
                Terminal Active
              </p>
            </div>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            {/* ✅ Tombol Laporan Harian */}
            <Link
              href="/pos/reports"
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-all"
            >
              <FileText size={18} />
              <span>Laporan Hari Ini</span>
            </Link>
            {/* Tombol Kembali ke Admin */}
            <Link
              href="/admin"
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-all"
            >
              <LayoutDashboard size={18} />
              <span>Admin Panel</span>
            </Link>

            <div className="h-6 w-[1px] bg-zinc-200 mx-2" />

            {/* User Info */}
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-semibold text-zinc-900 leading-none">
                  {user?.email?.split("@")[0]}
                </p>
                <p className="text-[10px] text-zinc-500 mt-1 uppercase tracking-tighter">
                  {user?.role || "Staff"}
                </p>
              </div>
              <div className="h-9 w-9 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center text-xs font-bold text-zinc-700">
                {userInitials}
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-zinc-600 hover:bg-zinc-100 rounded-lg"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-zinc-100 bg-white absolute left-0 right-0 shadow-xl pb-6 px-4 animate-in slide-in-from-top-2">
            <div className="py-4 space-y-2">
              {/* ✅ Laporan Harian - Mobile */}
              <Link
                href="/pos/reports"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-zinc-600 font-medium hover:bg-zinc-50 rounded-xl"
              >
                <FileText size={20} />
                <span>Laporan Hari Ini</span>
              </Link>
              <Link
                href="/admin"
                className="flex items-center gap-3 px-4 py-3 text-zinc-600 font-medium hover:bg-zinc-50 rounded-xl"
              >
                <LayoutDashboard size={20} />
                <span>Go to Admin Panel</span>
              </Link>

              <div className="pt-4 mt-2 border-t border-zinc-100">
                <div className="flex items-center gap-3 px-4 mb-4">
                  <div className="h-10 w-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                    {userInitials}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-zinc-900">
                      {user?.email}
                    </p>
                    <p className="text-xs text-zinc-500 uppercase">
                      {user?.role}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors"
                >
                  <LogOut size={18} />
                  <span>Exit Session</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
