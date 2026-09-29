import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { parseKSh } from "@/lib/money";

export async function PATCH(req: Request) {
  try {
    await requireAdmin();
    const body = await req.json();
    const requestId = Number(body.requestId);
    const status = String(body.status);

    const allowed = ["PENDING", "QUOTED", "PAID", "IN_PROGRESS", "COMPLETED", "REJECTED"];
    if (!allowed.includes(status)) {
      return NextResponse.json({ error: "Invalid status." }, { status: 400 });
    }

    const request = await prisma.serviceRequest.findUnique({ where: { id: requestId }, include: { service: true } });
    if (!request) return NextResponse.json({ error: "Request not found." }, { status: 404 });

    const data: { status: string; quotedCents?: number; adminNote?: string } = { status };

    if (status === "QUOTED") {
      const quoted = body.quoted != null ? parseKSh(String(body.quoted)) : request.quotedCents;
      if (quoted == null) {
        return NextResponse.json({ error: "Enter a valid quote amount in KSh." }, { status: 400 });
      }
      data.quotedCents = quoted;
      data.adminNote = body.adminNote ? String(body.adminNote).trim() : request.adminNote;
    }

    if (body.adminNote != null) {
      data.adminNote = String(body.adminNote).trim();
    }

    await prisma.serviceRequest.update({ where: { id: requestId }, data });
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof Error && e.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Admin access required." }, { status: 403 });
    }
    return NextResponse.json({ error: "Could not update request." }, { status: 500 });
  }
}
