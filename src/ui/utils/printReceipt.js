function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatRp(n) {
  return `Rp ${Number(n || 0).toLocaleString("id-ID")}`;
}

function formatDateTime(dateString) {
  const d = new Date(dateString);
  if (Number.isNaN(d.getTime())) return "-";
  const date = d.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const time = d.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${date} ${time}`;
}

function code39Pattern(ch) {
  const patterns = {
    "0": "nnnwwnwnn",
    "1": "wnnwnnnnw",
    "2": "nnwwnnnnw",
    "3": "wnwwnnnnn",
    "4": "nnnwwnnnw",
    "5": "wnnwwnnnn",
    "6": "nnwwwnnnn",
    "7": "nnnwnnwnw",
    "8": "wnnwnnwnn",
    "9": "nnwwnnwnn",
    A: "wnnnnwnnw",
    B: "nnwnnwnnw",
    C: "wnwnnwnnn",
    D: "nnnnwwnnw",
    E: "wnnnwwnnn",
    F: "nnwnwwnnn",
    G: "nnnnnwwnw",
    H: "wnnnnwwnn",
    I: "nnwnnwwnn",
    J: "nnnnwwwnn",
    K: "wnnnnnnww",
    L: "nnwnnnnww",
    M: "wnwnnnnwn",
    N: "nnnnwnnww",
    O: "wnnnwnnwn",
    P: "nnwnwnnwn",
    Q: "nnnnnnwww",
    R: "wnnnnnwwn",
    S: "nnwnnnwwn",
    T: "nnnnwnwwn",
    U: "wwnnnnnnw",
    V: "nwwnnnnnw",
    W: "wwwnnnnnn",
    X: "nwnnwnnnw",
    Y: "wwnnwnnnn",
    Z: "nwwnwnnnn",
    "-": "nwnnnnwnw",
    ".": "wwnnnnwnn",
    " ": "nwwnnnwnn",
    $: "nwnwnwnnn",
    "/": "nwnwnnnwn",
    "+": "nwnnnwnwn",
    "%": "nnnwnwnwn",
    "*": "nwnnwnwnn",
  };
  return patterns[ch] || null;
}

function buildCode39Svg(value) {
  const data = `*${String(value || "").toUpperCase()}*`;
  const narrow = 1;
  const wide = 3;
  const height = 38;
  const quiet = 8;
  let x = 0;
  let svgBars = "";

  for (const ch of data) {
    const pattern = code39Pattern(ch);
    if (!pattern) continue;

    for (let i = 0; i < pattern.length; i += 1) {
      const isBar = i % 2 === 0;
      const isWide = pattern[i] === "w";
      const width = isWide ? wide : narrow;

      if (isBar) {
        svgBars += `<rect x="${x}" y="0" width="${width}" height="${height}" fill="#111" />`;
      }

      x += width;
    }

    x += narrow;
  }

  const svgWidth = Math.max(x + quiet * 2, 1);
  const viewBoxWidth = Math.max(x, 1);
  const offsetX = quiet;
  svgBars = svgBars.replace(/x="(\d+)"/g, (_, val) => `x="${Number(val) + offsetX}"`);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${svgWidth}" height="${height}" viewBox="0 0 ${svgWidth} ${height}">${svgBars}</svg>`;
}

