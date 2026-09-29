import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { parseKSh } from "@/lib/money";

const SERVICE_CATEGORIES = ["CYBER", "PRINTING", "ONLINE", "ACADEMIC", "GAMING", "OTHER"];

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const body = await req.json();
    const name = String(body.name ?? "").trim();
    const description = body.description ? String(body.description).trim() : null;
    const category = String(body.category ?? "").toUpperCase();
    const priceCents = body.price !== "" && body.price != null ? parseKSh(String(body.price)) : null;
    const unit = body.unit ? String(body.unit).trim() : null;

    if (name.length < 2) return NextResponse.json({ error: "Service name is too short." }, { status: 400 });
    if (!SERVICE_CATEGORIES.includes(category)) {
      return NextResponse.json({ error: "Choose a valid category." }, { status: 400 });
    }
    if (body.price != null && body.price !== "" && priceCents == null) {
      return NextResponse.json({ error: "Enter a valid price in KSh (or leave empty for quoted)." }, { status: 400 });
    }

    const service = await prisma.service.create({ data: { name, description, category, priceCents, unit } });
    return NextResponse.json({ ok: true, serviceId: service.id });
  } catch (e) {
    if (e instanceof Error && e.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Admin access required." }, { status: 403 });
    }
    return NextResponse.json({ error: "Could not create service." }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    await requireAdmin();
    const body = await req.json();
    const serviceId = Number(body.serviceId);
    const service = await prisma.service.findUnique({ where: { id: serviceId } });
    if (!service) return NextResponse.json({ error: "Service not found." }, { status: 404 });

    const data: { priceCents?: number | null; unit?: string | null; active?: boolean } = {};

    if (body.price !== undefined) {
      data.priceCents = body.price === "" || body.price == null ? null : parseKSh(String(body.price));
      if (data.priceCents === null && body.price !== "" && body.price != null) {
        return NextResponse.json({ error: "Enter a valid price." }, { status: 400 });
      }
    }
    if (body.unit !== undefined) {
      data.unit = body.unit ? String(body.unit).trim() : null;
    }
    if (body.active != null) {
      data.active = Boolean(body.active);
    }

    await prisma.service.update({ where: { id: serviceId }, data });
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof Error && e.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Admin access required." }, { status: 403 });
    }
    return NextResponse.json({ error: "Could not update service." }, { status: 500 });
  }
}
