"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function NewProductForm({ categories }: { categories: { id: number; name: string; emoji: string }[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("0");
  const [emoji, setEmoji] = useState("📦");
  const [categoryId, setCategoryId] = useState(categories[0]?.id?.toString() ?? "");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description, price, stock: Number(stock), emoji, categoryId: Number(categoryId) }),
    });
    setBusy(false);
    if (res.ok) {
      setOpen(false);
      setName("");
      setDescription("");
      setPrice("");
      setStock("0");
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Could not create product.");
    }
  }

  if (!open) {
    return (
      <button className="btn-primary" onClick={() => setOpen(true)}>
        ➕ Add product
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="card space-y-3">
      <h3 className="font-bold">New product</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="label">Name</label>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} required minLength={2} />
        </div>
        <div>
          <label className="label">Category</label>
          <select className="input" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.emoji} {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Price (KSh)</label>
          <input className="input" value={price} onChange={(e) => setPrice(e.target.value)} required inputMode="decimal" />
        </div>
        <div>
          <label className="label">Stock</label>
          <input className="input" type="number" min={0} value={stock} onChange={(e) => setStock(e.target.value)} required />
        </div>
        <div>
          <label className="label">Emoji</label>
          <input className="input" value={emoji} onChange={(e) => setEmoji(e.target.value)} maxLength={4} />
        </div>
        <div className="sm:col-span-2">
          <label className="label">Description</label>
          <textarea className="input min-h-20" value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-2">
        <button type="submit" className="btn-primary" disabled={busy}>
          {busy ? "Saving..." : "Save product"}
        </button>
        <button type="button" className="btn-secondary" onClick={() => setOpen(false)}>
          Cancel
        </button>
      </div>
    </form>
  );
}
