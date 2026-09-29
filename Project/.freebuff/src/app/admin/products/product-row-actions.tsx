"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ProductRowActions({ productId }: { productId: number }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function patch(payload: Record<string, unknown>) {
    setBusy(true);
    await fetch("/api/admin/products", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, ...payload }),
    });
    setBusy(false);
    router.refresh();
  }

  async function restock() {
    const input = window.prompt("How many units to add to stock?");
    if (!input) return;
    const addStock = Number(input);
    if (!Number.isInteger(addStock) || addStock <= 0) return;
    await patch({ addStock });
  }

  async function reprice() {
    const input = window.prompt("New price in KSh?");
    if (!input) return;
    await patch({ price: input });
  }

  return (
    <div className="flex gap-2">
      <button className="btn-secondary px-2 py-1 text-xs" disabled={busy} onClick={restock}>
        📥 Restock
      </button>
      <button className="btn-secondary px-2 py-1 text-xs" disabled={busy} onClick={reprice}>
        💲 Price
      </button>
      <button className="btn-secondary px-2 py-1 text-xs" disabled={busy} onClick={() => patch({ active: true })}>
        👁 Show
      </button>
      <button className="btn-secondary px-2 py-1 text-xs" disabled={busy} onClick={() => patch({ active: false })}>
        🙈 Hide
      </button>
    </div>
  );
}
