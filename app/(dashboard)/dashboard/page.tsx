// File: app/(dashboard)/dashboard/page.tsx
"use client";

import Link from "next/link";
import { useInventory } from "@/lib/store";
import {
  categorySummaries,
  dailyMovements,
  findProduct,
  getStockLevel,
  inventoryStats,
  lowStockProducts,
  movementLabel,
  movementTone,
  sortMovementsDesc,
  MONITOR_LABEL,
} from "@/lib/selectors";
import { formatNumber, formatPesoCompact } from "@/lib/format";
import {
  IconAlertTriangle,
  IconArrowDown,
  IconArrowUp,
  IconBox,
  IconHistory,
  IconMoney,
  IconPackage,
  IconPlus,
  PRODUCT_ICON_MAP,
} from "@/components/ims-icons";

const plain = { textDecoration: "none", color: "inherit" } as const;

export default function DashboardPage() {
  const { products, movements, isReady } = useInventory();

  if (!isReady) return <p className="page-sub">Loading…</p>;

  const stats = inventoryStats(products, movements);
  const week = dailyMovements(movements, 7);
  const categories = categorySummaries(products).slice(0, 5);
  const recent = sortMovementsDesc(movements).slice(0, 5);
  const alerts = lowStockProducts(products).slice(0, 4);

  return (
    <>
      <p className="page-title">Dashboard</p>
      <p className="page-sub">Overview of stock and activity</p>

      <div className="grid-4 mb16">
        <Link href="/products" className="stat" style={plain}>
          <div>
            <p className="value">{formatNumber(stats.productCount)}</p>
            <p className="label">Products</p>
          </div>
          <div className="icon-chip">
            <IconPackage size={19} />
          </div>
        </Link>
        <Link href="/transactions" className="stat" style={plain}>
          <div>
            <p className="value">{formatNumber(stats.movementsToday)}</p>
            <p className="label">Transactions today</p>
          </div>
          <div className="icon-chip">
            <IconHistory size={19} />
          </div>
        </Link>
        <Link href="/alerts" className="stat" style={plain}>
          <div>
            <p className="value">{formatNumber(stats.lowStockCount)}</p>
            <p className="label">Low stock items</p>
          </div>
          <div className="icon-chip">
            <IconAlertTriangle size={19} />
          </div>
        </Link>
        <Link
          href="/reports"
          className="stat highlight"
          style={{ textDecoration: "none" }}
        >
          <div>
            <p className="value">{formatPesoCompact(stats.stockValue)}</p>
            <p className="label">Stock value</p>
          </div>
          <div className="icon-chip">
            <IconMoney size={19} />
          </div>
        </Link>
      </div>

      <div className="grid-2 mb16">
        <div className="card">
          <p className="card-title">Weekly stock movement</p>
          <div className="bar-chart">
            {week.map((d) => (
              <div className="bar-col" key={d.date.getTime()}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-end",
                    gap: 3,
                    width: "100%",
                    height: "100%",
                  }}
                >
                  <div
                    className="bar"
                    title={`In: ${d.inUnits}`}
                    style={{ height: `${Math.max(d.inPercent, 3)}%`, flex: 1 }}
                  />
                  <div
                    className="bar dim"
                    title={`Out: ${d.outUnits}`}
                    style={{ height: `${Math.max(d.outPercent, 3)}%`, flex: 1 }}
                  />
                </div>
                <span className="bar-label">{d.label}</span>
              </div>
            ))}
          </div>
          <p className="hint" style={{ margin: "10px 0 0" }}>
            Dark = stock in · Light = stock out
          </p>
        </div>

        <div className="card">
          <p className="card-title">Stock by category</p>
          {categories.length === 0 && (
            <div className="empty">No products yet.</div>
          )}
          {categories.map((c) => (
            <div className="cat-row" key={c.name}>
              <div className="cat-top">
                <span>{c.name}</span>
                <span>{formatNumber(c.units)}</span>
              </div>
              <div className="cat-track">
                <div className="cat-fill" style={{ width: `${c.share}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid-2 mb16">
        <div className="card">
          <div className="row-between" style={{ marginBottom: 14 }}>
            <p className="card-title" style={{ margin: 0 }}>
              Recent transactions
            </p>
            <Link
              className="link"
              href="/transactions"
              style={{ fontSize: 12 }}
            >
              View all
            </Link>
          </div>
          {recent.length === 0 ? (
            <div className="empty">No transactions yet.</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Type</th>
                  <th className="right">Qty</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((m) => {
                  const product = findProduct(products, m.productId);
                  const Icon = product
                    ? PRODUCT_ICON_MAP[product.icon]
                    : IconBox;
                  return (
                    <tr key={m.id}>
                      <td>
                        <div className="p-cell">
                          <div className="p-avatar">
                            <Icon size={16} />
                          </div>
                          <span>{m.productName}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`dot-status ${movementTone(m.type)}`}>
                          {movementLabel(m.type)}
                        </span>
                      </td>
                      <td className="right num">{formatNumber(m.quantity)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        <div className="card">
          <div className="row-between" style={{ marginBottom: 14 }}>
            <p className="card-title" style={{ margin: 0 }}>
              Low stock alerts
            </p>
            <Link className="link" href="/alerts" style={{ fontSize: 12 }}>
              View all
            </Link>
          </div>
          {alerts.length === 0 && (
            <div className="empty">Everything is above its reorder level.</div>
          )}
          {alerts.map((p) => (
            <div className="alert-row" key={p.id}>
              <span className="left">
                <IconAlertTriangle size={15} /> {p.name}
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span className="num">
                  {getStockLevel(p) === "out"
                    ? MONITOR_LABEL.out
                    : `${p.stock} left`}
                </span>
                <Link
                  className="link"
                  href={`/stock-in?productId=${p.id}`}
                  style={{ fontWeight: 600 }}
                >
                  Restock
                </Link>
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid-3">
        <Link href="/stock-in" className="card qa-card">
          <div className="icon-chip">
            <IconArrowDown size={18} />
          </div>
          <div>
            <h4>Stock in</h4>
            <p>Record incoming inventory</p>
          </div>
        </Link>
        <Link href="/stock-out" className="card qa-card">
          <div className="icon-chip">
            <IconArrowUp size={18} />
          </div>
          <div>
            <h4>Stock out</h4>
            <p>Log outgoing items</p>
          </div>
        </Link>
        <Link href="/products?add=1" className="card qa-card">
          <div className="icon-chip">
            <IconPlus size={18} />
          </div>
          <div>
            <h4>Add product</h4>
            <p>Create a new catalog entry</p>
          </div>
        </Link>
      </div>
    </>
  );
}
