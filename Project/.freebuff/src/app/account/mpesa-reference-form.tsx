"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatKSh } from "@/lib/money";

export function MpesaReferenceForm({
  kind,
  id,
  amountCents,
  disabled,
}: {
  kind: "order" | "serviceRequest";
  id: number;
  amountCents: number;
  disabled: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [method, setMethod] = useState<"MPESA" | "CASH">("MPESA");
  const [reference, setReference] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (disabled) return null;

  async function submit() {
    setBusy(true);
    setError(null);
    const res = await fetch("/api/payments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind, id, method, reference: method === "MPESA" ? reference : undefined }),
    });
    setBusy(false);
    if (res.ok) {
      setOpen(false);
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Could not record payment. Try again.");
    }
  }

  if (!open) {
    return (
      <button className="btn-secondary text-sm" onClick={() => setOpen(true)}>
        💳 Pay {formatKSh(amountCents)}
      </button>
    );
  }

  return (
    <div className="rounded-lg border bg-gray-50 p-3">
      <p className="text-sm font-semibold">Pay {formatKSh(amountCents)}</p>
      <p className="mt-1 text-xs text-gray-500">
        M-Pesa: Pay to Till <span className="font-bold">123456</span> (CyberHub). Then enter the confirmation code from
        the SMS, or choose cash if you&apos;ll pay at the shop.
      </p>
      <div className="mt-2 flex gap-2">
        <button
          className={`badge px-3 py-1.5 ${method === "MPESA" ? "bg-green-600 text-white" : "bg-gray-200 text-gray-700"}`}
          onClick={() => setMethod("MPESA")}
        >
          📱 M-Pesa
        </button>
        <button
          className={`badge px-3 py-1.5 ${method === "CASH" ? "bg-green-600 text-white" : "bg-gray-200 text-gray-700"}`}
          onClick={() => setMethod("CASH")}
        >
          💵 Cash
        </button>
      </div>
      {method === "MPESA" && (
        <input
          className="input mt-2"
          placeholder="e.g. QGH7XY2K9P"
          value={reference}
          onChange={(e) => setReference(e.target.value.toUpperCase())}
        />
      )}
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
      <div className="mt-3 flex gap-2">
        <button className="btn-primary text-sm" onClick={submit} disabled={busy || (method === "MPESA" && reference.trim().length < 6)}>
          {busy ? "Submitting..." : "Submit payment"}
        </button>
        <button className="btn-secondary text-sm" onClick={() => setOpen(false)}>
          Cancel
        </button>
      </div>
    </div>
  );
}
