"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { InventoryProvider } from "@/lib/store";
import "./ims.css";

type IconName =
  | "hexagon"
  | "dashboard"
  | "package"
  | "category"
  | "truck"
  | "arrowDown"
  | "arrowUp"
  | "chart"
  | "bell"
  | "history"
  | "file"
  | "menu"
  | "search";

function Glyph({ name, size = 18 }: { name: IconName; size?: number }) {
  const shapes: Record<IconName, React.ReactNode> = {
    hexagon: <path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z" />,
    dashboard: (
      <>
        <rect x="3" y="3" width="8" height="8" rx="1" />
        <rect x="13" y="3" width="8" height="5" rx="1" />
        <rect x="13" y="10" width="8" height="11" rx="1" />
        <rect x="3" y="13" width="8" height="8" rx="1" />
      </>
    ),
    package: (
      <>
        <path d="m12 3 9 5-9 5-9-5 9-5Z" />
        <path d="M3 8v9l9 5 9-5V8M12 13v9" />
      </>
    ),
    category: (
      <>
        <rect x="3" y="3" width="8" height="8" rx="1" />
        <rect x="13" y="3" width="8" height="8" rx="1" />
        <rect x="3" y="13" width="8" height="8" rx="1" />
        <rect x="13" y="13" width="8" height="8" rx="1" />
      </>
    ),
    truck: (
      <>
        <path d="M3 6h11v12H3zM14 10h4l3 3v5h-7z" />
        <circle cx="7.5" cy="18" r="1.5" />
        <circle cx="17.5" cy="18" r="1.5" />
      </>
    ),
    arrowDown: (
      <>
        <path d="M12 3v14m-6-6 6 6 6-6" />
        <path d="M5 21h14" />
      </>
    ),
    arrowUp: (
      <>
        <path d="M12 21V7m-6 6 6-6 6 6" />
        <path d="M5 3h14" />
      </>
    ),
    chart: (
      <>
        <path d="M3 3v18h18" />
        <path d="m7 14 4-4 4 3 6-7" />
      </>
    ),
    bell: (
      <>
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
        <path d="M10 21h4" />
      </>
    ),
    history: (
      <>
        <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
        <path d="M3 3v5h5m4-1v5l3 2" />
      </>
    ),
    file: (
      <>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
        <path d="M14 2v6h6M8 13h8m-8 4h8" />
      </>
    ),
    menu: <path d="M4 6h16M4 12h16M4 18h16" />,
    search: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-4-4" />
      </>
    ),
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {shapes[name]}
    </svg>
  );
}

const IconHexagon = (props: { size?: number }) => (
  <Glyph name="hexagon" {...props} />
);
const IconDashboard = (props: { size?: number }) => (
  <Glyph name="dashboard" {...props} />
);
const IconPackage = (props: { size?: number }) => (
  <Glyph name="package" {...props} />
);
const IconCategory = (props: { size?: number }) => (
  <Glyph name="category" {...props} />
);
const IconTruck = (props: { size?: number }) => (
  <Glyph name="truck" {...props} />
);
const IconArrowDown = (props: { size?: number }) => (
  <Glyph name="arrowDown" {...props} />
);
const IconArrowUp = (props: { size?: number }) => (
  <Glyph name="arrowUp" {...props} />
);
const IconChart = (props: { size?: number }) => (
  <Glyph name="chart" {...props} />
);
const IconBell = (props: { size?: number }) => <Glyph name="bell" {...props} />;
const IconHistory = (props: { size?: number }) => (
  <Glyph name="history" {...props} />
);
const IconFile = (props: { size?: number }) => <Glyph name="file" {...props} />;
const IconMenu = (props: { size?: number }) => <Glyph name="menu" {...props} />;
const IconSearch = (props: { size?: number }) => (
  <Glyph name="search" {...props} />
);

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

type CurrentUser = {
  id: number | string;
  name: string;
  email: string;
  role: string;
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const pathname = usePathname();
  const router = useRouter();
  const current = NAV.find((n) => n.href === pathname);

  useEffect(() => {
    async function getUser() {
      try {
        const response = await fetch("/api/auth/me");

        if (!response.ok) {
          setUser(null);
          return;
        }

        const data = await response.json();
        setUser(data.user ?? null);
      } catch (error) {
        console.error("Failed to load current user:", error);
      }
    }

    getUser();
  }, []);

  async function handleLogout() {
    try {
      setIsLoggingOut(true);

      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to log out.");
      }

      setUser(null);
      router.replace("/login");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
      alert("Unable to log out. Please try again.");
    } finally {
      setIsLoggingOut(false);
    }
  }

  const initials =
    user?.name
      ?.trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ?? "U";

  return (
    <InventoryProvider>
      <div className="ims">
        <aside className={`sidebar${collapsed ? " collapsed" : ""}`}>
          <div className="brand">
            <div className="brand-mark">
              <IconHexagon size={16} />
            </div>
            <div className="brand-text">
              <span className="brand-name">InvenCore</span>
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
              </Link>
            ))}
          </nav>

          <div className="sidebar-foot">
            <div className="sb-pulse">
              <span className="pulse-dot" />
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

            <div className="search-wrap">
              <span className="lead">
                <IconSearch size={15} />
              </span>
              <input type="text" placeholder="Search here" />
            </div>

            <div className="topbar-right">
              <div className="avatar-circle">{initials}</div>

              <div className="user-meta">
                <div className="name">{user?.name ?? "Loading..."}</div>
                <div className="role">{user?.role ?? ""}</div>
              </div>

              <button
                type="button"
                className="btn-ghost"
                onClick={handleLogout}
                disabled={isLoggingOut}
                style={{ marginLeft: 12, whiteSpace: "nowrap" }}
              >
                {isLoggingOut ? "Logging out..." : "Log out"}
              </button>
            </div>
          </header>

          <main className="page-body">{children}</main>
        </div>
      </div>
    </InventoryProvider>
  );
}
