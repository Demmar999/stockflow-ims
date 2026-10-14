// File: app/(dashboard)/alerts/page.tsx
"use client";
import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useInventory } from "@/lib/store";
import {
  findSupplier,
  getStockLevel,
  lowStockProducts,
  MONITOR_LABEL,
} from "@/lib/selectors";
import { formatNumber } from "@/lib/format";
import { IconAlertTriangle } from "@/components/ims-icons";

function AlertsInner() {
  const { products, suppliers, isReady } = useInventory();
  const params = useSearchParams();
  const supplierId = params.get("supplier");

  if (!isReady) return <p className="page-sub">Loading…</p>;

  const filterSupplier = supplierId
    ? suppliers.find((s) => s.id === supplierId)
    : undefined;
  const alerts = lowStockProducts(products).filter(
    (p) => !filterSupplier || p.supplierId === filterSupplier.id,
  );

  return (
    <>
      <p className="page-title">Low stock alerts</p>
      <p className="page-sub">
        Products at or below their reorder level ({alerts.length})
        {filterSupplier && (
          <>
            {" "}
            · supplier: <b>{filterSupplier.name}</b>{" "}
            <Link className="link" href="/alerts">
              Clear
            </Link>
          </>
        )}
      </p>

      <div className="card">
        {alerts.length === 0 && (
          <div className="empty">
            All products are above their reorder level. 🎉
          </div>
        )}
        {alerts.map((p) => {
          const supplier = findSupplier(suppliers, p.supplierId);
          const out = getStockLevel(p) === "out";
          return (
            <div className="alert-row" key={p.id}>
              <span className="left">
                <IconAlertTriangle size={15} />
                <span>
                  <b>{p.name}</b> —{" "}
                  {out ? MONITOR_LABEL.out : `${formatNumber(p.stock)} left`}{" "}
                  (reorder at {formatNumber(p.reorderLevel)})
                  {supplier && (
                    <span style={{ opacity: 0.75 }}>
                      {" "}
                      · {supplier.name}, {supplier.leadTimeDays}d lead time
                    </span>
                  )}
                </span>
              </span>
              <Link href={`/stock-in?productId=${p.id}`}>
                <button
                  className="primary"
                  style={{ height: 28, padding: "3px 12px", fontSize: 11 }}
                >
                  Restock
                </button>
              </Link>
            </div>
          );
        })}
      </div>
    </>
  );
}

export default function AlertsPage() {
  return (
    <Suspense fallback={<p className="page-sub">Loading…</p>}>
      <AlertsInner />
    </Suspense>
  );
}
