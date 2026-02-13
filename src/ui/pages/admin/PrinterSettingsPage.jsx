"use client";

import { useEffect, useMemo, useState } from "react";

const DEFAULT_TEMPLATE = {
  storeName: "Toko Maju Terus",
  storeAddress: "Jalan Raya Serpong, RT99/99 NO. 16",
  storePhone: "08123456789",
  footerText: "Terima kasih atas kunjungan Anda",
  logoUrl:
    "https://www.designmantic.com/logo-images/166557.png?company=Company%20Name&keyword=retail&slogan=&verify=1",
};

export default function PrinterSettingsPage() {
  const [form, setForm] = useState(DEFAULT_TEMPLATE);
  const [logoFile, setLogoFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savedAt, setSavedAt] = useState("");

  async function loadSettings() {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/printer-settings");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || "Gagal load settings");

      setForm({
        storeName: json.data?.storeName || "",
        storeAddress: json.data?.storeAddress || "",
        storePhone: json.data?.storePhone || "",
        footerText: json.data?.footerText || "",
        logoUrl: json.data?.logoUrl || "",
      });
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSettings();
  }, []);

  async function uploadLogo() {
    if (!logoFile) return;

    setUploadingLogo(true);
    setError("");
    setSavedAt("");
    try {
      const fd = new FormData();
      fd.append("file", logoFile);

      const res = await fetch("/api/admin/printer-settings/logo", {
        method: "POST",
        body: fd,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || "Gagal upload logo");

      setForm((prev) => ({
        ...prev,
        logoUrl: json.data?.logoUrl || prev.logoUrl,
      }));
      setLogoFile(null);
      setSavedAt(new Date().toLocaleTimeString("id-ID"));
    } catch (e) {
      setError(e.message);
    } finally {
      setUploadingLogo(false);
    }
  }

  async function onSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setSavedAt("");

    try {
      const res = await fetch("/api/admin/printer-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || "Gagal simpan settings");

      setForm({
        storeName: json.data?.storeName || "",
        storeAddress: json.data?.storeAddress || "",
        storePhone: json.data?.storePhone || "",
        footerText: json.data?.footerText || "",
        logoUrl: json.data?.logoUrl || "",
      });
      setSavedAt(new Date().toLocaleTimeString("id-ID"));
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  const preview = useMemo(
    () => ({
      storeName: form.storeName || "Nama Toko",
      storeAddress: form.storeAddress || "Alamat Toko",
      storePhone: form.storePhone || "No. Telepon",
      footerText: form.footerText || "Terima kasih atas kunjungan Anda",
      logoUrl: form.logoUrl || "",
    }),
    [form]
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <form onSubmit={onSubmit} className="bg-white border rounded-2xl shadow-sm p-5">
          <h1 className="text-lg font-semibold text-zinc-900">Printer Settings</h1>
          <p className="text-xs text-zinc-500 mt-1">
            Atur template struk untuk semua transaksi POS.
          </p>

          <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-zinc-700 mb-1">
                Logo URL
              </label>
              <input
                className="w-full border rounded-lg px-3 py-2 text-sm"
                value={form.logoUrl}
                onChange={(e) => setForm((prev) => ({ ...prev, logoUrl: e.target.value }))}
                placeholder="https://example.com/logo.png"
                disabled={loading || busy || uploadingLogo}
              />
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/avif,image/svg+xml"
                  onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                  disabled={loading || busy || uploadingLogo}
                  className="text-xs"
                />
                <button
                  type="button"
                  onClick={uploadLogo}
                  disabled={!logoFile || loading || busy || uploadingLogo}
                  className="border text-xs font-medium px-3 py-1.5 rounded-lg disabled:opacity-50"
                >
                  {uploadingLogo ? "Uploading..." : "Upload dari PC"}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">
                Nama Toko
              </label>
              <input
                className="w-full border rounded-lg px-3 py-2 text-sm"
                value={form.storeName}
                onChange={(e) => setForm((prev) => ({ ...prev, storeName: e.target.value }))}
                placeholder="Nama toko"
                disabled={loading || busy || uploadingLogo}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">
                Nomor Telepon
              </label>
              <input
                className="w-full border rounded-lg px-3 py-2 text-sm"
                value={form.storePhone}
                onChange={(e) => setForm((prev) => ({ ...prev, storePhone: e.target.value }))}
                placeholder="08xxxxxxxxxx"
                disabled={loading || busy || uploadingLogo}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-zinc-700 mb-1">
                Alamat Toko
              </label>
              <textarea
                className="w-full border rounded-lg px-3 py-2 text-sm min-h-20"
                value={form.storeAddress}
                onChange={(e) => setForm((prev) => ({ ...prev, storeAddress: e.target.value }))}
                placeholder="Alamat lengkap toko"
                disabled={loading || busy || uploadingLogo}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-zinc-700 mb-1">
                Footer Text
              </label>
              <textarea
                className="w-full border rounded-lg px-3 py-2 text-sm min-h-20"
                value={form.footerText}
                onChange={(e) => setForm((prev) => ({ ...prev, footerText: e.target.value }))}
                placeholder="Terima kasih sudah berbelanja"
                disabled={loading || busy || uploadingLogo}
              />
            </div>
          </div>

          {error ? (
            <div className="mt-4 text-xs text-red-600 bg-red-50 border border-red-100 px-3 py-2 rounded-lg">
              {error}
            </div>
          ) : null}

          {savedAt ? (
            <div className="mt-4 text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 px-3 py-2 rounded-lg">
              Template berhasil disimpan ({savedAt}).
            </div>
          ) : null}

          <div className="mt-5 flex gap-2">
            <button
              type="submit"
              disabled={loading || busy || uploadingLogo}
              className="bg-zinc-900 text-white text-sm font-medium px-4 py-2 rounded-lg disabled:opacity-50"
            >
              {busy ? "Menyimpan..." : "Simpan Template"}
            </button>
            <button
              type="button"
              onClick={loadSettings}
              disabled={loading || busy || uploadingLogo}
              className="border text-sm font-medium px-4 py-2 rounded-lg disabled:opacity-50"
            >
              Reload
            </button>
          </div>
        </form>
      </div>

      <div className="lg:col-span-1">
        <div className="bg-white border rounded-2xl shadow-sm p-5">
          <h2 className="text-sm font-semibold text-zinc-900">Preview Struk</h2>
          <p className="text-xs text-zinc-500 mt-1">Contoh hasil header dan footer.</p>

          <div className="mt-4 rounded-xl border border-dashed p-4 bg-zinc-50 font-mono text-xs text-zinc-800">
            {preview.logoUrl ? (
              <img
                src={preview.logoUrl}
                alt="Preview logo"
                className="h-12 mx-auto object-contain mb-2"
              />
            ) : null}
            <div className="text-center font-bold">{preview.storeName}</div>
            <div className="text-center text-zinc-600 mt-1">{preview.storeAddress}</div>
            <div className="text-center text-zinc-600">{preview.storePhone}</div>
            <div className="border-t border-dashed mt-3 pt-3">
              <div className="text-zinc-500">Tanggal: 13 Feb 2026 12:00</div>
              <div className="text-zinc-500">Kasir: Demo</div>
              <div className="text-zinc-500">Item: 1x Contoh Produk</div>
              <div className="text-zinc-500">Total: Rp 10.000</div>
            </div>
            <div className="border-t border-dashed mt-3 pt-3 text-center text-zinc-600">
              {preview.footerText}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
