// File: app/(dashboard)/stock-out/page.tsx
"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CURRENT_USER, useInventory } from "@/lib/store";
import { findProduct, getStockLevel, isAlertLevel } from "@/lib/selectors";
import { formatNumber } from "@/lib/format";
import { STOCK_OUT_PURPOSES } from "@/lib/types";
import { IconArrowUp } from "@/components/ims-icons";

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

function StockOutInner() {
  const { products, isReady, recordStockOut } = useInventory();
  const params = useSearchParams();

  const [productId, setProductId] = useState("");
  const [purpose, setPurpose] = useState<string>(STOCK_OUT_PURPOSES[0]);
  const [quantity, setQuantity] = useState("");
  const [reference, setReference] = useState("");
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  // /stock-out?productId=... (from the Products page)
  useEffect(() => {
    const id = params.get("productId");
    if (id) setProductId(id);
  }, [params]);

  if (!isReady) return <p className="page-sub">Loading…</p>;

  const selected = findProduct(products, productId);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFeedback(null);
    const before = selected;
    const qty = Number(quantity);

    const result = recordStockOut({
      productId,
      quantity: qty,
      reference,
      counterparty: purpose,
      user: CURRENT_USER,
    });
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setError("");

    // Tell the user what this movement did to the rest of the system
    const removed = Math.trunc(qty);
    const newStock = (before?.stock ?? 0) - removed;
    const wasAlert = before ? isAlertLevel(getStockLevel(before)) : false;
    const nowAlert = before
      ? isAlertLevel(
          getStockLevel({ stock: newStock, reorderLevel: before.reorderLevel }),
        )
      : false;

    const base = `Removed ${formatNumber(removed)} × ${before?.name ?? "item"}. Stock is now ${formatNumber(newStock)}.`;

    if (!wasAlert && nowAlert && before) {
      setFeedback({
        tone: "warn",
        text:
          newStock <= 0
            ? `${base} ${before.name} is now OUT of stock and was added to Alerts.`
            : `${base} ${before.name} is now below its reorder level (${formatNumber(before.reorderLevel)}) and was added to Alerts.`,
        links: [
          { href: `/stock-in?productId=${before.id}`, label: "Restock now" },
          { href: "/alerts", label: "View alerts" },
        ],
      });
    } else {
      setFeedback({
        tone: "success",
        text: base,
        links: [{ href: "/transactions", label: "View transactions" }],
      });
    }
    setQuantity("");
    setReference("");
  }

  return (
    <>
      <p className="page-title">Stock out</p>
      <p className="page-sub">Record stock leaving for sale or internal use</p>

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

        <p className="field-label">Purpose</p>
        <select
          style={{ width: "100%", marginBottom: 12 }}
          value={purpose}
          onChange={(e) => setPurpose(e.target.value)}
        >
          {STOCK_OUT_PURPOSES.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>

        <p className="field-label">Quantity</p>
        <input
          type="number"
          min="1"
          placeholder="0"
          style={{ width: "100%", marginBottom: 12 }}
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
        />

        <p className="field-label">Reference no.</p>
        <input
          type="text"
          placeholder="ISS-0087"
          style={{ width: "100%", marginBottom: 16 }}
          value={reference}
          onChange={(e) => setReference(e.target.value)}
        />

        <button
          type="submit"
          className="primary"
          style={{ width: "100%", height: 40 }}
        >
          <IconArrowUp size={16} /> Confirm stock out
        </button>
      </form>
    </>
  );
}

export default function StockOutPage() {
  return (
    <Suspense fallback={<p className="page-sub">Loading…</p>}>
      <StockOutInner />
    </Suspense>
  );
}
