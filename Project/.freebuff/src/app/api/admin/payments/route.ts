import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function PATCH(req: Request) {
  try {
    await requireAdmin();
    const body = await req.json();
    const paymentId = Number(body.paymentId);
    const status = String(body.status);

    if (!["CONFIRMED", "REJECTED", "PENDING"].includes(status)) {
      return NextResponse.json({ error: "Invalid status." }, { status: 400 });
    }

    const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
    if (!payment) return NextResponse.json({ error: "Payment not found." }, { status: 404 });

    await prisma.payment.update({
      where: { id: paymentId },
      data: { status, confirmedAt: status === "CONFIRMED" ? new Date() : null },
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof Error && e.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Admin access required." }, { status: 403 });
    }
    return NextResponse.json({ error: "Could not update payment." }, { status: 500 });
  }
}
