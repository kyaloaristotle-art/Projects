import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Please log in first." }, { status: 401 });

  try {
    const body = await req.json();
    const cartItems: { productId: number; qty: number }[] = Array.isArray(body.items) ? body.items : [];
    const phone = String(body.phone ?? "").trim();
    const deliveryMethod = body.deliveryMethod === "DELIVERY" ? "DELIVERY" : "COLLECTION";
    const address = body.address ? String(body.address).trim() : null;
    const note = body.note ? String(body.note).trim() : null;

    if (cartItems.length === 0) return NextResponse.json({ error: "Your cart is empty." }, { status: 400 });
    if (!phone) return NextResponse.json({ error: "Phone number is required." }, { status: 400 });
    if (deliveryMethod === "DELIVERY" && !address) {
      return NextResponse.json({ error: "Delivery address is required for delivery." }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      let totalCents = 0;
      const itemsToCreate: { productId: number; name: string; unitPriceCents: number; qty: number }[] = [];

      for (const item of cartItems) {
        const product = await tx.product.findUnique({ where: { id: Number(item.productId) } });
        if (!product || !product.active) throw new Error(`A product in your cart is no longer available.`);
        const qty = Math.max(1, Math.floor(Number(item.qty)));
        if (product.stock < qty) {
          throw new Error(`STOCK:Only ${product.stock} × ${product.name} left in stock.`);
        }
        totalCents += product.priceCents * qty;
        itemsToCreate.push({ productId: product.id, name: product.name, unitPriceCents: product.priceCents, qty });
      }

      const order = await tx.order.create({
        data: {
          userId: user.id,
          status: "PENDING",
          deliveryMethod,
          address,
          phone,
          note,
          totalCents,
          items: { create: itemsToCreate },
        },
      });

      await tx.payment.create({
        data: {
          userId: user.id,
          orderId: order.id,
          method: body.paymentMethod === "CASH" ? "CASH" : "MPESA",
          amountCents: totalCents,
          status: "PENDING",
        },
      });

      return order;
    });

    return NextResponse.json({ ok: true, orderId: result.id });
  } catch (e) {
    const raw = e instanceof Error ? e.message : "";
    const message = raw.startsWith("STOCK:") ? raw.slice(6) : "Could not place the order. Try again.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
