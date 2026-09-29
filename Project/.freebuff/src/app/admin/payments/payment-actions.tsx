"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function PaymentActions({ paymentId }: { paymentId: number }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function setStatus(status: "CONFIRMED" | "REJECTED") {
    setBusy(true);
    await fetch("/api/admin/payments", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paymentId, status }),
    });
    setBusy(false);
    router.refresh();
  }

  return (
    <div className="flex gap-2">
      <button className="btn-primary text-sm" disabled={busy} onClick={() => setStatus("CONFIRMED")}>
        ✓ Confirm
      </button>
      <button className="btn-secondary text-sm" disabled={busy} onClick={() => setStatus("REJECTED")}>
        ✗ Reject
      </button>
    </div>
  );
}
