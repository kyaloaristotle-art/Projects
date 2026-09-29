import { prisma } from "@/lib/db";
import { formatKSh } from "@/lib/money";
import { StatusBadge } from "@/components/status-badge";
import { RequestStatusSelect } from "./request-status-select";

export const dynamic = "force-dynamic";

export default async function AdminServiceRequestsPage() {
  const requests = await prisma.serviceRequest.findMany({
    include: { user: true, service: true, payments: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold">Service requests</h2>
      {requests.length === 0 && <div className="card text-center text-gray-500">No service requests yet.</div>}
      {requests.map((r) => (
        <div key={r.id} className="card">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="font-semibold">
                #{r.id} · {r.service.name} · {r.user.name}
              </h3>
              <p className="text-sm text-gray-500">{r.details}</p>
              <p className="mt-1 text-xs text-gray-400">
                {new Date(r.createdAt).toLocaleString("en-KE")}
                {r.user.phone ? ` · ${r.user.phone}` : ""}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <StatusBadge status={r.status} />
              <RequestStatusSelect
                requestId={r.id}
                current={r.status}
                quoted={r.quotedCents != null ? (r.quotedCents / 100).toString() : ""}
              />
            </div>
          </div>
          {r.quotedCents != null && (
            <p className="mt-2 text-sm">
              Quote: <span className="font-bold text-indigo-700">{formatKSh(r.quotedCents)}</span>
              {r.adminNote && <span className="text-gray-500"> — {r.adminNote}</span>}
            </p>
          )}
          {r.payments.length > 0 && (
            <p className="mt-1 text-xs text-gray-500">
              💳 {r.payments[0].method} {r.payments[0].reference ? `· Ref: ${r.payments[0].reference}` : ""} ·{" "}
              <StatusBadge status={r.payments[0].status} />
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
