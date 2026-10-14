// File: app/(dashboard)/reports/page.tsx
"use client";

import { useState } from "react";
import { useInventory } from "@/lib/store";
import {
  findSupplier,
  getStockLevel,
  lowStockProducts,
  MONITOR_LABEL,
  movementLabel,
  productValue,
  sortMovementsDesc,
} from "@/lib/selectors";
import { formatDateTime, formatNumber, toDateInputValue } from "@/lib/format";
import {
  IconAlertCircle,
  IconChartLine,
  IconDownload,
  IconEye,
  IconMoney,
  IconSettings,
} from "@/components/ims-icons";
import Modal from "@/components/ims-modal";

type Row = Record<string, string | number>;

function toCSV(rows: Row[]): string {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]);
  const escape = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
  return [
    headers.map(escape).join(","),
    ...rows.map((r) => headers.map((h) => escape(r[h])).join(",")),
  ].join("\r\n");
}

function download(filename: string, csv: string) {
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export default function ReportsPage() {
  const { products, suppliers, movements, isReady } = useInventory();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [preview, setPreview] = useState<{ title: string; rows: Row[] } | null>(
    null,
  );
  const [notice, setNotice] = useState("");

  if (!isReady) return <p className="page-sub">Loading…</p>;

  const today = toDateInputValue(new Date());

  function stockSummary(): Row[] {
    return products.map((p) => ({
      SKU: p.sku,
      Product: p.name,
      Category: p.category,
      Supplier: findSupplier(suppliers, p.supplierId)?.name ?? "",
      Stock: p.stock,
      "Reorder level": p.reorderLevel,
      "Unit price": p.unitPrice,
      "Stock value": productValue(p),
      Status: MONITOR_LABEL[getStockLevel(p)],
    }));
  }

  function movementReport(): Row[] {
    return sortMovementsDesc(movements)
      .filter((m) => {
        const day = toDateInputValue(new Date(m.createdAt));
        return (!from || day >= from) && (!to || day <= to);
      })
      .map((m) => ({
        Date: formatDateTime(m.createdAt),
        SKU: m.sku,
        Product: m.productName,
        Type: movementLabel(m.type),
        Quantity: m.quantity,
        Reference: m.reference,
        "Supplier / Purpose": m.counterparty,
        User: m.user,
        "Balance after": m.balanceAfter,
      }));
  }

  function lowStockReport(): Row[] {
    return lowStockProducts(products).map((p) => ({
      SKU: p.sku,
      Product: p.name,
      Category: p.category,
      Stock: p.stock,
      "Reorder level": p.reorderLevel,
      Shortfall: Math.max(p.reorderLevel - p.stock, 0),
      Supplier: findSupplier(suppliers, p.supplierId)?.name ?? "",
      "Lead time (days)":
        findSupplier(suppliers, p.supplierId)?.leadTimeDays ?? "",
      Status: MONITOR_LABEL[getStockLevel(p)],
    }));
  }

  const REPORTS = [
    {
      key: "stock-summary",
      title: "Stock summary",
      desc: "Current on-hand quantity and value for every SKU in the catalog.",
      Icon: IconMoney,
      build: stockSummary,
    },
    {
      key: "movement",
      title: "Movement report",
      desc: "Stock in / stock out activity. Use the date range below to narrow it.",
      Icon: IconChartLine,
      build: movementReport,
    },
    {
      key: "low-stock",
      title: "Low stock report",
      desc: "Every item at or below its reorder level, ranked by urgency.",
      Icon: IconAlertCircle,
      build: lowStockReport,
    },
  ];

  function exportReport(key: string, title: string, rows: Row[]) {
    if (rows.length === 0) {
      setNotice(`${title}: nothing to export for the current selection.`);
      return;
    }
    download(`${key}-${today}.csv`, toCSV(rows));
    setNotice(`Exported ${title} (${formatNumber(rows.length)} rows).`);
  }

  function exportEverything() {
    REPORTS.forEach((r) => {
      const rows = r.build();
      if (rows.length) download(`${r.key}-${today}.csv`, toCSV(rows));
    });
    setNotice("Exported all three reports.");
  }

  const lastMovement = sortMovementsDesc(movements)[0];

  return (
    <>
      <p className="page-title">Reports</p>
      <p className="page-sub">
        Export stock and movement summaries as CSV (opens in Excel)
      </p>

      {notice && <div className="banner success">{notice}</div>}

      <div className="report-stats">
        <div className="mini-stat">
          <div className="v">{formatNumber(products.length)}</div>
          <div className="l">Products in catalog</div>
        </div>
        <div className="mini-stat">
          <div className="v">{formatNumber(movements.length)}</div>
          <div className="l">Movements logged</div>
        </div>
        <div className="mini-stat">
          <div className="v">
            {lastMovement ? formatDateTime(lastMovement.createdAt) : "—"}
          </div>
          <div className="l">Last activity</div>
        </div>
      </div>

      <div className="report-grid">
        {REPORTS.map(({ key, title, desc, Icon, build }) => (
          <div className="card report-card" key={key}>
            <div className="icon-badge">
              <Icon size={19} />
            </div>
            <h3>{title}</h3>
            <p className="desc">{desc}</p>
            <div className="meta">
              <span>CSV</span>
              <span>{formatNumber(build().length)} rows</span>
            </div>
            <div className="actions">
              <button
                className="btn-ghost"
                onClick={() => setPreview({ title, rows: build() })}
              >
                <IconEye size={14} /> Preview
              </button>
              <button
                className="primary"
                onClick={() => exportReport(key, title, build())}
              >
                <IconDownload size={14} /> Export
              </button>
            </div>
          </div>
        ))}

        <div className="card report-card wide">
          <div className="left">
            <div className="icon-badge">
              <IconSettings size={19} />
            </div>
            <div>
              <h3>Movement date range</h3>
              <p className="desc">Applies to the movement report above.</p>
              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                <input
                  type="date"
                  value={from}
                  max={to || today}
                  onChange={(e) => setFrom(e.target.value)}
                />
                <input
                  type="date"
                  value={to}
                  min={from}
                  max={today}
                  onChange={(e) => setTo(e.target.value)}
                />
                <button
                  className="btn-ghost"
                  onClick={() => {
                    setFrom("");
                    setTo("");
                  }}
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
          <div className="actions">
            <button className="primary" onClick={exportEverything}>
              <IconDownload size={14} /> Export all
            </button>
          </div>
        </div>
      </div>

      {preview && (
        <Modal
          title={`${preview.title} — preview`}
          width={880}
          onClose={() => setPreview(null)}
          footer={
            <>
              <button className="btn-ghost" onClick={() => setPreview(null)}>
                Close
              </button>
              <button
                className="primary"
                onClick={() => {
                  const report = REPORTS.find((r) => r.title === preview.title);
                  if (report)
                    exportReport(report.key, report.title, report.build());
                  setPreview(null);
                }}
              >
                <IconDownload size={14} /> Export CSV
              </button>
            </>
          }
        >
          {preview.rows.length === 0 ? (
            <div className="empty">Nothing to show for this selection.</div>
          ) : (
            <>
              <div style={{ overflowX: "auto" }}>
                <table>
                  <thead>
                    <tr>
                      {Object.keys(preview.rows[0]).map((h) => (
                        <th key={h} style={{ whiteSpace: "nowrap" }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.rows.slice(0, 10).map((r, i) => (
                      <tr key={i}>
                        {Object.values(r).map((v, j) => (
                          <td key={j} style={{ whiteSpace: "nowrap" }}>
                            {String(v)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {preview.rows.length > 10 && (
                <p
                  style={{
                    fontSize: 11.5,
                    color: "var(--text-muted)",
                    margin: "12px 0 0",
                  }}
                >
                  Showing 10 of {preview.rows.length} rows. Export for the full
                  list.
                </p>
              )}
            </>
          )}
        </Modal>
      )}
    </>
  );
}
