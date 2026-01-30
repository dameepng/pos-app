"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("cashier@local.test");
  const [password, setPassword] = useState("password123");
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

      if (user.role === "ADMIN") router.replace("/admin");
      else if (user.role === "CASHIER") router.replace("/pos");
      else router.replace("/");
    } catch (e) {
      setError("Unexpected error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50">
      <div className="w-full max-w-md rounded-2xl border bg-white shadow-sm p-6">
        <h1 className="text-xl font-semibold">Login POS</h1>
        <p className="text-sm text-zinc-500 mt-1">Login sebagai Admin atau Cashier</p>

        <div className="mt-6 space-y-4">
          <div>
            <label className="text-xs text-zinc-500">Email</label>
            <input
              type="email"
              className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>

          <div>
            <label className="text-xs text-zinc-500">Password</label>
            <input
              type="password"
              className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleLogin();
              }}
            />
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
            className="w-full rounded-xl bg-zinc-900 text-white py-2 text-sm hover:bg-zinc-800 disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </div>

        <div className="mt-4 text-xs text-zinc-500">
          Default dev accounts:
          <ul className="list-disc ml-5 mt-1">
            <li>admin@local.test / password123</li>
            <li>cashier@local.test / password123</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
