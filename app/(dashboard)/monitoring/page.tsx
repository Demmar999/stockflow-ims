// File: app/(dashboard)/monitoring/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useInventory } from "@/lib/store";
import {
  MONITOR_LABEL,
  MONITOR_TONE,
  getStockLevel,
  isAlertLevel,
  type LevelFilter,
} from "@/lib/selectors";
import { formatNumber } from "@/lib/format";
import type { StockLevel } from "@/lib/types";

const SEVERITY: Record<StockLevel, number> = {
  out: 0,
  below: 1,
  near: 2,
  healthy: 3,
};

export default function MonitoringPage() {
  const { products, isReady } = useInventory();
  const [filter, setFilter] = useState<LevelFilter>("all");

  if (!isReady) return <p className="page-sub">Loading…</p>;

  const rows = products
    .map((p) => ({ p, level: getStockLevel(p) }))
    .filter(({ level }) => filter === "all" || level === filter)
    .sort(
      (a, b) =>
        SEVERITY[a.level] - SEVERITY[b.level] ||
        a.p.name.localeCompare(b.p.name),
    );

  const counts = products.reduce<Record<StockLevel, number>>(
    (acc, p) => ({ ...acc, [getStockLevel(p)]: acc[getStockLevel(p)] + 1 }),
    { out: 0, below: 0, near: 0, healthy: 0 },
  );

  return (
    <>
      <p className="page-title">Inventory monitoring</p>
      <p className="page-sub">
        Current stock compared against each product&apos;s reorder level. Click
        a card to filter.
      </p>

      <div className="grid-4 mb16">
        {(["healthy", "near", "below", "out"] as StockLevel[]).map((level) => (
          <button
            key={level}
            className="stat"
            style={{
              textAlign: "left",
              height: "auto",
              cursor: "pointer",
              borderColor: filter === level ? "var(--blue)" : undefined,
            }}
            onClick={() => setFilter(filter === level ? "all" : level)}
          >
            <div>
              <p className="value">{counts[level]}</p>
              <p className={`label dot-status ${MONITOR_TONE[level]}`}>
                {MONITOR_LABEL[level]}
              </p>
            </div>
          </button>
        ))}
      </div>

      <div className="card">
        {rows.length === 0 ? (
          <div className="empty">No products in this state.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th className="right">Stock</th>
                <th className="right">Reorder level</th>
                <th className="right">Status</th>
                <th className="right">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ p, level }) => (
                <tr key={p.id}>
                  <td>
                    {p.name}
                    <span className="p-sku">{p.sku}</span>
                  </td>
                  <td className="right num">{formatNumber(p.stock)}</td>
                  <td className="right num">{formatNumber(p.reorderLevel)}</td>
                  <td className="right">
                    <span className={`dot-status ${MONITOR_TONE[level]}`}>
                      {MONITOR_LABEL[level]}
                    </span>
                  </td>
                  <td className="right">
                    {isAlertLevel(level) ? (
                      <Link
                        className="link"
                        href={`/stock-in?productId=${p.id}`}
                        style={{ fontWeight: 600 }}
                      >
                        Restock
                      </Link>
                    ) : (
                      <span style={{ color: "var(--text-muted)" }}>—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
