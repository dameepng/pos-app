import jsPDF from "jspdf";
import html2canvas from "html2canvas";

function formatRp(n) {
  return `Rp ${Number(n || 0).toLocaleString("id-ID")}`;
}

function formatDateTime(dateString) {
  const d = new Date(dateString);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export async function downloadInvoice(data) {
  const {
    storeName = "TOKO RETAIL MODERN",
    storeAddress = "Jl. Raya Utama No. 123, Jakarta",
    storePhone = "021-12345678",
    logoUrl,
    saleId = "-",
    createdAt = new Date(),
    customerName = "Pelanggan Umum",
    cashierName = "-",
    items = [],
    total = 0,
    paymentMethod = "CASH",
    paidAmount = 0,
    change = 0,
  } = data;

  const container = document.createElement("div");
  container.style.position = "absolute";
  container.style.left = "-9999px";
  container.style.top = "0";
  container.style.width = "210mm";
  container.style.backgroundColor = "#ffffff";
  container.style.fontFamily = "'Georgia', serif";
  container.style.color = "#111";

  const dateObj = new Date(createdAt);
  const dateFormatted = dateObj.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  const timeFormatted = dateObj.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const rows = items
    .map(
      (item) => `
    <tr>
      <td style="padding: 14px 0; font-size: 13px; color: #111; border-bottom: 1px solid #ddd;">
        ${item.name || item.product?.name || "-"}
        ${item.product?.sku ? `<div style="font-size: 11px; color: #999; margin-top: 2px;">${item.product.sku}</div>` : ""}
      </td>
      <td style="padding: 14px 0; font-size: 13px; text-align: center; color: #111; border-bottom: 1px solid #ddd;">${item.qty}</td>
      <td style="padding: 14px 0; font-size: 13px; text-align: right; color: #111; border-bottom: 1px solid #ddd;">${formatRp(item.price)}</td>
      <td style="padding: 14px 0; font-size: 13px; text-align: right; font-weight: 700; color: #111; border-bottom: 1px solid #ddd;">${formatRp(item.subtotal || item.qty * item.price)}</td>
    </tr>
  `
    )
    .join("");

  container.innerHTML = `
    <div style="padding: 20mm 22mm 18mm;">

      <!-- HEADER: INVOICE kiri, logo kanan -->
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 48px;">
        <div style="font-size: 42px; font-weight: 900; letter-spacing: -1px; color: #111; text-transform: uppercase; font-family: 'Georgia', serif; line-height: 1; height: 56px; display: flex; align-items: center;">INVOICE</div>
        <div style="height: 56px; display: flex; align-items: center;">
          ${logoUrl
      ? `<img src="${logoUrl}" style="height: 80px; width: auto; max-width: 180px; object-fit: contain; filter: grayscale(1) contrast(1.3); margin-top: 42px;" />`
      : `<div style="font-size: 42px; font-weight: 900; color: #111; line-height: 1; font-family: 'Georgia', serif;">&amp;</div>`
    }
        </div>
      </div>

      <!-- BILLED TO + INVOICE INFO -->
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px;">
        <div>
          <div style="font-size: 12px; font-weight: 700; color: #111; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">Kepada:</div>
          <div style="font-size: 14px; font-weight: 700; color: #111; margin-bottom: 4px;">${customerName}</div>
          <div style="font-size: 13px; color: #555; line-height: 1.7;">
            Kasir: ${cashierName}<br/>
            Metode: ${paymentMethod}
          </div>
        </div>
        <div style="text-align: right; font-size: 13px; color: #555; line-height: 1.9;">
          <div>Invoice No. ${String(saleId).slice(0, 8).toUpperCase()}</div>
          <div>${dateFormatted}, ${timeFormatted}</div>
        </div>
      </div>

      <!-- DIVIDER -->
      <div style="border-top: 1.5px solid #111; margin-bottom: 0;"></div>

      <!-- ITEMS TABLE -->
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 8px;">
        <thead>
          <tr style="border-bottom: 1px solid #ddd;">
            <th style="padding: 12px 0; text-align: left; font-size: 12px; font-weight: 700; color: #111;">Item</th>
            <th style="padding: 12px 0; text-align: center; font-size: 12px; font-weight: 700; color: #111;">Qty</th>
            <th style="padding: 12px 0; text-align: right; font-size: 12px; font-weight: 700; color: #111;">Harga Satuan</th>
            <th style="padding: 12px 0; text-align: right; font-size: 12px; font-weight: 700; color: #111;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>

      <!-- TOTALS -->
      <div style="display: flex; justify-content: flex-end; margin-top: 16px; margin-bottom: 48px;">
        <div style="width: 220px;">
          <div style="display: flex; justify-content: space-between; font-size: 13px; color: #555; padding: 6px 0;">
            <span>Subtotal</span><span>${formatRp(total)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 13px; color: #555; padding: 6px 0;">
            <span>Dibayar</span><span>${formatRp(paidAmount)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 13px; color: #555; padding: 6px 0; border-bottom: 1px solid #ccc; margin-bottom: 8px;">
            <span>Kembali</span><span>${formatRp(change)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 18px; font-weight: 900; color: #111; padding: 6px 0;">
            <span>Total</span><span>${formatRp(total)}</span>
          </div>
        </div>
      </div>

      <!-- THANK YOU -->
      <div style="font-size: 28px; color: #111; font-family: 'Georgia', serif; margin-bottom: 40px;">Terima kasih!</div>

      <!-- FOOTER -->
      <div style="border-top: 1px solid #ccc; padding-top: 20px; display: flex; justify-content: space-between; align-items: flex-end;">
        <div>
          <div style="font-size: 11px; font-weight: 700; color: #111; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px;">Informasi Toko</div>
          <div style="font-size: 12px; color: #555; line-height: 1.7;">
            ${storeName}<br/>
            ${storeAddress}<br/>
            ${storePhone}
          </div>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 15px; font-weight: 700; font-style: italic; color: #111; font-family: 'Georgia', serif;">${storeName}</div>
          <div style="font-size: 11px; color: #777; margin-top: 4px;">Barang yang dibeli tidak dapat ditukar atau dikembalikan.</div>
        </div>
      </div>

    </div>
  `;

  document.body.appendChild(container);

  try {
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
    });

    const imgData = canvas.toDataURL("image/jpeg", 0.95);
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`Invoice-${saleId}.pdf`);
  } catch (error) {
    console.error("Failed to generate PDF", error);
    alert("Gagal mengunduh invoice. Silakan coba lagi.");
  } finally {
    document.body.removeChild(container);
  }
}