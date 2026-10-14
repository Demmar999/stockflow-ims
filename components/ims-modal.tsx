// File: components/ims-modal.tsx  (NEW file)
"use client";

import { useEffect, type ReactNode } from "react";
import { IconX } from "@/components/ims-icons";

type ModalProps = {
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  width?: number;
};

/**
 * A true pop-up: dark backdrop, centered card, closes on Esc or backdrop click.
 * All styling is inline, so it works even if a stylesheet fails to load.
 */
export default function Modal({
  title,
  onClose,
  children,
  footer,
  width = 560,
}: ModalProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden"; // stop the page scrolling behind the pop-up
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [onClose]);

  return (
    <div
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: "rgba(10, 18, 38, 0.55)",
        backdropFilter: "blur(2px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        style={{
          background: "#ffffff",
          color: "#1b2340",
          width: "100%",
          maxWidth: width,
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          borderRadius: 16,
          boxShadow: "0 24px 70px rgba(10, 18, 38, 0.35)",
          overflow: "hidden",
          fontFamily: "var(--font-body, Inter, sans-serif)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 22px",
            borderBottom: "1px solid #e6e9f2",
          }}
        >
          <h3
            style={{
              margin: 0,
              fontSize: 16,
              fontWeight: 700,
              fontFamily: "var(--font-display, 'Space Grotesk', sans-serif)",
            }}
          >
            {title}
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            style={{
              width: 32,
              height: 32,
              padding: 0,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1px solid #e6e9f2",
              borderRadius: 9,
              background: "#ffffff",
              color: "#69759a",
              cursor: "pointer",
            }}
          >
            <IconX size={15} />
          </button>
        </div>

        <div style={{ padding: 22, overflowY: "auto" }}>{children}</div>

        {footer && (
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 8,
              padding: "14px 22px",
              borderTop: "1px solid #e6e9f2",
              background: "#fafbfe",
            }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
