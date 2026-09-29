"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { REQUEST_STATUSES, prettyStatus } from "@/lib/status";

export function RequestStatusSelect({
  requestId,
  current,
  quoted,
}: {
  requestId: number;
  current: string;
  quoted: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [quote, setQuote] = useState(quoted);
  const [note, setNote] = useState("");
  const [showQuote, setShowQuote] = useState(false);

  async function change(status: string) {
    setBusy(true);
    await fetch("/api/admin/service-requests", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requestId, status, quoted: status === "QUOTED" ? quote : undefined, adminNote: note || undefined }),
    });
    setBusy(false);
    setShowQuote(false);
    router.refresh();
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex items-center gap-2">
        {current === "PENDING" && (
          <button className="btn-primary text-sm" onClick={() => setShowQuote((v) => !v)}>
            💬 Quote
          </button>
        )}
        <select
          className="input w-auto py-1.5 text-sm"
          value={current}
          disabled={busy}
          onChange={(e) => change(e.target.value)}
        >
          {REQUEST_STATUSES.map((s) => (
            <option key={s} value={s}>
              {prettyStatus(s)}
            </option>
          ))}
        </select>
      </div>
      {showQuote && (
        <div className="rounded-lg border bg-gray-50 p-3">
          <div className="flex items-center gap-2">
            <input
              className="input w-32"
              placeholder="KSh"
              value={quote}
              onChange={(e) => setQuote(e.target.value)}
              inputMode="decimal"
            />
            <input
              className="input w-44"
              placeholder="Note (optional)"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
            <button className="btn-primary text-sm" onClick={() => change("QUOTED")} disabled={busy || !quote}>
              Send quote
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
