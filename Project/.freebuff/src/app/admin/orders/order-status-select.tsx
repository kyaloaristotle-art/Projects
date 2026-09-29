"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ORDER_STATUSES, prettyStatus } from "@/lib/status";

export function OrderStatusSelect({ orderId, current }: { orderId: number; current: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function change(status: string) {
    setBusy(true);
    await fetch("/api/admin/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, status }),
    });
    setBusy(false);
    router.refresh();
  }

  return (
    <select
      className="input w-auto py-1.5 text-sm"
      value={current}
      disabled={busy}
      onChange={(e) => change(e.target.value)}
    >
      {ORDER_STATUSES.map((s) => (
        <option key={s} value={s}>
          {prettyStatus(s)}
        </option>
      ))}
    </select>
  );
}
