// File: app/(dashboard)/suppliers/page.tsx
"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useInventory } from "@/lib/store";
import { supplierSummaries } from "@/lib/selectors";
import { formatNumber, formatPeso } from "@/lib/format";
import { IconTruck } from "@/components/ims-icons";

function SuppliersInner() {
  const { products, suppliers, isReady } = useInventory();
  const params = useSearchParams();
  const q = (params.get("q") ?? "").trim().toLowerCase();
  if (!isReady) return <p className="page-sub">Loading…</p>;

  const rows = supplierSummaries(suppliers, products).filter(
    ({ supplier }) =>
      !q || `${supplier.name} ${supplier.contact}`.toLowerCase().includes(q),
  );

  return (
    <>
      <p className="page-title">Suppliers</p>
      <p className="page-sub">
        Vendors you order stock from, and the products linked to each
        {q && (
          <>
            {" "}
            · filtered by “{params.get("q")}”{" "}
            <Link className="link" href="/suppliers">
              Clear
            </Link>
          </>
        )}
      </p>

      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Supplier</th>
              <th>Contact</th>
              <th className="right">Lead time</th>
              <th className="right">Products</th>
              <th className="right">Need restock</th>
              <th className="right">Stock value</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ supplier, productCount, lowStockCount, value }) => (
              <tr key={supplier.id}>
                <td>
                  <div className="p-cell">
                    <div className="p-avatar">
                      <IconTruck size={16} />
                    </div>
                    <span>{supplier.name}</span>
                  </div>
                </td>
                <td>{supplier.contact}</td>
                <td className="right num">{supplier.leadTimeDays} days</td>
                <td className="right num">{formatNumber(productCount)}</td>
                <td className="right">
                  {lowStockCount > 0 ? (
                    <Link
                      className="link"
                      href={`/alerts?supplier=${supplier.id}`}
                    >
                      <span className="dot-status dot-amber">
                        {lowStockCount}
                      </span>
                    </Link>
                  ) : (
                    <span className="dot-status dot-green">0</span>
                  )}
                </td>
                <td className="right num">{formatPeso(value)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default function SuppliersPage() {
  return (
    <Suspense fallback={<p className="page-sub">Loading…</p>}>
      <SuppliersInner />
    </Suspense>
  );
}
