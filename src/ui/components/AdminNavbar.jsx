"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Package,
  Tags,
  FileBarChart,
  LogOut,
  Menu,
  X,
  Command,
  Monitor,
  Users,
  KeyRound,
} from "lucide-react";

export default function AdminNavbar({ user }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/pos", label: "Open POS", icon: Monitor },
    { href: "/admin/products", label: "Products", icon: Package },
    { href: "/admin/categories", label: "Categories", icon: Tags },
    { href: "/admin/users", label: "Users", icon: Users },
    { href: "/admin/change-password", label: "Change Password", icon: KeyRound },
    { href: "/admin/reports", label: "Reports", icon: FileBarChart },
  ];

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
    : "AD";

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-zinc-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <Link href="/admin" className="flex items-center gap-2.5 group">
            <div className="bg-zinc-900 text-white p-1.5 rounded-lg group-hover:bg-zinc-800 transition-colors">
              <Command size={20} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-sm font-bold text-zinc-900 tracking-tight leading-none">
                POS Admin
              </h1>
              <p className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">
                Management
              </p>
            </div>
          </Link>

          {/* DESKTOP NAVIGATION */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(item.href);

              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "text-zinc-900 bg-zinc-100 shadow-sm"
                      : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50"
                  }`}
                >
                  <Icon
                    size={18}
                    strokeWidth={isActive ? 2.5 : 2}
                    className={isActive ? "text-zinc-900" : "text-zinc-400"}
                  />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* User Menu & Logout */}
          <div className="hidden md:flex items-center gap-4 pl-4 border-l border-zinc-200">
            <div className="flex items-center gap-3">
              <div className="text-right hidden lg:block">
                <p className="text-sm font-semibold text-zinc-900 leading-none">
                  {user?.email?.split("@")[0]}
                </p>
                <p className="text-xs text-zinc-500 mt-1 capitalize">
                  {user?.role || "Admin"}
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
            className="md:hidden p-2 text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* 2. MOBILE MENU */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-zinc-100 bg-white absolute left-0 right-0 shadow-lg pb-4 px-4 animate-in slide-in-from-top-2 duration-200">
            <div className="py-3 space-y-1">
              {navItems.map((item) => {
                const isActive =
                  item.href === "/admin"
                    ? pathname === "/admin"
                    : pathname.startsWith(item.href);

                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-zinc-100 text-zinc-900"
                        : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
                    }`}
                  >
                    <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>

            <div className="pt-3 border-t border-zinc-100 mt-2">
              <div className="flex items-center gap-3 px-3 mb-4">
                <div className="h-10 w-10 rounded-full bg-zinc-900 text-white flex items-center justify-center text-sm font-bold shadow-sm">
                  {userInitials}
                </div>
                <div>
                  <p className="text-sm font-semibold text-zinc-900">
                    {user?.email}
                  </p>
                  <p className="text-xs text-zinc-500 capitalize">
                    {user?.role}
                  </p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
              >
                <LogOut size={18} />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
