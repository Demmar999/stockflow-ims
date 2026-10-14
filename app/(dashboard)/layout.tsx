// File: app/(dashboard)/layout.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { InventoryProvider, useInventory } from "@/lib/store";
import { lowStockProducts } from "@/lib/selectors";
import "./ims.css";
import "./ims-extra.css";
import {
  IconHexagon,
  IconDashboard,
  IconPackage,
  IconCategory,
  IconTruck,
  IconArrowDown,
  IconArrowUp,
  IconChart,
  IconBell,
  IconHistory,
  IconFile,
  IconMenu,
} from "@/components/ims-icons";

function GlobalSearch() {
  return (
    <div className="ims-search" aria-label="Global search">
      <input
        type="search"
        placeholder="Search"
        aria-label="Search"
        className="ims-search-input"
      />
    </div>
  );
}

const NAV = [
  { href: "/dashboard", label: "Dashboard", Icon: IconDashboard },
  { href: "/products", label: "Products", Icon: IconPackage },
  { href: "/categories", label: "Categories", Icon: IconCategory },
  { href: "/suppliers", label: "Suppliers", Icon: IconTruck },
  { href: "/stock-in", label: "Stock in", Icon: IconArrowDown },
  { href: "/stock-out", label: "Stock out", Icon: IconArrowUp },
  { href: "/monitoring", label: "Monitoring", Icon: IconChart },
  { href: "/alerts", label: "Alerts", Icon: IconBell },
  { href: "/transactions", label: "Transactions", Icon: IconHistory },
  { href: "/reports", label: "Reports", Icon: IconFile },
];

/** Live red badge on the Alerts item — updates the instant any stock changes. */
function AlertCount() {
  const { products, isReady } = useInventory();
  if (!isReady) return null;
  const count = lowStockProducts(products).length;
  if (count === 0) return null;
  return (
    <span
      data-testid="alert-badge"
      style={{
        background: "var(--danger)",
        color: "#fff",
        fontSize: 10,
        fontWeight: 600,
        borderRadius: 10,
        padding: "1px 7px",
        fontFamily: "var(--font-mono)",
      }}
    >
      {count}
    </span>
  );
}

// Change these three lines to change the name shown in the top-right corner.
const DISPLAY_NAME = "Demmar";
const DISPLAY_INITIALS = "DM";
const DISPLAY_ROLE = "Admin";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const current = NAV.find((n) => n.href === pathname);

  return (
    <InventoryProvider>
      <div className="ims">
        <aside className={`sidebar${collapsed ? " collapsed" : ""}`}>
          <div className="brand">
            <div className="brand-mark">
              <IconHexagon size={16} />
            </div>
            <div className="brand-text">
              <span className="brand-name">StockFlow</span>
              <span className="brand-tag">IMS · CORE</span>
            </div>
          </div>

          <nav className="nav-scroll">
            {NAV.map(({ href, label, Icon }) => (
              <Link
                key={href}
                href={href}
                className={`nav-item${pathname === href ? " active" : ""}`}
              >
                <Icon size={17} />
                <span className="nav-label">{label}</span>
                {href === "/alerts" && (
                  <span className="nav-label" style={{ marginLeft: "auto" }}>
                    <AlertCount />
                  </span>
                )}
              </Link>
            ))}
          </nav>

          <div className="sidebar-foot">
            <div className="sb-pulse">
              <span className="pulse-dot" /> All systems nominal
            </div>
          </div>
        </aside>

        <div className="content">
          <header className="topbar">
            <button
              className="menu-toggle"
              onClick={() => setCollapsed((v) => !v)}
              aria-label="Toggle sidebar"
            >
              <IconMenu size={18} />
            </button>
            <span className="page-heading">
              {current?.label ?? "Dashboard"}
            </span>
            <GlobalSearch />
            <div className="topbar-right">
              <div className="avatar-circle">{DISPLAY_INITIALS}</div>
              <div className="user-meta">
                <div className="name">{DISPLAY_NAME}</div>
                <div className="role">{DISPLAY_ROLE}</div>
              </div>
            </div>
          </header>

          <main className="page-body">{children}</main>
        </div>
      </div>
    </InventoryProvider>
  );
}
