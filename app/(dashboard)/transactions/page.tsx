// File: app/(dashboard)/transactions/page.tsx
"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useInventory } from "@/lib/store";
import {
  DEFAULT_MOVEMENT_QUERY,
  filterMovements,
  movementLabel,
  movementTone,
  type MovementQuery,
} from "@/lib/selectors";
import { formatDateTime, formatNumber } from "@/lib/format";

function TransactionsInner() {
  const { movements, isReady } = useInventory();
  const params = useSearchParams();
  const [query, setQuery] = useState<MovementQuery>(DEFAULT_MOVEMENT_QUERY);

  // /transactions?q=INV-0018 (from the top search bar)
  useEffect(() => {
    const q = params.get("q");
    if (q !== null) setQuery((prev) => ({ ...prev, search: q }));
  }, [params]);

  if (!isReady) return <p className="page-sub">Loading…</p>;

  const rows = filterMovements(movements, query);

  return (
    <>
      <p className="page-title">Transaction history</p>
      <p className="page-sub">Full audit log of stock movement</p>

      <div className="card">
        <div
          className="row-between"
          style={{ marginBottom: 12, gap: 8, flexWrap: "wrap" }}
        >
          <p
            style={{
              fontSize: 14,
              fontWeight: 600,
              margin: 0,
              fontFamily: "var(--font-display)",
            }}
          >
            All transactions ({rows.length})
          </p>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            <input
              type="text"
              placeholder="Search product, SKU, ref"
              style={{ height: 32, fontSize: 12 }}
              value={query.search}
              onChange={(e) => setQuery({ ...query, search: e.target.value })}
            />
            <select
              style={{ height: 32, fontSize: 12 }}
              value={query.type}
              onChange={(e) =>
                setQuery({
                  ...query,
                  type: e.target.value as MovementQuery["type"],
                })
              }
            >
              <option value="all">All types</option>
              <option value="in">Stock in</option>
              <option value="out">Stock out</option>
            </select>
            <input
              type="date"
              style={{ height: 32, fontSize: 12 }}
              value={query.date}
              onChange={(e) => setQuery({ ...query, date: e.target.value })}
            />
            <button
              className="btn-ghost"
              style={{ height: 32, fontSize: 12 }}
              onClick={() => setQuery(DEFAULT_MOVEMENT_QUERY)}
            >
              Clear
            </button>
          </div>
        </div>

        {rows.length === 0 ? (
          <div className="empty">No transactions match your filters.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Product</th>
                <th>Type</th>
                <th>Reference</th>
                <th>Supplier / Purpose</th>
                <th>User</th>
                <th className="right">Qty</th>
                <th className="right">Balance</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((m) => (
                <tr key={m.id}>
                  <td className="num">{formatDateTime(m.createdAt)}</td>
                  <td>
                    <Link
                      className="link"
                      href={`/products?q=${encodeURIComponent(m.sku)}`}
                      style={{ color: "inherit" }}
                    >
                      {m.productName}
                    </Link>
                    <span className="p-sku">{m.sku}</span>
                  </td>
                  <td>
                    <span className={`dot-status ${movementTone(m.type)}`}>
                      {movementLabel(m.type)}
                    </span>
                  </td>
                  <td className="num">{m.reference}</td>
                  <td>{m.counterparty}</td>
                  <td>{m.user}</td>
                  <td className="right num">
                    {m.type === "in" ? "+" : "−"}
                    {formatNumber(m.quantity)}
                  </td>
                  <td className="right num">{formatNumber(m.balanceAfter)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}

export default function TransactionsPage() {
  return (
    <Suspense fallback={<p className="page-sub">Loading…</p>}>
      <TransactionsInner />
    </Suspense>
  );
}
