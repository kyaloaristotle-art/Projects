"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ServiceRowActions({ serviceId, active }: { serviceId: number; active: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function patch(payload: Record<string, unknown>) {
    setBusy(true);
    await fetch("/api/admin/services", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ serviceId, ...payload }),
    });
    setBusy(false);
    router.refresh();
  }

  async function reprice() {
    const input = window.prompt("New price in KSh (leave empty to make it quoted per request)?");
    if (input === null) return;
    await patch({ price: input });
  }

  return (
    <div className="flex gap-2">
      <button className="btn-secondary px-2 py-1 text-xs" disabled={busy} onClick={reprice}>
        💲 Price
      </button>
      {active ? (
        <button className="btn-secondary px-2 py-1 text-xs" disabled={busy} onClick={() => patch({ active: false })}>
          🙈 Hide
        </button>
      ) : (
        <button className="btn-secondary px-2 py-1 text-xs" disabled={busy} onClick={() => patch({ active: true })}>
          👁 Show
        </button>
      )}
    </div>
  );
}
