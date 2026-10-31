"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
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

const PAGE_SIZE = 10;

function TransactionsInner() {
  const { movements, isReady } = useInventory();
  const params = useSearchParams();

  const [query, setQuery] = useState<MovementQuery>(DEFAULT_MOVEMENT_QUERY);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  useEffect(() => {
    const q = params.get("q");

    if (q !== null) {
      setQuery((prev) => ({ ...prev, search: q }));
    }
  }, [params]);

  // Reset pagination when the filters change.
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [query.search, query.type, query.date]);

  // Sort newest transactions first without mutating the store's array.
  const sortedMovements = useMemo(
    () =>
      [...movements].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    [movements],
  );

  if (!isReady) {
    return <p className="page-sub">Loading…</p>;
  }

  const filteredRows = filterMovements(sortedMovements, query);
  const rows = filteredRows.slice(0, visibleCount);
  const hasMore = visibleCount < filteredRows.length;

  return (
    <>
      <p className="page-title">Transaction history</p>
      <p className="page-sub">
        View stock movements and the admin who recorded each transaction.
      </p>

      <div className="card">
        <div
          className="row-between"
          style={{
            marginBottom: 12,
            gap: 8,
            flexWrap: "wrap",
          }}
        >
          <p
            style={{
              fontSize: 14,
              fontWeight: 600,
              margin: 0,
              fontFamily: "var(--font-display)",
            }}
          >
            Transactions ({filteredRows.length})
          </p>

          <div
            style={{
              display: "flex",
              gap: 6,
              flexWrap: "wrap",
            }}
          >
            <input
              type="text"
              placeholder="Search product, SKU, ref"
              aria-label="Search transactions"
              style={{ height: 32, fontSize: 12 }}
              value={query.search}
              onChange={(e) => setQuery({ ...query, search: e.target.value })}
            />

            <select
              aria-label="Filter transaction type"
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
              aria-label="Filter transaction date"
              style={{ height: 32, fontSize: 12 }}
              value={query.date}
              onChange={(e) => setQuery({ ...query, date: e.target.value })}
            />

            <button
              type="button"
              className="btn-ghost"
              style={{ height: 32, fontSize: 12 }}
              onClick={() => {
                setQuery(DEFAULT_MOVEMENT_QUERY);
                setVisibleCount(PAGE_SIZE);
              }}
            >
              Clear
            </button>
          </div>
        </div>

        {filteredRows.length === 0 ? (
          <div className="empty">
            {movements.length === 0
              ? "No transactions yet. Transactions will appear here after an admin records stock in or stock out."
              : "No transactions match your filters. Try changing your search or clearing the filters."}
          </div>
        ) : (
          <>
            <div style={{ overflowX: "auto" }}>
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
                      <td>{m.user?.trim() || "Unknown user"}</td>

                      <td className="right num">
                        {m.type === "in" ? "+" : "−"}
                        {formatNumber(m.quantity)}
                      </td>

                      <td className="right num">
                        {formatNumber(m.balanceAfter)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 12,
                marginTop: 16,
              }}
            >
              <span className="page-sub" style={{ margin: 0 }}>
                Showing {rows.length} of {filteredRows.length} transactions
              </span>

              {hasMore && (
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={() =>
                    setVisibleCount((count) =>
                      Math.min(count + PAGE_SIZE, filteredRows.length),
                    )
                  }
                >
                  See more transactions
                </button>
              )}

              {!hasMore && filteredRows.length > PAGE_SIZE && (
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={() => setVisibleCount(PAGE_SIZE)}
                >
                  Show less
                </button>
              )}
            </div>
          </>
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
