"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, phone, password }),
    });
    setBusy(false);
    if (res.ok) {
      router.push("/account");
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Registration failed. Try again.");
    }
  }

  return (
    <div className="mx-auto max-w-sm">
      <h1 className="text-2xl font-extrabold">Create your account</h1>
      <p className="mt-1 text-sm text-gray-500">Order products and request services in a few clicks.</p>

      <form onSubmit={submit} className="card mt-6 space-y-4">
        <div>
          <label className="label" htmlFor="name">
            Full name
          </label>
          <input id="name" required className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Wanjiku" />
        </div>
        <div>
          <label className="label" htmlFor="email">
            Email
          </label>
          <input id="email" type="email" required className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
        </div>
        <div>
          <label className="label" htmlFor="phone">
            Phone (optional)
          </label>
          <input id="phone" className="input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="07XX XXX XXX" />
        </div>
        <div>
          <label className="label" htmlFor="password">
            Password (min 6 characters)
          </label>
          <input
            id="password"
            type="password"
            required
            minLength={6}
            className="input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button type="submit" className="btn-primary w-full" disabled={busy}>
          {busy ? "Creating account..." : "Create account"}
        </button>
        <p className="text-center text-sm text-gray-500">
          Already registered?{" "}
          <Link href="/login" className="font-medium text-indigo-600 hover:underline">
            Log in
          </Link>
        </p>
      </form>
    </div>
  );
}
