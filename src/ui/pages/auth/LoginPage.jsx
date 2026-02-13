"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleLogin() {
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json?.error?.message || "Login failed");
        return;
      }

      const user = json.data;
      if (!user?.role) {
        setError("Login OK tapi role tidak terbaca dari response");
        return;
      }

      if (user.role === "OWNER" || user.role === "OPS") router.replace("/admin");
      else if (user.role === "CASHIER") router.replace("/pos");
      else router.replace("/");
    } catch (e) {
      setError("Unexpected error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4 py-8 text-slate-900 md:px-10">
      <div className="mx-auto grid w-full max-w-6xl items-center justify-center overflow-hidden rounded-[28px] border border-slate-200 bg-white text-center shadow-[0_24px_60px_-40px_rgba(15,23,42,0.35)] md:grid-cols-[1.05fr_0.95fr]">
        <section className="flex flex-col items-center justify-between gap-10 bg-[#0e0a07] p-8 text-white md:p-12">
          <div>
            <h1 className="mx-auto max-w-sm text-3xl font-semibold leading-tight md:text-4xl">
              Kelola penjualan dengan lebih mudah.
            </h1>
            <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-slate-200">
              Sistem Point of Sales yang membantu Anda mengelola transaksi,
              inventori, dan laporan penjualan dalam satu platform.
            </p>
          </div>

          <div className="relative flex w-full max-w-md aspect-[4/3] items-center justify-center rounded-2xl border-[3px] border-white bg-[#15110e]">
            <Image
              src="/illustrationlogin.svg"
              alt="Ilustrasi login"
              fill
              priority
              sizes="(max-width: 768px) 100vw, 420px"
              className="rounded-2xl object-contain"
            />
          </div>
        </section>

        <section className="flex flex-col items-center justify-center gap-6 p-8 md:p-12">
          <div className="flex items-center justify-center gap-2 text-sm font-semibold text-slate-900">
            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-white">
              <Image
                src="/logopos.svg"
                alt="Logo POS"
                width={40}
                height={40}
                sizes="40px"
                className="h-full w-full object-cover"
              />
            </div>
            <span className="leading-none">Simple POS</span>
          </div>

          <div>
            <h2 className="text-2xl font-semibold">Selamat Datang Kembali</h2>
            <p className="mt-1 text-sm text-slate-500">
              Silakan login ke sistem POS Anda
            </p>
          </div>

          <div className="w-full max-w-sm space-y-4 text-left">
            <div className="space-y-3">
              <input
                type="email"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-slate-300 focus:bg-white focus:ring-2 focus:ring-slate-200"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                placeholder="Email address"
              />

              <div className="flex items-center rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 transition focus-within:border-slate-300 focus-within:bg-white focus-within:ring-2 focus-within:ring-slate-200">
                <input
                  type={showPassword ? "text" : "password"}
                  className="w-full bg-transparent text-sm outline-none"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleLogin();
                  }}
                  placeholder="Password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="ml-3 inline-flex h-6 w-6 items-center justify-center text-slate-400 transition hover:text-slate-600"
                  aria-label={
                    showPassword
                      ? "Sembunyikan kata sandi"
                      : "Tampilkan kata sandi"
                  }
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                  >
                    {showPassword ? (
                      <>
                        <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6z" />
                        <circle cx="12" cy="12" r="2.5" />
                      </>
                    ) : (
                      <>
                        <path d="M3 3l18 18" />
                        <path d="M10.6 10.6a2.5 2.5 0 0 0 3.54 3.54" />
                        <path d="M5.5 5.5C3.5 7.2 2 9.5 2 12c0 0 3.5 6 10 6 2.1 0 3.9-.6 5.4-1.4" />
                        <path d="M14.2 14.2A5 5 0 0 0 9.8 9.8" />
                        <path d="M19 19c1.8-1.7 3-3.9 3-7 0 0-1.3-2.2-3.4-4.1" />
                      </>
                    )}
                  </svg>
                </button>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  className="text-xs text-slate-400 hover:text-slate-600"
                >
                  Forgot password?
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              type="button"
              onClick={handleLogin}
              disabled={loading}
              className="w-full rounded-xl border border-[#0e0a07] bg-[#0e0a07] py-2.5 text-sm font-semibold text-white transition hover:bg-[#16110d] disabled:opacity-60"
            >
              {loading ? "Logging in..." : "Masuk"}
            </button>

            {/* <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-slate-200" />
              <span className="text-xs text-slate-400">Atau masuk dengan</span>
              <div className="h-px flex-1 bg-slate-200" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                className="flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white py-2.5 text-sm font-medium text-slate-700 transition hover:border-slate-400"
              >
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-slate-400 text-[10px]">
                  G
                </span>
                Google
              </button>
              <button
                type="button"
                className="flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white py-2.5 text-sm font-medium text-slate-700 transition hover:border-slate-400"
              >
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-slate-400 text-[10px]">
                  f
                </span>
                Facebook
              </button>
            </div> */}

            <p className="text-center text-xs text-slate-500">
              Belum punya akun?{" "}
              <button type="button" className="font-semibold text-slate-900">
                Daftar sekarang
              </button>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
