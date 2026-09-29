import { prisma } from "@/lib/db";
import { formatKSh } from "@/lib/money";
import { StatusBadge } from "@/components/status-badge";
import { PaymentActions } from "./payment-actions";

export const dynamic = "force-dynamic";

export default async function AdminPaymentsPage() {
  const [orderPayments, requestPayments] = await Promise.all([
    prisma.payment.findMany({
      where: { orderId: { not: null } },
      include: { user: true, order: { include: { items: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.payment.findMany({
      where: { serviceRequestId: { not: null } },
      include: { user: true, serviceRequest: { include: { service: true } } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const payments = [...orderPayments, ...requestPayments].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold">Payments</h2>
      <p className="text-sm text-gray-500">
        Confirm M-Pesa payments after checking the reference in your till/SMS, or mark cash payments as received.
      </p>
      {payments.length === 0 && <div className="card text-center text-gray-500">No payments recorded yet.</div>}
      {payments.map((p) => {
        const label =
          p.order != null
            ? `Order #${p.order.id} · ${p.order.items.map((i) => `${i.name} ×${i.qty}`).join(", ")}`
            : p.serviceRequest != null
              ? `Request #${p.serviceRequest.id} · ${p.serviceRequest.service.name}`
              : "Payment";
        return (
          <div key={p.id} className="card flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-semibold">{label}</h3>
              <p className="text-sm text-gray-500">
                {p.user.name} · {p.method}
                {p.reference ? ` · Ref: ${p.reference}` : ""} · {new Date(p.createdAt).toLocaleString("en-KE")}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-bold">{formatKSh(p.amountCents)}</span>
              <StatusBadge status={p.status} />
              {p.status === "PENDING" && <PaymentActions paymentId={p.id} />}
            </div>
          </div>
        );
      })}
    </div>
  );
}
