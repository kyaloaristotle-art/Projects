import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatKSh } from "@/lib/money";
import { ProductCard } from "@/components/product-card";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [products, services] = await Promise.all([
    prisma.product.findMany({ where: { active: true }, orderBy: { createdAt: "asc" }, take: 4 }),
    prisma.service.findMany({ where: { active: true }, orderBy: { createdAt: "asc" }, take: 6 }),
  ]);

  const serviceEmoji: Record<string, string> = {
    CYBER: "💻",
    PRINTING: "🖨️",
    ONLINE: "🌐",
    ACADEMIC: "🎓",
    GAMING: "🎮",
    OTHER: "🧰",
  };

  return (
    <div className="space-y-12">
      <section className="rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-500 p-8 text-white md:p-12">
        <h1 className="max-w-2xl text-3xl font-extrabold leading-tight md:text-4xl">
          Cyber services, electronics and everyday essentials — one hub.
        </h1>
        <p className="mt-3 max-w-xl text-indigo-100">
          Printing, scanning, typing, KRA/HELB/eCitizen assistance, PlayStation bookings and a shop for flash disks,
          chargers and accessories. Request a service or order a product, and we take it from there.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/services" className="btn bg-white text-indigo-700 hover:bg-indigo-50">
            Request a service
          </Link>
          <Link href="/products" className="btn bg-indigo-500 text-white hover:bg-indigo-400">
            Shop products
          </Link>
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-bold">Popular services</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
            <Link key={s.id} href="/services" className="card transition hover:border-indigo-300">
              <div className="flex items-start gap-3">
                <span className="text-3xl">{serviceEmoji[s.category] ?? "🧰"}</span>
                <div>
                  <h3 className="font-semibold">{s.name}</h3>
                  <p className="mt-1 line-clamp-2 text-sm text-gray-500">{s.description}</p>
                  <p className="mt-2 text-sm font-semibold text-indigo-700">
                    {s.priceCents != null ? formatKSh(s.priceCents) : "Quoted per request"}
                    {s.unit ? ` ${s.unit}` : ""}
                  </p>
                </div>
              </div>
            </Link>
            ))}
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">Featured products</h2>
          <Link href="/products" className="text-sm font-medium text-indigo-600 hover:underline">
            View all →
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((p) => (
            <ProductCard
              key={p.id}
              product={{
                id: p.id,
                name: p.name,
                description: p.description,
                priceCents: p.priceCents,
                stock: p.stock,
                emoji: p.emoji,
              }}
            />
          ))}
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="card">
          <h3 className="font-semibold">🖨️ Printing &amp; cyber</h3>
          <p className="mt-1 text-sm text-gray-500">
            B&amp;W and colour printing, photocopying, scanning, typing and laminating.
          </p>
        </div>
        <div className="card">
          <h3 className="font-semibold">🌐 Online &amp; academic</h3>
          <p className="mt-1 text-sm text-gray-500">
            KRA, HELB, KUCCPS, eCitizen, CVs and online form assistance.
          </p>
        </div>
        <div className="card">
          <h3 className="font-semibold">🎮 Gaming &amp; shop</h3>
          <p className="mt-1 text-sm text-gray-500">
            PlayStation bookings (coming in Phase 2) plus accessories and gadgets in store.
          </p>
        </div>
      </section>
    </div>
  );
}
