import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Please log in first." }, { status: 401 });

    const body = await req.json();
    const kind = body.kind === "serviceRequest" ? "serviceRequest" : "order";
    const id = Number(body.id);
    const method = body.method === "CASH" ? "CASH" : "MPESA";
    const reference = body.reference ? String(body.reference).trim().toUpperCase() : null;

    if (method === "MPESA" && (!reference || reference.length < 6)) {
      return NextResponse.json({ error: "Enter the M-Pesa confirmation code from your SMS." }, { status: 400 });
    }

    if (kind === "order") {
      const order = await prisma.order.findFirst({
        where: { id, userId: user.id },
        include: { payments: true },
      });
      if (!order) return NextResponse.json({ error: "Order not found." }, { status: 404 });
      if (order.status !== "PENDING") {
        return NextResponse.json({ error: "This order is already paid or cancelled." }, { status: 400 });
      }
      const payment = order.payments[0];
      if (!payment) return NextResponse.json({ error: "No pending payment on this order." }, { status: 400 });
      await prisma.payment.update({
        where: { id: payment.id },
        data: { method, reference, status: "PENDING" },
      });
      return NextResponse.json({ ok: true });
    }

    const request = await prisma.serviceRequest.findFirst({
      where: { id, userId: user.id },
      include: { service: true, payments: true },
    });
    if (!request) return NextResponse.json({ error: "Request not found." }, { status: 404 });
    const amount = request.quotedCents ?? request.service.priceCents;
    if (amount == null) {
      return NextResponse.json({ error: "This request has not been quoted yet." }, { status: 400 });
    }
    if (request.status !== "QUOTED") {
      return NextResponse.json({ error: "This request is not awaiting payment." }, { status: 400 });
    }
    const existing = request.payments[0];
    if (existing) {
      await prisma.payment.update({
        where: { id: existing.id },
        data: { method, reference, amountCents: amount, status: "PENDING" },
      });
    } else {
      await prisma.payment.create({
        data: {
          userId: user.id,
          serviceRequestId: request.id,
          method,
          reference,
          amountCents: amount,
          status: "PENDING",
        },
      });
    }
    await prisma.serviceRequest.update({ where: { id: request.id }, data: { status: "PAID" } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Could not record payment." }, { status: 500 });
  }
}
