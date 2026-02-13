"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

export default function UsersAdminPage() {
  const [q, setQ] = useState("");
  const [data, setData] = useState({ items: [], total: 0, take: 20, skip: 0 });
  const [busy, setBusy] = useState(false);
  const [createBusy, setCreateBusy] = useState(false);
  const [error, setError] = useState(null);
  const [createError, setCreateError] = useState(null);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ email: "", role: "CASHIER", password: "" });
  const [createForm, setCreateForm] = useState({
    name: "",
    email: "",
    role: "CASHIER",
    password: "",
  });
  const [currentUser, setCurrentUser] = useState(null);

  const isSelfSelected = selected?.id && currentUser?.id && selected.id === currentUser.id;

  const loadUsers = useCallback(async ({ skip = 0, qOverride = "" } = {}) => {
    setError(null);
    const params = new URLSearchParams();
    const searchText = String(qOverride).trim();
    if (searchText) params.set("q", searchText);
    params.set("take", "20");
    params.set("skip", String(skip));

    try {
      const res = await fetch(`/api/admin/users?${params.toString()}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || "Failed load users");
      setData(json.data);
    } catch (e) {
      setError(e.message);
    }
  }, []);

  async function loadCurrentUser() {
    try {
      const res = await fetch("/api/auth/me");
      const json = await res.json();
      if (res.ok) setCurrentUser(json.data || null);
    } catch {
      setCurrentUser(null);
    }
  }

  useEffect(() => {
    loadUsers({ skip: 0, qOverride: "" });
    loadCurrentUser();
  }, [loadUsers]);

  useEffect(() => {
    const t = setTimeout(() => loadUsers({ skip: 0, qOverride: q }), 300);
    return () => clearTimeout(t);
  }, [q, loadUsers]);

  function resetForm() {
    setSelected(null);
    setForm({ email: "", role: "CASHIER", password: "" });
  }

  function edit(user) {
    setSelected(user);
    setForm({ email: user.email || "", role: user.role || "CASHIER", password: "" });
  }

  async function submit() {
    if (!selected) return;
    setBusy(true);
    setError(null);

    try {
      const payload = {};
      if (form.email && form.email !== selected.email) payload.email = form.email;
      if (form.role && form.role !== selected.role) payload.role = form.role;
      if (form.password) payload.password = form.password;

      const res = await fetch(`/api/admin/users/${selected.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || "Failed update user");

      resetForm();
      await loadUsers({ skip: data.skip });
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function submitCreate() {
    setCreateBusy(true);
    setCreateError(null);

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createForm),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || "Failed create user");

      setCreateForm({ name: "", email: "", role: "CASHIER", password: "" });
      await loadUsers({ skip: 0 });
    } catch (e) {
      setCreateError(e.message);
    } finally {
      setCreateBusy(false);
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1 space-y-4">
        <div className="bg-white border rounded-2xl shadow-sm p-5">
          <h2 className="text-lg font-semibold text-zinc-900">Tambah User</h2>
          <p className="text-xs text-zinc-500 mt-1">
            Owner bisa membuat akun role CASHIER atau OPS.
          </p>

          <div className="mt-4 space-y-3">
            <label className="block text-xs font-medium text-zinc-600">
              Nama
            </label>
            <input
              className="w-full border rounded-lg px-3 py-2 text-sm"
              value={createForm.name}
              onChange={(e) =>
                setCreateForm((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="Nama user"
              disabled={createBusy}
            />

            <label className="block text-xs font-medium text-zinc-600">
              Email
            </label>
            <input
              className="w-full border rounded-lg px-3 py-2 text-sm"
              value={createForm.email}
              onChange={(e) =>
                setCreateForm((prev) => ({ ...prev, email: e.target.value }))
              }
              placeholder="user@email.com"
              disabled={createBusy}
            />

            <label className="block text-xs font-medium text-zinc-600">
              Role
            </label>
            <select
              className="w-full border rounded-lg px-3 py-2 text-sm"
              value={createForm.role}
              onChange={(e) =>
                setCreateForm((prev) => ({ ...prev, role: e.target.value }))
              }
              disabled={createBusy}
            >
              <option value="CASHIER">CASHIER</option>
              <option value="OPS">OPS</option>
            </select>

            <label className="block text-xs font-medium text-zinc-600">
              Password
            </label>
            <input
              type="password"
              className="w-full border rounded-lg px-3 py-2 text-sm"
              value={createForm.password}
              onChange={(e) =>
                setCreateForm((prev) => ({ ...prev, password: e.target.value }))
              }
              placeholder="Minimal 8 karakter"
              disabled={createBusy}
            />

            {createError && (
              <div className="text-xs text-red-600 bg-red-50 border border-red-100 px-3 py-2 rounded-lg">
                {createError}
              </div>
            )}

            <div className="pt-2">
              <button
                onClick={submitCreate}
                disabled={createBusy}
                className="w-full bg-zinc-900 text-white text-sm font-medium px-4 py-2 rounded-lg disabled:opacity-50"
              >
                {createBusy ? "Menyimpan..." : "Tambah User"}
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white border rounded-2xl shadow-sm p-5">
          <h2 className="text-lg font-semibold text-zinc-900">Kelola User</h2>
          <p className="text-xs text-zinc-500 mt-1">
            Pilih user di daftar untuk ubah email, role, atau reset password.
          </p>

          {isSelfSelected && (
            <div className="mt-3 text-xs text-amber-700 bg-amber-50 border border-amber-100 px-3 py-2 rounded-lg">
              Untuk ubah password akun sendiri, gunakan halaman
              <Link href="/admin/change-password" className="underline ml-1">
                Change Password
              </Link>.
            </div>
          )}

          <div className="mt-4 space-y-3">
            <label className="block text-xs font-medium text-zinc-600">
              Email
            </label>
            <input
              className="w-full border rounded-lg px-3 py-2 text-sm"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="user@email.com"
              disabled={!selected || busy}
            />

            <label className="block text-xs font-medium text-zinc-600">
              Role
            </label>
            <select
              className="w-full border rounded-lg px-3 py-2 text-sm"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              disabled={!selected || busy}
            >
              <option value="CASHIER">CASHIER</option>
              <option value="OPS">OPS</option>
              <option value="OWNER">OWNER</option>
            </select>

            <label className="block text-xs font-medium text-zinc-600">
              Password Baru (opsional)
            </label>
            <input
              type="password"
              className="w-full border rounded-lg px-3 py-2 text-sm"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Minimal 8 karakter"
              disabled={!selected || busy || isSelfSelected}
            />

            {error && (
              <div className="text-xs text-red-600 bg-red-50 border border-red-100 px-3 py-2 rounded-lg">
                {error}
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button
                onClick={submit}
                disabled={!selected || busy}
                className="flex-1 bg-zinc-900 text-white text-sm font-medium px-4 py-2 rounded-lg disabled:opacity-50"
              >
                Simpan
              </button>
              <button
                onClick={resetForm}
                disabled={busy}
                className="flex-1 border text-sm font-medium px-4 py-2 rounded-lg"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="lg:col-span-2 space-y-4">
        <div className="bg-white border rounded-2xl shadow-sm p-4">
          <div className="flex items-center gap-2">
            <input
              className="flex-1 border rounded-lg px-3 py-2 text-sm"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Cari nama atau email..."
            />
          </div>
        </div>

        <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b text-sm font-semibold text-zinc-900">
            Daftar User ({data.total || 0})
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-zinc-50 border-b">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-zinc-600">
                    Nama
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-zinc-600">
                    Email
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-zinc-600">
                    Role
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-zinc-600">
                    Force Change
                  </th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-zinc-600">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {data.items.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-sm text-zinc-500">
                      Tidak ada user
                    </td>
                  </tr>
                ) : (
                  data.items.map((u) => (
                    <tr key={u.id} className="hover:bg-zinc-50">
                      <td className="px-5 py-4 text-sm text-zinc-900">{u.name}</td>
                      <td className="px-5 py-4 text-sm text-zinc-600">{u.email}</td>
                      <td className="px-5 py-4 text-xs">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-zinc-100 text-zinc-700 font-medium">
                          {u.role}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-xs text-zinc-600">
                        {u.mustChangePassword ? "Yes" : "No"}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => edit(u)}
                          className="text-xs font-medium text-blue-600 hover:text-blue-700"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="px-5 py-3 border-t flex items-center justify-between text-xs text-zinc-600">
            <span>
              Menampilkan {data.items.length} dari {data.total} user
            </span>
            <div className="flex gap-2">
              <button
                className="border px-3 py-1 rounded disabled:opacity-50"
                onClick={() => loadUsers({ skip: Math.max(0, data.skip - data.take) })}
                disabled={data.skip === 0}
              >
                Prev
              </button>
              <button
                className="border px-3 py-1 rounded disabled:opacity-50"
                onClick={() => loadUsers({ skip: data.skip + data.take })}
                disabled={data.skip + data.take >= data.total}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
