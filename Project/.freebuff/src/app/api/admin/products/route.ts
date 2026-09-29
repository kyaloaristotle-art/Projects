import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { parseKSh } from "@/lib/money";

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const body = await req.json();
    const name = String(body.name ?? "").trim();
    const description = body.description ? String(body.description).trim() : null;
    const priceCents = parseKSh(String(body.price ?? ""));
    const stock = Number(body.stock ?? 0);
    const emoji = String(body.emoji ?? "📦").trim() || "📦";
    const categoryId = Number(body.categoryId);

    if (name.length < 2) return NextResponse.json({ error: "Product name is too short." }, { status: 400 });
    if (priceCents == null) return NextResponse.json({ error: "Enter a valid price in KSh." }, { status: 400 });
    if (!Number.isInteger(stock) || stock < 0) return NextResponse.json({ error: "Stock must be a number." }, { status: 400 });

    const category = await prisma.category.findUnique({ where: { id: categoryId } });
    if (!category) return NextResponse.json({ error: "Choose a category." }, { status: 400 });

    const product = await prisma.product.create({
      data: { name, description, priceCents, stock, emoji, categoryId },
    });
    return NextResponse.json({ ok: true, productId: product.id });
  } catch (e) {
    if (e instanceof Error && e.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Admin access required." }, { status: 403 });
    }
    return NextResponse.json({ error: "Could not create product." }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    await requireAdmin();
    const body = await req.json();
    const productId = Number(body.productId);
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) return NextResponse.json({ error: "Product not found." }, { status: 404 });

    const data: { priceCents?: number; stock?: number; active?: boolean; name?: string; description?: string | null; emoji?: string; categoryId?: number } = {};

    if (body.price != null) {
      const priceCents = parseKSh(String(body.price));
      if (priceCents == null) return NextResponse.json({ error: "Enter a valid price in KSh." }, { status: 400 });
      data.priceCents = priceCents;
    }
    if (body.addStock != null) {
      data.stock = product.stock + Number(body.addStock);
    }
    if (body.active != null) {
      data.active = Boolean(body.active);
    }
    if (body.name != null && String(body.name).trim().length >= 2) {
      data.name = String(body.name).trim();
    }
    if (body.description != null) {
      data.description = String(body.description).trim();
    }

    await prisma.product.update({ where: { id: productId }, data });
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof Error && e.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Admin access required." }, { status: 403 });
    }
    return NextResponse.json({ error: "Could not update product." }, { status: 500 });
  }
}
