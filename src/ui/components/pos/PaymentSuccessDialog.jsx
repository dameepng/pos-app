import { CircleCheck, FileDown } from "lucide-react";
import AppDialog from "@/ui/components/common/AppDialog";
import { downloadInvoice } from "@/ui/utils/downloadInvoice";
import styles from "./PaymentSuccessDialog.module.css";

function formatDateTime(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function methodLabel(method) {
  return method === "CASH" ? "Tunai (CASH)" : "QRIS";
}

export default function PaymentSuccessDialog({
  open,
  onClose,
  onPrint,
  canPrint,
  method,
  changeText,
  transactionId,
  createdAt,
  rawData,
}) {
  const handleDownloadInvoice = async () => {
    if (!rawData) return;
    await downloadInvoice(rawData);
  };

  return (
    <AppDialog
      open={open}
      onClose={onClose}
      hideFooter
      overlayClassName="bg-zinc-900/30"
      panelClassName={styles.modalPanel}
    >
      <div className={styles.content}>
        <span className={styles.confetti} aria-hidden="true" />
        <span className={styles.confetti} aria-hidden="true" />
        <span className={styles.confetti} aria-hidden="true" />
        <span className={styles.confetti} aria-hidden="true" />
        <span className={styles.confetti} aria-hidden="true" />

        <div className={styles.successIcon}>
          <div className={styles.iconCircle}>
            <CircleCheck color="#fff" size={40} strokeWidth={3} />
          </div>
        </div>

        <h2 className={styles.title}>Pembayaran Berhasil!</h2>
        <p className={styles.method}>Metode Pembayaran: {methodLabel(method)}</p>

        <div className={styles.details}>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Nomor Transaksi</span>
            <span className={styles.detailValue}>{transactionId || "-"}</span>
          </div>
          <div className={styles.divider} />
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Tanggal & Waktu</span>
            <span className={styles.detailValue}>{formatDateTime(createdAt)}</span>
          </div>
        </div>

        {method === "CASH" ? (
          <div className={styles.amountCard}>
            <div className={styles.amountLabel}>Kembalian</div>
            <div className={styles.amountValue}>{changeText}</div>
          </div>
        ) : null}

        <div className={styles.buttonGroup}>
          <button
            type="button"
            onClick={onClose}
            className={`${styles.button} ${styles.cancelButton}`}
          >
            Tutup
          </button>
          <button
            type="button"
            onClick={handleDownloadInvoice}
            disabled={!rawData}
            className={`${styles.button} ${styles.downloadButton}`}
            style={{ display: "flex", alignItems: "center", gap: "6px" }}
          >
            <FileDown size={16} />
            Download
          </button>
          <button
            type="button"
            onClick={onPrint}
            disabled={!canPrint}
            className={`${styles.button} ${styles.printButton}`}
          >
            Cetak Struk
          </button>
        </div>
      </div>
    </AppDialog>
  );
}
