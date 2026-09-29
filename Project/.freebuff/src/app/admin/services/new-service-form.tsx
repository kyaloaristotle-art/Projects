"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const CATEGORIES = [
  { value: "CYBER", label: "💻 Cyber" },
  { value: "PRINTING", label: "🖨️ Printing" },
  { value: "ONLINE", label: "🌐 Online" },
  { value: "ACADEMIC", label: "🎓 Academic" },
  { value: "GAMING", label: "🎮 Gaming" },
  { value: "OTHER", label: "🧰 Other" },
];

export function NewServiceForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("CYBER");
  const [price, setPrice] = useState("");
  const [unit, setUnit] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await fetch("/api/admin/services", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description, category, price, unit }),
    });
    setBusy(false);
    if (res.ok) {
      setOpen(false);
      setName("");
      setDescription("");
      setPrice("");
      setUnit("");
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Could not create service.");
    }
  }

  if (!open) {
    return (
      <button className="btn-primary" onClick={() => setOpen(true)}>
        ➕ Add service
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="card space-y-3">
      <h3 className="font-bold">New service</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="label">Name</label>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} required minLength={2} />
        </div>
        <div>
          <label className="label">Category</label>
          <select className="input" value={category} onChange={(e) => setCategory(e.target.value)}>
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Price (KSh) — empty means quoted per request</label>
          <input className="input" value={price} onChange={(e) => setPrice(e.target.value)} inputMode="decimal" placeholder="e.g. 50 or leave empty" />
        </div>
        <div>
          <label className="label">Unit (optional)</label>
          <input className="input" value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="per page, per hour..." />
        </div>
        <div className="sm:col-span-2">
          <label className="label">Description</label>
          <textarea className="input min-h-20" value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-2">
        <button type="submit" className="btn-primary" disabled={busy}>
          {busy ? "Saving..." : "Save service"}
        </button>
        <button type="button" className="btn-secondary" onClick={() => setOpen(false)}>
          Cancel
        </button>
      </div>
    </form>
  );
}
