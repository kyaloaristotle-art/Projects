import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyPassword } from "@/lib/password";
import { createSession } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = String(body.email ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !verifyPassword(password, user.passwordHash)) {
      return NextResponse.json({ error: "Wrong email or password." }, { status: 401 });
    }

    await createSession(user.id);
    return NextResponse.json({ ok: true, role: user.role });
  } catch {
    return NextResponse.json({ error: "Login failed. Try again." }, { status: 500 });
  }
}
