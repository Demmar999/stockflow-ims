// File: components/ims-search.tsx  (NEW file)
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useInventory } from "@/lib/store";
import {
  MONITOR_LABEL,
  categorySummaries,
  getStockLevel,
  movementLabel,
  sortMovementsDesc,
} from "@/lib/selectors";
import { formatDateTime, formatNumber } from "@/lib/format";
import { IconSearch } from "@/components/ims-icons";

type Group = "Pages" | "Products" | "Categories" | "Suppliers" | "Transactions";

type Result = {
  id: string;
  group: Group;
  title: string;
  subtitle: string;
  href: string;
};

const PAGES: { label: string; href: string; keywords: string }[] = [
  { label: "Dashboard", href: "/dashboard", keywords: "overview home summary" },
  {
    label: "Products",
    href: "/products",
    keywords: "catalog items add product inventory",
  },
  { label: "Categories", href: "/categories", keywords: "groups types" },
  {
    label: "Suppliers",
    href: "/suppliers",
    keywords: "vendors lead time contact",
  },
  {
    label: "Stock in",
    href: "/stock-in",
    keywords: "receive incoming restock delivery",
  },
  {
    label: "Stock out",
    href: "/stock-out",
    keywords: "issue outgoing sale remove",
  },
  {
    label: "Monitoring",
    href: "/monitoring",
    keywords: "levels reorder status",
  },
  { label: "Alerts", href: "/alerts", keywords: "low stock warning reorder" },
  {
    label: "Transactions",
    href: "/transactions",
    keywords: "history log movements ledger",
  },
  {
    label: "Reports",
    href: "/reports",
    keywords: "export csv download summary",
  },
];

const SUGGESTED = [
  "Dashboard",
  "Products",
  "Stock in",
  "Stock out",
  "Alerts",
  "Reports",
];

const LIMITS: Record<Group, number> = {
  Pages: 4,
  Products: 6,
  Categories: 3,
  Suppliers: 3,
  Transactions: 5,
};

function matches(haystack: string, tokens: string[]) {
  const h = haystack.toLowerCase();
  return tokens.every((t) => h.includes(t));
}

