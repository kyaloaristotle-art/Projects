import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function PATCH(req: Request) {
  try {
    await requireAdmin();
    const body = await req.json();
    const orderId = Number(body.orderId);
    const status = String(body.status);

    const allowed = ["PENDING", "PAID", "PROCESSING", "READY", "COMPLETED", "CANCELLED"];
    if (!allowed.includes(status)) {
      return NextResponse.json({ error: "Invalid status." }, { status: 400 });
    }

    const order = await prisma.order.findUnique({ where: { id: orderId }, include: { items: true, payments: true } });
    if (!order) return NextResponse.json({ error: "Order not found." }, { status: 404 });

    // Marking PAID confirms the linked payment (or creates a cash record).
    if (status === "PAID" && order.status === "PENDING") {
      const payment = order.payments[0];
      if (payment) {
        await prisma.payment.update({
          where: { id: payment.id },
          data: { status: "CONFIRMED", confirmedAt: new Date() },
        });
      } else {
        await prisma.payment.create({
          data: {
            userId: order.userId,
            orderId: order.id,
            method: "CASH",
            amountCents: order.totalCents,
            status: "CONFIRMED",
            confirmedAt: new Date(),
          },
        });
      }
    }

    // Completing deducts stock (only once).
    if (status === "COMPLETED" && order.status !== "COMPLETED" && order.status !== "CANCELLED") {
      for (const item of order.items) {
        await prisma.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.qty } },
        });
      }
    }

    // Cancelling returns stock if it was already deducted.
    if (status === "CANCELLED" && order.status === "COMPLETED") {
      for (const item of order.items) {
        await prisma.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.qty } },
        });
      }
    }

    await prisma.order.update({ where: { id: orderId }, data: { status } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof Error && e.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Admin access required." }, { status: 403 });
    }
    return NextResponse.json({ error: "Could not update order." }, { status: 500 });
  }
}
