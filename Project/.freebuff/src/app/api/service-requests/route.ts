import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Please log in first." }, { status: 401 });

    const body = await req.json();
    const serviceId = Number(body.serviceId);
    const details = String(body.details ?? "").trim();
    if (!serviceId || details.length < 5) {
      return NextResponse.json({ error: "Please describe what you need (a few more words)." }, { status: 400 });
    }

    const service = await prisma.service.findFirst({ where: { id: serviceId, active: true } });
    if (!service) return NextResponse.json({ error: "That service is not available." }, { status: 404 });

    const request = await prisma.serviceRequest.create({
      data: { userId: user.id, serviceId, details },
    });
    return NextResponse.json({ ok: true, requestId: request.id });
  } catch {
    return NextResponse.json({ error: "Could not submit request." }, { status: 500 });
  }
}