export function printReceipt({
  storeName = "Toko Maju Terus",
  storeAddress = "Jalan Raya Serpong, RT99/99 NO. 16",
  storePhone = "08123456789",
  footerText = "Terima kasih atas kunjungan Anda",
  logoUrl = "https://www.designmantic.com/logo-images/166557.png?company=Company%20Name&keyword=retail&slogan=&verify=1",
  saleId,
  createdAt,
  customerName,
  cashierName,
  items = [],
  total = 0,
  paymentMethod = "N/A",
  paidAmount = 0,
  change = 0,
  barcodeValue,
}) {
  const barcodeText = barcodeValue || saleId || "";
  const barcodeSvg = barcodeText ? buildCode39Svg(barcodeText) : "";

  const rows = items
    .map((item) => {
      const name = escapeHtml(item?.name || item?.product?.name || "-");
      const qty = Number(item?.qty || 0);
      const price = Number(item?.price || 0);
      const subtotal = Number(item?.subtotal || qty * (item?.price || 0));
      return `
        <tr>
          <td class="item-name">${name}</td>
          <td class="item-qty">${qty}</td>
          <td class="item-price">${price}</td>
          <td class="item-subtotal">${subtotal}</td>
        </tr>
      `;
    })
    .join("");

  const html = `
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Struk</title>
    <style>
      @page { size: 80mm auto; margin: 6mm; }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        width: 80mm;
        font-family: "Courier New", monospace;
        color: #111;
      }
      .logo {
        display: block;
        margin: 0 auto 6px;
        max-width: 42mm;
        max-height: 24mm;
        object-fit: contain;
      }
      .center { text-align: center; }
      .muted { color: #666; }
      .section { margin-top: 10px; }
      .divider { border-top: 1px dashed #999; margin: 10px 0; }
      h1 { font-size: 16px; margin: 0 0 4px; }
      .meta { font-size: 11px; line-height: 1.4; }
      table { width: 100%; border-collapse: collapse; font-size: 11px; }
      th { text-align: left; padding: 4px 0; border-bottom: 1px solid #ddd; }
      td { padding: 4px 0; vertical-align: top; }
      .item-qty, .item-price, .item-subtotal { text-align: right; white-space: nowrap; }
      .totals { font-size: 12px; }
      .totals-row { display: flex; justify-content: space-between; margin: 3px 0; }
      .footer { font-size: 11px; margin-top: 12px; }
      .barcode { margin-top: 8px; text-align: center; }
      .barcode-box {
        width: 72mm;
        margin: 0 auto;
        padding: 2mm 0;
        border-top: 1px dashed #bbb;
        border-bottom: 1px dashed #bbb;
      }
      .barcode svg {
        display: block;
        width: 100%;
        height: 38px;
      }
      .address { font-size: 11px; line-height: 1.35; }
    </style>
  </head>
  <body>
    <div class="center">
      ${logoUrl ? `<img class="logo" src="${escapeHtml(logoUrl)}" alt="Logo" />` : ""}
      <h1>${escapeHtml(storeName)}</h1>
      <div class="meta muted">Struk Pembayaran</div>
      ${
        storeAddress || storePhone
          ? `<div class="address muted">${escapeHtml(storeAddress)}${
              storeAddress && storePhone ? "<br/>" : ""
            }${escapeHtml(storePhone)}</div>`
          : ""
      }
    </div>

    <div class="section meta">
      <div>Tanggal: ${escapeHtml(formatDateTime(createdAt))}</div>
      <div>Transaksi: ${escapeHtml(saleId ? String(saleId).slice(0, 8) : "-")}</div>
      <div>Kasir: ${escapeHtml(cashierName || "-")}</div>
      <div>Customer: ${escapeHtml(customerName || "-")}</div>
      <div>Metode: ${escapeHtml(paymentMethod || "N/A")}</div>
    </div>

    <div class="divider"></div>

    <table>
      <thead>
        <tr>
          <th>Item</th>
          <th class="item-qty">Qty</th>
          <th class="item-price">Harga</th>
          <th class="item-subtotal">Subtotal</th>
        </tr>
      </thead>
      <tbody>
        ${rows || `<tr><td colspan="4" class="muted">Tidak ada item</td></tr>`}
      </tbody>
    </table>

    <div class="divider"></div>

    <div class="totals">
      <div class="totals-row"><span>Total</span><span>${formatRp(total)}</span></div>
      <div class="totals-row"><span>Bayar</span><span>${formatRp(paidAmount)}</span></div>
      <div class="totals-row"><span>Kembali</span><span>${formatRp(change)}</span></div>
    </div>

    <div class="divider"></div>

    ${
      barcodeSvg
        ? `<div class="barcode"><div class="barcode-box">${barcodeSvg}</div><div class="meta muted">${escapeHtml(
            barcodeText
          )}</div></div><div class="divider"></div>`
        : ""
    }

    <div class="center footer muted">
      ${escapeHtml(footerText)}
    </div>

    <script>
      window.onload = function () {
        window.print();
        window.onafterprint = function () {
          window.close();
        };
      };
    </script>
  </body>
</html>
  `.trim();

  const printWindow = window.open("", "_blank", "width=400,height=700");
  if (!printWindow) {
    alert("Popup diblokir. Izinkan popup untuk mencetak struk.");
    return;
  }

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
}
