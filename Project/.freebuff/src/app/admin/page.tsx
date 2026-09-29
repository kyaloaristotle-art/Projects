import { prisma } from "@/lib/db";
import { formatKSh } from "@/lib/money";
import { StatusBadge } from "@/components/status-badge";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [customerCount, orderCount, pendingOrders, pendingRequests, revenueAgg, lowStock, recentOrders] =
    await Promise.all([
      prisma.user.count({ where: { role: "CUSTOMER" } }),
      prisma.order.count(),
      prisma.order.count({ where: { status: "PENDING" } }),
      prisma.serviceRequest.count({ where: { status: "PENDING" } }),
      prisma.payment.aggregate({ where: { status: "CONFIRMED" }, _sum: { amountCents: true } }),
      prisma.product.findMany({ where: { active: true, stock: { lte: 5 } }, orderBy: { stock: "asc" }, take: 8 }),
      prisma.order.findMany({ include: { user: true, items: true }, orderBy: { createdAt: "desc" }, take: 8 }),
    ]);

  const stats = [
    { label: "Customers", value: customerCount.toString(), emoji: "👥" },
    { label: "Orders", value: orderCount.toString(), emoji: "📦" },
    { label: "Pending orders", value: pendingOrders.toString(), emoji: "⏳" },
    { label: "Pending requests", value: pendingRequests.toString(), emoji: "🧾" },
    { label: "Confirmed revenue", value: formatKSh(revenueAgg._sum.amountCents ?? 0), emoji: "💰" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {stats.map((s) => (
          <div key={s.label} className="card">
            <p className="text-sm text-gray-500">
              {s.emoji} {s.label}
            </p>
            <p className="mt-1 text-2xl font-extrabold">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card">
          <h2 className="mb-3 font-bold">Recent orders</h2>
          {recentOrders.length === 0 ? (
            <p className="text-sm text-gray-500">No orders yet.</p>
          ) : (
            <div className="divide-y text-sm">
              {recentOrders.map((o) => (
                <div key={o.id} className="flex items-center justify-between gap-2 py-2">
                  <div className="min-w-0">
                    <p className="truncate font-semibold">
                      #{o.id} · {o.user.name}
                    </p>
                    <p className="truncate text-gray-500">
                      {o.items.map((i) => `${i.name} ×${i.qty}`).join(", ")}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="font-semibold">{formatKSh(o.totalCents)}</span>
                    <StatusBadge status={o.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="card">
          <h2 className="mb-3 font-bold">⚠️ Low stock (5 or fewer)</h2>
          {lowStock.length === 0 ? (
            <p className="text-sm text-gray-500">All products are well stocked. 🎉</p>
          ) : (
            <div className="divide-y text-sm">
              {lowStock.map((p) => (
                <div key={p.id} className="flex items-center justify-between py-2">
                  <span>
                    {p.emoji} {p.name}
                  </span>
                  <span className={`font-bold ${p.stock === 0 ? "text-red-600" : "text-amber-600"}`}>
                    {p.stock} left
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
