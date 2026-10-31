"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AuthShell,
  IconCheck,
  IconMail,
  IconUser,
  IconUserPlus,
  Notice,
  PasswordField,
  TextField,
} from "@/components/ims-auth-ui";

export default function SignUpPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let alive = true;

    fetch("/api/auth/me", { cache: "no-store" })
      .then((response) => {
        if (alive && response.ok) {
          router.replace("/dashboard");
        }
      })
      .catch(() => {});

    return () => {
      alive = false;
    };
  }, [router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const name = fullName.trim();
    const normalizedEmail = email.trim().toLowerCase();

    if (name.length < 2) {
      setError("Enter your full name.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setBusy(true);

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: name,
          email: normalizedEmail,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Unable to create your account.");
        return;
      }

      setDone(true);
    } catch {
      setError("Unable to connect to the server.");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <AuthShell
        title="Account created"
        subtitle="Your registration was successful"
      >
        <div className="done">
          <div className="badge">
            <IconCheck size={24} />
          </div>

          <p>
            Your account has been created for{" "}
            <b>{email.trim().toLowerCase()}</b>.
          </p>

          <Link className="primary-link" href="/login">
            Go to sign in
          </Link>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle="Join your team on InvenCore"
    >
      {error && <Notice kind="error">{error}</Notice>}

      <form onSubmit={handleSubmit}>
        <TextField
          id="full_name"
          label="Full name"
          icon={<IconUser />}
          placeholder="Name"
          autoComplete="name"
          value={fullName}
          onChange={setFullName}
          disabled={busy}
        />

        <TextField
          id="email"
          label="Email"
          type="email"
          icon={<IconMail />}
          placeholder="Email"
          autoComplete="email"
          value={email}
          onChange={setEmail}
          disabled={busy}
        />

        <PasswordField
          id="password"
          label="Password"
          autoComplete="new-password"
          value={password}
          onChange={setPassword}
          disabled={busy}
        />

        <p className="hint-text">At least 8 characters</p>

        <PasswordField
          id="confirm"
          label="Confirm password"
          autoComplete="new-password"
          value={confirm}
          onChange={setConfirm}
          disabled={busy}
        />

        <button
          type="submit"
          className="primary"
          disabled={busy}
          style={{ marginTop: 6 }}
        >
          <IconUserPlus />
          {busy ? "Creating account..." : "Create account"}
        </button>
      </form>

      <p className="switch">
        Already have an account? <Link href="/login">Sign in</Link>
      </p>
    </AuthShell>
  );
}
