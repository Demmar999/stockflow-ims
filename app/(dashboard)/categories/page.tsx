// File: app/(dashboard)/categories/page.tsx
"use client";

import Link from "next/link";
import { useInventory } from "@/lib/store";
import { categorySummaries } from "@/lib/selectors";
import { formatNumber, formatPeso } from "@/lib/format";
import { IconCategory } from "@/components/ims-icons";

export default function CategoriesPage() {
  const { products, isReady } = useInventory();
  if (!isReady) return <p className="page-sub">Loading…</p>;

  const rows = categorySummaries(products);

  return (
    <>
      <p className="page-title">Categories</p>
      <p className="page-sub">Products grouped by category</p>

      <div className="card">
        {rows.length === 0 ? (
          <div className="empty">
            No categories yet. Add a product to create one.
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th className="right">Products</th>
                <th className="right">Units</th>
                <th className="right">Value</th>
                <th style={{ width: 160 }}>Share of stock</th>
                <th className="right"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => (
                <tr key={c.name}>
                  <td>
                    <div className="p-cell">
                      <div className="p-avatar">
                        <IconCategory size={16} />
                      </div>
                      <span>{c.name}</span>
                    </div>
                  </td>
                  <td className="right num">{formatNumber(c.productCount)}</td>
                  <td className="right num">{formatNumber(c.units)}</td>
                  <td className="right num">{formatPeso(c.value)}</td>
                  <td>
                    <div className="cat-track">
                      <div
                        className="cat-fill"
                        style={{ width: `${c.share}%` }}
                      />
                    </div>
                  </td>
                  <td className="right">
                    <Link
                      className="link"
                      href={`/products?category=${encodeURIComponent(c.name)}`}
                    >
                      View products
                    </Link>
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
