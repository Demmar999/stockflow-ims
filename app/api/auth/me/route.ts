import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";

export const runtime = "nodejs";

export async function GET() {
  try {
    const user = await getSessionUser();

    if (!user) {
      return NextResponse.json(
        { error: "Not authenticated." },
        { status: 401 },
      );
    }

    return NextResponse.json({ user });
  } catch {
    return NextResponse.json(
      { error: "Unable to verify your session." },
      { status: 500 },
    );
  }
}
