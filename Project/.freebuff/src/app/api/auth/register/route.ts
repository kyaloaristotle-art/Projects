import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/password";
import { createSession } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const name = String(body.name ?? "").trim();
    const email = String(body.email ?? "").trim().toLowerCase();
    const phone = body.phone ? String(body.phone).trim() : null;
    const password = String(body.password ?? "");

    if (name.length < 2) return NextResponse.json({ error: "Please enter your full name." }, { status: 400 });
    if (!email.includes("@")) return NextResponse.json({ error: "Please enter a valid email." }, { status: 400 });
    if (password.length < 6) return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 400 });

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });

    const user = await prisma.user.create({
      data: { name, email, phone, passwordHash: hashPassword(password), role: "CUSTOMER" },
    });
    await createSession(user.id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Registration failed. Try again." }, { status: 500 });
  }
}
