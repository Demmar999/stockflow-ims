"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AuthShell,
  IconLogin,
  IconMail,
  IconUserPlus,
  Notice,
  PasswordField,
  TextField,
} from "@/components/ims-auth-ui";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;

    fetch("/api/auth/me", { cache: "no-store" })
      .then((response) => {
        if (active && response.ok) {
          router.replace("/dashboard");
        }
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, [router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setBusy(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Unable to sign in.");
        return;
      }

      router.replace("/dashboard");
    } catch {
      setError("Unable to connect to the server.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to access your InvenCore dashboard"
    >
      {error && <Notice kind="error">{error}</Notice>}

      <form onSubmit={handleSubmit}>
        <TextField
          id="email"
          label="Email"
          type="email"
          icon={<IconMail />}
          placeholder="admin@email.com"
          autoComplete="username"
          value={email}
          onChange={setEmail}
          disabled={busy}
        />

        <PasswordField
          id="password"
          label="Password"
          autoComplete="current-password"
          value={password}
          onChange={setPassword}
          disabled={busy}
        />

        <div className="row-between">
          <label className="remember">
            <input type="checkbox" /> Remember me
          </label>
        </div>

        <button type="submit" className="primary" disabled={busy}>
          <IconLogin />
          {busy ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <p className="switch">
        Don't have an account?{" "}
        <Link href="/signup">
          <IconUserPlus /> Sign up
        </Link>
      </p>
    </AuthShell>
  );
}
