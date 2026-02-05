"use client";

import { useState } from "react";

export default function ChangePasswordPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  async function submit() {
    setError(null);
    setSuccess(null);

    if (!currentPassword || !newPassword) {
      setError("Password lama dan baru wajib diisi");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Konfirmasi password tidak cocok");
      return;
    }

    setBusy(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || "Gagal ganti password");

      setSuccess("Password berhasil diperbarui");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-xl">
      <div className="bg-white border rounded-2xl shadow-sm p-6">
        <h1 className="text-xl font-semibold text-zinc-900">Change Password</h1>
        <p className="text-sm text-zinc-500 mt-1">
          Masukkan password lama, lalu password baru.
        </p>

        <div className="mt-5 space-y-3">
          <div>
            <label className="block text-xs font-medium text-zinc-600">
              Password Lama
            </label>
            <input
              type="password"
              className="w-full border rounded-lg px-3 py-2 text-sm"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              disabled={busy}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-600">
              Password Baru
            </label>
            <input
              type="password"
              className="w-full border rounded-lg px-3 py-2 text-sm"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={busy}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-600">
              Konfirmasi Password Baru
            </label>
            <input
              type="password"
              className="w-full border rounded-lg px-3 py-2 text-sm"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={busy}
            />
          </div>

          {error && (
            <div className="text-xs text-red-600 bg-red-50 border border-red-100 px-3 py-2 rounded-lg">
              {error}
            </div>
          )}

          {success && (
            <div className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 px-3 py-2 rounded-lg">
              {success}
            </div>
          )}

          <div className="pt-2">
            <button
              onClick={submit}
              disabled={busy}
              className="bg-zinc-900 text-white text-sm font-medium px-4 py-2 rounded-lg disabled:opacity-50"
            >
              Simpan Password
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
