"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useInventory } from "@/lib/store";
import { findProduct, getStockLevel, isAlertLevel } from "@/lib/selectors";
import { formatNumber } from "@/lib/format";
import { STOCK_OUT_PURPOSES } from "@/lib/types";
import { IconArrowUp, IconX } from "@/components/ims-icons";

type Feedback = {
  tone: "success" | "warn";
  text: string;
  links: { href: string; label: string }[];
};

type CurrentUser = {
  name: string;
  role: string;
};

function FeedbackBanner({ f, onClose }: { f: Feedback; onClose: () => void }) {
  const isWarning = f.tone === "warn";

  return (
    <div
      className="banner"
      role={isWarning ? "alert" : "status"}
      aria-live={isWarning ? "assertive" : "polite"}
      data-testid="feedback"
      style={{
        position: "fixed",
        top: 24,
        right: 24,
        zIndex: 1000,
        width: "min(630px, calc(100vw - 32px))",
        boxSizing: "border-box",
        background: isWarning ? "var(--warning-light)" : "#e7f8f0",
        color: isWarning ? "#8a5e10" : "#137a4b",
        border: isWarning ? "1px solid #f3e1b5" : "1px solid #bfe9d5",
        borderRadius: 14,
        padding: "16px 42px 16px 18px",
        boxShadow: "0 12px 35px rgba(15, 23, 42, 0.14)",
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: 12,
      }}
    >
      <span style={{ flex: "1 1 220px", lineHeight: 1.6 }}>{f.text}</span>

      {f.links.length > 0 && (
        <span
          style={{
            display: "inline-flex",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          {f.links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="link"
              style={{
                color: "inherit",
                fontWeight: 600,
                textDecoration: "underline",
              }}
            >
              {link.label}
            </Link>
          ))}
        </span>
      )}

      <button
        type="button"
        onClick={onClose}
        aria-label="Dismiss notification"
        style={{
          position: "absolute",
          top: 12,
          right: 12,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 28,
          height: 28,
          padding: 0,
          border: "none",
          background: "transparent",
          color: "inherit",
          cursor: "pointer",
          opacity: 0.75,
        }}
      >
        <IconX size={16} />
      </button>
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
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [userLoaded, setUserLoaded] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadCurrentUser() {
      try {
        const response = await fetch("/api/auth/me", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Unable to retrieve the logged-in user.");
        }

        const data = await response.json();

        if (active) {
          setCurrentUser(data.user ?? null);
        }
      } catch (error) {
        console.error("Failed to load current user:", error);

        if (active) {
          setCurrentUser(null);
        }
      } finally {
        if (active) {
          setUserLoaded(true);
        }
      }
    }

    loadCurrentUser();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const id = params.get("productId");

    if (id) {
      setProductId(id);
    }
  }, [params]);

  if (!isReady) {
    return <p className="page-sub">Loading…</p>;
  }

  const selected = findProduct(products, productId);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFeedback(null);
    setError("");

    if (!userLoaded) {
      setError("Please wait while your account is being verified.");
      return;
    }

    if (!currentUser?.name?.trim()) {
      setError("Unable to identify the logged-in admin. Please log in again.");
      return;
    }

    const before = selected;
    const qty = Number(quantity);

    if (!Number.isInteger(qty) || qty < 1) {
      setError("Quantity must be a whole number greater than zero.");
      return;
    }

    if (!before) {
      setError("Please select a valid product.");
      return;
    }

    const result = recordStockOut({
      productId,
      quantity: qty,
      reference,
      counterparty: purpose,
      user: currentUser.name.trim(),
    });

    if (!result.ok) {
      setError(result.error);
      return;
    }

    const removed = qty;
    const newStock = before.stock - removed;
    const wasAlert = isAlertLevel(getStockLevel(before));

    const nowAlert = isAlertLevel(
      getStockLevel({
        stock: newStock,
        reorderLevel: before.reorderLevel,
      }),
    );

    const base = `Stock out successful! Removed ${formatNumber(removed)} units of ${before.name}. Stock is now ${formatNumber(newStock)}.`;

    if (!wasAlert && nowAlert) {
      setFeedback({
        tone: "warn",
        text:
          newStock <= 0
            ? `${base} ${before.name} is now OUT of stock and was added to Alerts.`
            : `${base} ${before.name} is now below its reorder level (${formatNumber(before.reorderLevel)}) and was added to Alerts.`,
        links: [
          {
            href: `/stock-in?productId=${before.id}`,
            label: "Restock now",
          },
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
      {feedback && (
        <FeedbackBanner f={feedback} onClose={() => setFeedback(null)} />
      )}

      <p className="page-title">Stock out</p>
      <p className="page-sub">Record stock leaving for sale or internal use</p>

      <form className="card" style={{ maxWidth: 460 }} onSubmit={handleSubmit}>
        {error && (
          <div
            className="banner error"
            role="alert"
            aria-live="assertive"
            style={{ marginBottom: 16 }}
          >
            {error}
          </div>
        )}

        <p className="field-label">Product</p>
        <select
          required
          style={{ width: "100%", marginBottom: 12 }}
          value={productId}
          onChange={(e) => {
            setProductId(e.target.value);
            setFeedback(null);
            setError("");
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
          required
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
          step="1"
          required
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
          disabled={!userLoaded || !currentUser?.name?.trim()}
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
