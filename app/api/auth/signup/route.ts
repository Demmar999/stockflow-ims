import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const fullName =
      typeof body.fullName === "string" ? body.fullName.trim() : "";

    const email =
      typeof body.email === "string" ? body.email.trim().toLowerCase() : "";

    const password = typeof body.password === "string" ? body.password : "";

    if (fullName.length < 2 || fullName.length > 150) {
      return NextResponse.json(
        { error: "Enter a valid full name." },
        { status: 400 },
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 255) {
      return NextResponse.json(
        { error: "Enter a valid email address." },
        { status: 400 },
      );
    }

    if (password.length < 8 || password.length > 72) {
      return NextResponse.json(
        { error: "Password must be between 8 and 72 characters." },
        { status: 400 },
      );
    }

    const existing = await db.query(
      "SELECT id FROM users WHERE LOWER(email) = $1 LIMIT 1",
      [email],
    );

    if (existing.rowCount && existing.rowCount > 0) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 },
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const result = await db.query(
      `INSERT INTO users (
        full_name,
        email,
        password_hash,
        role,
        is_active
      )
      VALUES ($1, $2, $3, 'staff', TRUE)
      RETURNING id, full_name, email, role, is_active`,
      [fullName, email, passwordHash],
    );

    const account = result.rows[0];

    return NextResponse.json(
      {
        message: "Account created successfully. You can now log in.",
        user: {
          id: account.id,
          name: account.full_name,
          email: account.email,
          role: account.role,
          is_active: account.is_active,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Sign-up error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unable to create account.",
      },
      { status: 500 },
    );
  }
}
