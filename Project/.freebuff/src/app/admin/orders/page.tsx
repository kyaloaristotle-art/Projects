import { prisma } from "@/lib/db";
import { formatKSh } from "@/lib/money";
import { StatusBadge } from "@/components/status-badge";
import { ORDER_STATUSES } from "@/lib/status";
import { OrderStatusSelect } from "./order-status-select";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    include: { user: true, items: true, payments: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold">Orders</h2>
      {orders.length === 0 && <div className="card text-center text-gray-500">No orders yet.</div>}
      {orders.map((o) => {
        const payment = o.payments[0];
        return (
          <div key={o.id} className="card">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-semibold">
                  Order #{o.id} · {o.user.name}
                </h3>
                <p className="text-sm text-gray-500">
                  {new Date(o.createdAt).toLocaleString("en-KE")} · {o.phone} ·{" "}
                  {o.deliveryMethod === "DELIVERY" ? `🚴 ${o.address}` : "🏬 Collection"}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={o.status} />
                <OrderStatusSelect orderId={o.id} current={o.status} />
              </div>
            </div>
            <div className="mt-3 divide-y text-sm">
              {o.items.map((i) => (
                <div key={i.id} className="flex justify-between py-1">
                  <span>
                    {i.name} × {i.qty}
                  </span>
                  <span>{formatKSh(i.unitPriceCents * i.qty)}</span>
                </div>
              ))}
            </div>
            <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-sm">
              <span className="font-bold">Total: {formatKSh(o.totalCents)}</span>
              {payment && (
                <span className="text-gray-500">
                  💳 {payment.method} {payment.reference ? `· Ref: ${payment.reference}` : ""} ·{" "}
                  <StatusBadge status={payment.status} />
                </span>
              )}
              {o.note && <span className="w-full text-xs text-gray-400">Note: {o.note}</span>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
