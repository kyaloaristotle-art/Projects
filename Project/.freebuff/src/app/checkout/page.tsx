"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/cart-store";
import { formatKSh } from "@/lib/money";

export default function CheckoutPage() {
  const { items, totalCents, clear } = useCart();
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [deliveryMethod, setDeliveryMethod] = useState<"COLLECTION" | "DELIVERY">("COLLECTION");
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"MPESA" | "CASH">("MPESA");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function placeOrder() {
    setBusy(true);
    setError(null);
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: items.map((i) => ({ productId: i.id, qty: i.qty })),
        phone,
        deliveryMethod,
        address: deliveryMethod === "DELIVERY" ? address : undefined,
        paymentMethod,
        note,
      }),
    });
    setBusy(false);
    if (res.ok) {
      const data = await res.json();
      clear();
      router.push(`/account?tab=orders&placed=${data.orderId}`);
      router.refresh();
    } else if (res.status === 401) {
      router.push("/login?next=/checkout");
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Could not place the order. Try again.");
    }
  }

  if (items.length === 0) {
    return (
      <div className="card mx-auto max-w-md text-center">
        <p className="text-4xl">🛒</p>
        <h1 className="mt-2 text-xl font-bold">Your cart is empty</h1>
        <p className="mt-1 text-sm text-gray-500">Add some products first, then come back to check out.</p>
        <button className="btn-primary mt-4" onClick={() => router.push("/products")}>
          Browse products
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-extrabold">Checkout</h1>

      <div className="card">
        <h2 className="font-bold">Order summary</h2>
        <div className="mt-3 divide-y">
          {items.map((i) => (
            <div key={i.id} className="flex items-center justify-between py-2 text-sm">
              <span>
                {i.emoji} {i.name} × {i.qty}
              </span>
              <span className="font-semibold">{formatKSh(i.priceCents * i.qty)}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 flex justify-between border-t pt-3 font-bold">
          <span>Total</span>
          <span>{formatKSh(totalCents)}</span>
        </div>
      </div>

      <div className="card space-y-4">
        <h2 className="font-bold">Your details</h2>
        <div>
          <label className="label" htmlFor="phone">
            Phone number
          </label>
          <input
            id="phone"
            className="input"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="07XX XXX XXX"
            required
          />
        </div>
        <div>
          <span className="label">How do you want to receive it?</span>
          <div className="flex gap-2">
            <button
              type="button"
              className={`btn flex-1 ${deliveryMethod === "COLLECTION" ? "bg-indigo-600 text-white" : "border border-gray-300 bg-white text-gray-700"}`}
              onClick={() => setDeliveryMethod("COLLECTION")}
            >
              🏬 Collect in shop
            </button>
            <button
              type="button"
              className={`btn flex-1 ${deliveryMethod === "DELIVERY" ? "bg-indigo-600 text-white" : "border border-gray-300 bg-white text-gray-700"}`}
              onClick={() => setDeliveryMethod("DELIVERY")}
            >
              🚴 Delivery
            </button>
          </div>
        </div>
        {deliveryMethod === "DELIVERY" && (
          <div>
            <label className="label" htmlFor="address">
              Delivery address
            </label>
            <input
              id="address"
              className="input"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Estate, street, building..."
            />
          </div>
        )}
        <div>
          <label className="label" htmlFor="note">
            Note (optional)
          </label>
          <textarea
            id="note"
            className="input min-h-20"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Anything we should know?"
          />
        </div>
      </div>

      <div className="card space-y-4">
        <h2 className="font-bold">Payment</h2>
        <div className="flex gap-2">
          <button
            type="button"
            className={`btn flex-1 ${paymentMethod === "MPESA" ? "bg-green-600 text-white" : "border border-gray-300 bg-white text-gray-700"}`}
            onClick={() => setPaymentMethod("MPESA")}
          >
            📱 M-Pesa
          </button>
          <button
            type="button"
            className={`btn flex-1 ${paymentMethod === "CASH" ? "bg-green-600 text-white" : "border border-gray-300 bg-white text-gray-700"}`}
            onClick={() => setPaymentMethod("CASH")}
          >
            💵 Cash (at the shop)
          </button>
        </div>
        <p className="text-sm text-gray-500">
          {paymentMethod === "MPESA"
            ? "After placing the order, we'll show you our till/purchase number. Enter the M-Pesa confirmation code from your SMS on the next screen."
            : "Pay cash when you collect your order at the shop."}
        </p>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button className="btn-primary w-full" onClick={placeOrder} disabled={busy || !phone.trim()}>
        {busy ? "Placing order..." : `Place order — ${formatKSh(totalCents)}`}
      </button>
    </div>
  );
}
