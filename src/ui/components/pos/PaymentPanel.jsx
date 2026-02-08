"use client";

import { useEffect, useMemo, useState } from "react";
import { printReceipt } from "@/ui/utils/printReceipt";

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function formatRp(n) {
  return `Rp ${Number(n || 0).toLocaleString("id-ID")}`;
}

export default function PaymentPanel({
  cartItems,
  total,
  sale,
  setSale,
  onClear,
  onPaidSuccess,
  customerName,
}) {
  const [paidAmount, setPaidAmount] = useState("");
  const paidNumber = useMemo(() => Number(paidAmount || 0), [paidAmount]);

  const [busy, setBusy] = useState(false);

  const [midtransUrl, setMidtransUrl] = useState(null);
  const [midtransOrderId, setMidtransOrderId] = useState(null);
  const [midtransGrossAmount, setMidtransGrossAmount] = useState(null);

  const [pollSaleId, setPollSaleId] = useState(null);
  const [lastReceipt, setLastReceipt] = useState(null);
  const [printPrompt, setPrintPrompt] = useState(null);

  async function createSaleIfNeeded() {
    if (sale?.saleId) return sale;

    const cleanCustomerName = String(customerName || "").trim();
    const body = {
      items: cartItems.map((it) => ({ productId: it.id, qty: it.qty })),
      customerName: cleanCustomerName || null,
    };

    const res = await fetch("/api/sales", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const json = await res.json();
    if (!res.ok) throw new Error(json.error?.message || "Failed create sale");

    setSale(json.data);
    return json.data;
  }

  function resetPaymentState() {
    setMidtransUrl(null);
    setMidtransOrderId(null);
    setMidtransGrossAmount(null);
    setPollSaleId(null);
  }

  async function fetchSaleDetail(saleId) {
    const res = await fetch(`/api/sales/${saleId}`);
    const json = await res.json();
    if (!res.ok) throw new Error(json.error?.message || "Failed load sale");
    return json.data;
  }

  async function prepareReceipt({
    saleId,
    paymentMethod,
    paidAmount,
    change,
  }) {
    try {
      const detail = await fetchSaleDetail(saleId);
      const totalAmount = Number(detail?.total || 0);
      const paid = Number.isFinite(paidAmount) ? paidAmount : totalAmount;
      const changeAmount =
        Number.isFinite(change) ? change : Math.max(0, paid - totalAmount);

      const payload = {
        saleId: detail?.saleId || saleId,
        createdAt: detail?.createdAt,
        customerName: detail?.customerName,
        cashierName: detail?.cashier?.name,
        items: detail?.items || [],
        total: totalAmount,
        paymentMethod:
          paymentMethod || detail?.payments?.[0]?.method || "N/A",
        paidAmount: paid,
        change: changeAmount,
      };

      setLastReceipt(payload);
      setPrintPrompt(payload);
    } catch (e) {
      console.error(e);
      alert(e.message || "Gagal cetak struk");
    }
  }

  async function payCash() {
    if (cartItems.length === 0) return alert("Cart kosong");
    if (!Number.isFinite(paidNumber) || paidNumber <= 0)
      return alert("Masukkan uang diterima yang valid");
    if (paidNumber < total) return alert("Uang diterima kurang dari total");

    setBusy(true);
    try {
      const currentSale = await createSaleIfNeeded();

      const res = await fetch(`/api/sales/${currentSale.saleId}/pay-cash`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paidAmount: paidNumber }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || "Payment failed");

      await prepareReceipt({
        saleId: currentSale.saleId,
        paymentMethod: "CASH",
        paidAmount: paidNumber,
        change: Number(json.data?.change || 0),
      });

      alert(`Pembayaran sukses. Kembalian: ${formatRp(json.data.change)}`);
      onClear();
      onPaidSuccess?.();
      setPaidAmount("");
      resetPaymentState();
    } catch (e) {
      alert(e.message || "Error");
    } finally {
      setBusy(false);
    }
  }

  async function payMidtrans() {
    if (cartItems.length === 0) return alert("Cart kosong");

    setBusy(true);
    try {
      const currentSale = await createSaleIfNeeded();

      const res = await fetch(`/api/sales/${currentSale.saleId}/pay-qris`, {
        method: "POST",
      });
      const json = await res.json();
      if (!res.ok)
        throw new Error(
          json.error?.message || "Failed create Midtrans payment",
        );

      const url =
        json.data.qrisUrl || json.data.redirectUrl || json.data.redirect_url;
      if (!url)
        throw new Error("Midtrans redirect_url tidak ditemukan di response");

      const orderId =
        json.data.providerRef || json.data.orderId || json.data.order_id;
      if (!orderId)
        throw new Error("providerRef/orderId tidak ditemukan di response");

      setMidtransUrl(url);
      setMidtransOrderId(orderId);
      setMidtransGrossAmount(total);
      setPollSaleId(currentSale.saleId);

      window.open(url, "_blank", "noopener,noreferrer");
    } catch (e) {
      alert(e.message || "Error");
    } finally {
      setBusy(false);
    }
  }

  async function simulateSettlement() {
    if (!midtransOrderId || !midtransGrossAmount) {
      alert("Jalankan Pay QRIS (Midtrans) dulu.");
      return;
    }

    setBusy(true);
    try {
      const res = await fetch("/api/dev/simulate-midtrans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: midtransOrderId,
          grossAmount: midtransGrossAmount,
        }),
      });

      const json = await res.json();
      if (!res.ok)
        throw new Error(json.error?.message || "Simulate settlement failed");

      alert("Simulator settlement sukses.");
    } catch (e) {
      alert(e.message || "Error");
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      if (!pollSaleId) return;

      for (let i = 0; i < 60; i++) {
        if (cancelled) return;

        const res = await fetch(`/api/sales/${pollSaleId}`);
        const json = await res.json();

        if (res.ok && json.data?.status === "PAID") {
          alert("Pembayaran terkonfirmasi. Silakan cetak struk.");
          await prepareReceipt({
            saleId: pollSaleId,
            paymentMethod: "QRIS",
          });
          onClear();
          onPaidSuccess?.();
          setPaidAmount("");
          resetPaymentState();
          return;
        }

        await sleep(2000);
      }
    }

    poll();
    return () => {
      cancelled = true;
    };
  }, [pollSaleId, onClear]);

  const change = Math.max(0, paidNumber - total);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-sm text-zinc-600">Total</div>
        <div className="text-sm font-semibold">{formatRp(total)}</div>
      </div>

      <div>
        <label className="text-xs text-zinc-500">Cash received</label>
        <input
          type="number"
          value={paidAmount}
          onChange={(e) => setPaidAmount(e.target.value)}
          placeholder="Contoh: 20000"
          className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
          disabled={busy}
        />
        <div className="mt-2 flex items-center justify-between text-sm">
          <span className="text-zinc-500">Change</span>
          <span className="font-semibold">{formatRp(change)}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={payCash}
          disabled={busy || cartItems.length === 0}
          className="rounded-xl bg-zinc-900 text-white px-3 py-2 text-sm hover:bg-zinc-800 disabled:opacity-50"
        >
          Pay Cash
        </button>

        <button
          onClick={payMidtrans}
          disabled={busy || cartItems.length === 0}
          className="rounded-xl border px-3 py-2 text-sm hover:bg-zinc-50 disabled:opacity-50"
        >
          Pay QRIS (Midtrans)
        </button>
      </div>

      {process.env.NODE_ENV !== "production" && (
        <button
          onClick={simulateSettlement}
          disabled={busy || !midtransOrderId}
          className="w-full rounded-xl border px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
          title="Dev only"
        >
          DEV: Simulate Settlement
        </button>
      )}

      {midtransUrl && (
        <div className="rounded-xl border bg-zinc-50 p-3 text-xs text-zinc-700">
          <div className="font-medium">Midtrans Payment</div>
          <div className="mt-1 break-all">
            OrderId: <span className="font-semibold">{midtransOrderId}</span>
          </div>
          <a
            className="mt-2 inline-block underline"
            href={midtransUrl}
            target="_blank"
            rel="noreferrer"
          >
            Open payment page
          </a>
        </div>
      )}

      {printPrompt && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
          <div className="font-medium">Struk siap dicetak</div>
          <div className="mt-1">Klik Print untuk mencetak sekarang.</div>
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={() => {
                printReceipt(printPrompt);
                setPrintPrompt(null);
              }}
              className="rounded-lg bg-zinc-900 text-white px-3 py-1.5 text-xs"
            >
              Print
            </button>
            <button
              type="button"
              onClick={() => setPrintPrompt(null)}
              className="rounded-lg border px-3 py-1.5 text-xs"
            >
              Batal
            </button>
          </div>
        </div>
      )}

      {lastReceipt && (
        <button
          type="button"
          onClick={() => printReceipt(lastReceipt)}
          className="w-full rounded-xl border px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50"
        >
          Print Struk Terakhir
        </button>
      )}
    </div>
  );
}
