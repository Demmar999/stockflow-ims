import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { setSession, type AuthUser } from "@/lib/session";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const email =
      typeof body.email === "string" ? body.email.trim().toLowerCase() : "";

    const password = typeof body.password === "string" ? body.password : "";

    if (!email || !password) {
      return NextResponse.json(
        { error: "Enter your email and password." },
        { status: 400 },
      );
    }

    const result = await db.query(
      `SELECT
        id,
        email,
        full_name,
        password_hash,
        role,
        is_active
      FROM users
      WHERE LOWER(email) = $1
      LIMIT 1`,
      [email],
    );

    const account = result.rows[0];

    if (!account) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 },
      );
    }

    if (!account.is_active) {
      return NextResponse.json(
        {
          error: "Your account is inactive. Please contact the administrator.",
        },
        { status: 403 },
      );
    }

    const passwordMatches = await bcrypt.compare(
      password,
      account.password_hash,
    );

    if (!passwordMatches) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 },
      );
    }

    const user: AuthUser = {
      id: String(account.id),
      email: account.email,
      name: account.full_name,
      role: account.role,
    };

    await setSession(user);

    return NextResponse.json({
      message: "Login successful.",
      user,
    });
  } catch (error) {
    console.error("Login error:", error);

    return NextResponse.json(
      {
        error: "Unable to sign in. Check the server and database.",
      },
      { status: 500 },
    );
  }
}
