"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function RequestServiceButton({ serviceId, name }: { serviceId: number; name: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [details, setDetails] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit() {
    setBusy(true);
    setError(null);
    const res = await fetch("/api/service-requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ serviceId, details }),
    });
    setBusy(false);
    if (res.ok) {
      setOpen(false);
      setDetails("");
      router.push("/account?tab=requests");
      router.refresh();
    } else if (res.status === 401) {
      router.push("/login?next=/services");
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Something went wrong. Try again.");
    }
  }

  return (
    <>
      <button
        className="btn-primary"
        onClick={() => setOpen(true)}
      >
        Request
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="relative w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold">Request: {name}</h3>
            <p className="mt-1 text-sm text-gray-500">
              Describe exactly what you need — pages, copies, deadlines or anything else that helps us serve you.
            </p>
            <textarea
              className="input mt-4 min-h-28"
              placeholder="e.g. Print 40 pages of my assignment, black & white, staple it."
              value={details}
              onChange={(e) => setDetails(e.target.value)}
            />
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
            <div className="mt-4 flex justify-end gap-2">
              <button className="btn-secondary" onClick={() => setOpen(false)}>
                Cancel
              </button>
              <button className="btn-primary" onClick={submit} disabled={busy || details.trim().length < 5}>
                {busy ? "Sending..." : "Submit request"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
