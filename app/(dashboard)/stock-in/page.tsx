// File: app/(dashboard)/stock-in/page.tsx
"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CURRENT_USER, useInventory } from "@/lib/store";
import { findProduct, getStockLevel, isAlertLevel } from "@/lib/selectors";
import { formatNumber } from "@/lib/format";
import { IconArrowDown } from "@/components/ims-icons";

type Feedback = {
  tone: "success" | "warn";
  text: string;
  links: { href: string; label: string }[];
};

function FeedbackBanner({ f }: { f: Feedback }) {
  const palette =
    f.tone === "warn"
      ? {
          background: "var(--warning-light)",
          color: "#8a5e10",
          border: "1px solid #f3e1b5",
        }
      : {
          background: "#e7f8f0",
          color: "#137a4b",
          border: "1px solid #bfe9d5",
        };
  return (
    <div className="banner" style={{ ...palette, flexWrap: "wrap" }}>
      <span data-testid="feedback">{f.text}</span>
      <span style={{ marginLeft: "auto", display: "inline-flex", gap: 12 }}>
        {f.links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="link"
            style={{ fontWeight: 600 }}
          >
            {l.label}
          </Link>
        ))}
      </span>
    </div>
  );
}

function StockInInner() {
  const { products, suppliers, isReady, recordStockIn } = useInventory();
  const params = useSearchParams();

  const [productId, setProductId] = useState("");
  const [supplierName, setSupplierName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [reference, setReference] = useState("");
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  // /stock-in?productId=...  (from Alerts, Monitoring, Dashboard, Products)
  useEffect(() => {
    const id = params.get("productId");
    if (id) setProductId(id);
  }, [params]);

  // Default the supplier to the product's own supplier when it has one
  useEffect(() => {
    if (!productId) return;
    const product = findProduct(products, productId);
    const linked = suppliers.find((s) => s.id === product?.supplierId);
    if (linked) setSupplierName(linked.name);
  }, [productId, products, suppliers]);

  if (!isReady) return <p className="page-sub">Loading…</p>;

  const selected = findProduct(products, productId);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFeedback(null);
    const before = selected;
    const qty = Number(quantity);

    const result = recordStockIn({
      productId,
      quantity: qty,
      reference,
      counterparty: supplierName,
      user: CURRENT_USER,
    });
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setError("");

    // Tell the user what this movement did to the rest of the system
    const added = Math.trunc(qty);
    const newStock = (before?.stock ?? 0) + added;
    const wasAlert = before ? isAlertLevel(getStockLevel(before)) : false;
    const nowAlert = before
      ? isAlertLevel(
          getStockLevel({ stock: newStock, reorderLevel: before.reorderLevel }),
        )
      : false;

    let text = `Added ${formatNumber(added)} × ${before?.name ?? "item"}. Stock is now ${formatNumber(newStock)}.`;
    if (wasAlert && !nowAlert) text += " It's no longer on the low-stock list.";
    else if (nowAlert) text += " Still at or below its reorder level.";

    setFeedback({
      tone: "success",
      text,
      links: [
        { href: "/transactions", label: "View transactions" },
        { href: "/monitoring", label: "Monitoring" },
      ],
    });
    setQuantity("");
    setReference("");
  }

  return (
    <>
      <p className="page-title">Stock in</p>
      <p className="page-sub">Record incoming stock from a supplier</p>

      <form className="card" style={{ maxWidth: 460 }} onSubmit={handleSubmit}>
        {error && <div className="banner error">{error}</div>}
        {feedback && <FeedbackBanner f={feedback} />}

        <p className="field-label">Product</p>
        <select
          style={{ width: "100%", marginBottom: 12 }}
          value={productId}
          onChange={(e) => {
            setProductId(e.target.value);
            setFeedback(null);
          }}
        >
          <option value="">Select a product…</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} ({p.sku})
            </option>
          ))}
        </select>

        <p className="field-label">Supplier</p>
        <select
          style={{ width: "100%", marginBottom: 12 }}
          value={supplierName}
          onChange={(e) => setSupplierName(e.target.value)}
        >
          <option value="">Select a supplier…</option>
          {suppliers.map((s) => (
            <option key={s.id} value={s.name}>
              {s.name}
            </option>
          ))}
        </select>

        <p className="field-label">Quantity</p>
        <input
          type="number"
          min="1"
          placeholder="0"
          style={{ width: "100%", marginBottom: 0 }}
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
        />
        <div style={{ marginBottom: 12 }} />

        <p className="field-label">Reference no.</p>
        <input
          type="text"
          placeholder="INV-0021"
          style={{ width: "100%", marginBottom: 16 }}
          value={reference}
          onChange={(e) => setReference(e.target.value)}
        />

        <button
          type="submit"
          className="primary"
          style={{ width: "100%", height: 40 }}
        >
          <IconArrowDown size={16} /> Confirm stock in
        </button>
      </form>
    </>
  );
}

export default function StockInPage() {
  return (
    <Suspense fallback={<p className="page-sub">Loading…</p>}>
      <StockInInner />
    </Suspense>
  );
}
