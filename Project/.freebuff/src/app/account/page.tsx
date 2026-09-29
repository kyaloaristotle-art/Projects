import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { formatKSh } from "@/lib/money";
import { StatusBadge } from "@/components/status-badge";
import { MpesaReferenceForm } from "./mpesa-reference-form";

export const dynamic = "force-dynamic";

export default async function AccountPage({ searchParams }: { searchParams: Promise<{ tab?: string; placed?: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/account");

  const { tab = "orders", placed } = await searchParams;

  const [orders, requests] = await Promise.all([
    prisma.order.findMany({
      where: { userId: user.id },
      include: { items: true, payments: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.serviceRequest.findMany({
      where: { userId: user.id },
      include: { service: true, payments: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold">Hi, {user.name.split(" ")[0]} 👋</h1>
          <p className="text-sm text-gray-500">{user.email}</p>
        </div>
        {user.role === "ADMIN" && (
          <Link href="/admin" className="btn-secondary">
            Go to admin dashboard →
          </Link>
        )}
      </div>

      {placed && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">
          ✅ Order #{placed} placed successfully. Follow the payment instructions below to complete it.
        </div>
      )}

      <div className="flex gap-2">
        <Link
          href="/account?tab=orders"
          className={`badge px-4 py-2 ${tab === "orders" ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-700"}`}
        >
          📦 My orders ({orders.length})
        </Link>
        <Link
          href="/account?tab=requests"
          className={`badge px-4 py-2 ${tab === "requests" ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-700"}`}
        >
          🧾 My service requests ({requests.length})
        </Link>
      </div>

      {tab === "requests" ? (
        <div className="space-y-4">
          {requests.length === 0 && (
            <div className="card text-center text-gray-500">
              No service requests yet. <Link href="/services" className="font-medium text-indigo-600 hover:underline">Request a service →</Link>
            </div>
          )}
          {requests.map((r) => (
            <div key={r.id} className="card">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="font-semibold">
                    #{r.id} · {r.service.name}
                  </h3>
                  <p className="text-sm text-gray-500">{r.details}</p>
                </div>
                <StatusBadge status={r.status} />
              </div>
              {r.quotedCents != null && (
                <p className="mt-2 text-sm">
                  Quote: <span className="font-bold text-indigo-700">{formatKSh(r.quotedCents)}</span>
                  {r.adminNote && <span className="text-gray-500"> — {r.adminNote}</span>}
                </p>
              )}
              {r.status === "PENDING" && (
                <p className="mt-2 text-sm text-gray-500">⏳ Waiting for our team to review and quote your request.</p>
              )}
              {(r.status === "QUOTED" || r.status === "PAID") && (
                <div className="mt-3">
                  <MpesaReferenceForm
                    kind="serviceRequest"
                    id={r.id}
                    amountCents={r.quotedCents ?? r.service.priceCents ?? 0}
                    disabled={r.status === "PAID"}
                  />
                </div>
              )}
              {r.payments.length > 0 && (
                <div className="mt-3 space-y-1">
                  {r.payments.map((p) => (
                    <p key={p.id} className="text-xs text-gray-500">
                      Payment: {formatKSh(p.amountCents)} via {p.method} · <StatusBadge status={p.status} />
                      {p.reference ? ` · Ref: ${p.reference}` : ""}
                    </p>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {orders.length === 0 && (
            <div className="card text-center text-gray-500">
              No orders yet. <Link href="/products" className="font-medium text-indigo-600 hover:underline">Browse products →</Link>
            </div>
          )}
          {orders.map((o) => {
            const payment = o.payments[0];
            return (
              <div key={o.id} className="card">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="font-semibold">Order #{o.id}</h3>
                    <p className="text-sm text-gray-500">
                      {new Date(o.createdAt).toLocaleString("en-KE")} ·{" "}
                      {o.deliveryMethod === "DELIVERY" ? `🚴 Delivery to ${o.address}` : "🏬 Collect in shop"}
                    </p>
                  </div>
                  <StatusBadge status={o.status} />
                </div>
                <div className="mt-3 divide-y text-sm">
                  {o.items.map((item) => (
                    <div key={item.id} className="flex justify-between py-1">
                      <span>
                        {item.name} × {item.qty}
                      </span>
                      <span>{formatKSh(item.unitPriceCents * item.qty)}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-2 flex justify-between text-sm font-bold">
                  <span>Total</span>
                  <span>{formatKSh(o.totalCents)}</span>
                </div>
                {o.note && <p className="mt-2 text-xs text-gray-500">Note: {o.note}</p>}
                {o.status === "PENDING" && (
                  <div className="mt-3">
                    <MpesaReferenceForm
                      kind="order"
                      id={o.id}
                      amountCents={o.totalCents}
                      disabled={false}
                    />
                  </div>
                )}
                {payment && (
                  <p className="mt-3 text-xs text-gray-500">
                    Payment: {formatKSh(payment.amountCents)} via {payment.method} · <StatusBadge status={payment.status} />
                    {payment.reference ? ` · Ref: ${payment.reference}` : ""}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
