"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";

type Role = "admin" | "staff";

type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: Role;
};

type AuthContextValue = {
  user: AuthUser;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside <AuthGate>");
  }

  return context;
}

export function AuthGate({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null | undefined>(undefined);

  useEffect(() => {
    let active = true;

    async function checkSession() {
      try {
        const response = await fetch("/api/auth/me", {
          cache: "no-store",
        });

        if (!response.ok) {
          if (active) {
            setUser(null);
            router.replace("/login");
          }
          return;
        }

        const data = await response.json();

        if (active) {
          setUser(data.user);
        }
      } catch {
        if (active) {
          setUser(null);
          router.replace("/login");
        }
      }
    }

    void checkSession();

    return () => {
      active = false;
    };
  }, [router]);

  async function signOut() {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });
    } finally {
      router.replace("/login");
      router.refresh();
    }
  }

  if (user === undefined) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: "#F3F5FA",
          color: "#69759A",
          fontFamily: "system-ui, sans-serif",
          fontSize: 13,
        }}
      >
        Loading…
      </div>
    );
  }

  if (!user) return null;

  return (
    <AuthContext.Provider value={{ user, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function UserChip() {
  const { user, signOut } = useAuth();

  return (
    <div className="flex items-center gap-3">
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold">{user.name}</p>
        <p className="text-xs capitalize">{user.role}</p>
      </div>

      <button
        type="button"
        onClick={() => void signOut()}
        className="rounded-md border px-3 py-2 text-sm"
      >
        Log out
      </button>
    </div>
  );
}