export default function GlobalSearch() {
  const { products, suppliers, movements, isReady } = useInventory();
  const router = useRouter();
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);

  const results = useMemo<Result[]>(() => {
    const q = query.trim().toLowerCase();

    // Nothing typed yet: offer quick jumps
    if (!q) {
      return PAGES.filter((p) => SUGGESTED.includes(p.label)).map((p) => ({
        id: `page-${p.href}`,
        group: "Pages" as Group,
        title: p.label,
        subtitle: "Go to page",
        href: p.href,
      }));
    }

    const tokens = q.split(/\s+/).filter(Boolean);
    const out: Result[] = [];
    const push = (r: Result, count: Record<string, number>) => {
      if ((count[r.group] ?? 0) >= LIMITS[r.group]) return;
      count[r.group] = (count[r.group] ?? 0) + 1;
      out.push(r);
    };
    const count: Record<string, number> = {};

    PAGES.forEach((p) => {
      if (matches(`${p.label} ${p.keywords}`, tokens)) {
        push(
          {
            id: `page-${p.href}`,
            group: "Pages",
            title: p.label,
            subtitle: "Go to page",
            href: p.href,
          },
          count,
        );
      }
    });

    if (!isReady) return out;

    products.forEach((p) => {
      if (matches(`${p.name} ${p.sku} ${p.category}`, tokens)) {
        push(
          {
            id: `prod-${p.id}`,
            group: "Products",
            title: p.name,
            subtitle: `${p.sku} · ${p.category} · ${formatNumber(p.stock)} in stock · ${MONITOR_LABEL[getStockLevel(p)]}`,
            href: `/products?q=${encodeURIComponent(p.sku)}`,
          },
          count,
        );
      }
    });

    categorySummaries(products).forEach((c) => {
      if (matches(c.name, tokens)) {
        push(
          {
            id: `cat-${c.name}`,
            group: "Categories",
            title: c.name,
            subtitle: `${formatNumber(c.productCount)} products · ${formatNumber(c.units)} units`,
            href: `/products?category=${encodeURIComponent(c.name)}`,
          },
          count,
        );
      }
    });

    suppliers.forEach((s) => {
      if (matches(`${s.name} ${s.contact}`, tokens)) {
        const linked = products.filter((p) => p.supplierId === s.id).length;
        push(
          {
            id: `sup-${s.id}`,
            group: "Suppliers",
            title: s.name,
            subtitle: `${s.contact} · ${linked} products · ${s.leadTimeDays}d lead time`,
            href: `/suppliers?q=${encodeURIComponent(s.name)}`,
          },
          count,
        );
      }
    });

    sortMovementsDesc(movements).forEach((m) => {
      const hay = `${m.productName} ${m.sku} ${m.reference} ${m.counterparty} ${m.user} ${movementLabel(m.type)}`;
      if (matches(hay, tokens)) {
        const term = m.reference && m.reference !== "—" ? m.reference : m.sku;
        push(
          {
            id: `mov-${m.id}`,
            group: "Transactions",
            title: `${m.productName} · ${movementLabel(m.type)} ${formatNumber(m.quantity)}`,
            subtitle: `${m.reference} · ${m.counterparty} · ${formatDateTime(m.createdAt)}`,
            href: `/transactions?q=${encodeURIComponent(term)}`,
          },
          count,
        );
      }
    });

    return out;
  }, [query, products, suppliers, movements, isReady]);

  // Keep the highlighted row in range as results change
  useEffect(() => {
    setActive(0);
  }, [query]);

  // Close when clicking outside
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  // Ctrl+K or "/" focuses the search from anywhere
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = ["INPUT", "TEXTAREA", "SELECT"].includes(
        (e.target as HTMLElement)?.tagName,
      );
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      } else if (e.key === "/" && !typing) {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function go(r: Result) {
    setOpen(false);
    setQuery("");
    inputRef.current?.blur();
    router.push(r.href);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActive((a) => Math.min(a + 1, Math.max(results.length - 1, 0)));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const pick = results[active];
      if (pick) go(pick);
      else if (query.trim()) {
        setOpen(false);
        router.push(`/products?q=${encodeURIComponent(query.trim())}`);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
    }
  }

  // Group results while keeping one flat index for the keyboard
  const grouped: { group: Group; items: { r: Result; index: number }[] }[] = [];
  results.forEach((r, index) => {
    let g = grouped.find((x) => x.group === r.group);
    if (!g) {
      g = { group: r.group, items: [] };
      grouped.push(g);
    }
    g.items.push({ r, index });
  });

  return (
    <div className="search-wrap" ref={wrapRef}>
      <span className="lead">
        <IconSearch size={15} />
      </span>
      <input
        ref={inputRef}
        type="text"
        aria-label="Search the system"
        placeholder="Search anything…  (Ctrl+K)"
        value={query}
        autoComplete="off"
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
      />

      {open && (
        <div
          role="listbox"
          data-testid="search-results"
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            left: 0,
            width: 480,
            maxWidth: "88vw",
            maxHeight: 440,
            overflowY: "auto",
            background: "#ffffff",
            border: "1px solid #e6e9f2",
            borderRadius: 14,
            boxShadow: "0 18px 50px rgba(10, 18, 38, 0.22)",
            padding: 8,
            zIndex: 200,
          }}
        >
          {results.length === 0 ? (
            <div
              style={{
                padding: "22px 12px",
                textAlign: "center",
                fontSize: 12.5,
                color: "#98a2c0",
              }}
            >
              No results for “{query.trim()}”
            </div>
          ) : (
            grouped.map(({ group, items }) => (
              <div key={group} style={{ marginBottom: 6 }}>
                <div
                  style={{
                    padding: "8px 10px 4px",
                    fontSize: 10,
                    fontWeight: 600,
                    letterSpacing: 0.6,
                    textTransform: "uppercase",
                    color: "#98a2c0",
                  }}
                >
                  {query.trim() || group !== "Pages" ? group : "Quick jump"}
                </div>
                {items.map(({ r, index }) => (
                  <div
                    key={r.id}
                    role="option"
                    aria-selected={index === active}
                    onMouseEnter={() => setActive(index)}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      go(r);
                    }}
                    style={{
                      padding: "8px 10px",
                      borderRadius: 9,
                      cursor: "pointer",
                      background: index === active ? "#eaf0ff" : "transparent",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: "#1b2340",
                      }}
                    >
                      {r.title}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: "#69759a",
                        marginTop: 1,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {r.subtitle}
                    </div>
                  </div>
                ))}
              </div>
            ))
          )}
          <div
            style={{
              padding: "6px 10px 2px",
              fontSize: 10.5,
              color: "#98a2c0",
              borderTop: "1px solid #eef1f9",
            }}
          >
            ↑ ↓ to move · Enter to open · Esc to close
          </div>
        </div>
      )}
    </div>
  );
}
