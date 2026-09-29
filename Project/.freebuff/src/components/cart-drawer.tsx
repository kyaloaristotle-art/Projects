"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "./cart-store";
import { formatKSh } from "@/lib/money";

export function CartDrawer() {
  const { items, count, totalCents, remove, setQty, clear } = useCart();
  const [open, setOpen] = useState(false);
  const router = useRouter();

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="relative rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
        aria-label="Open cart"
      >
        🛒 Cart
        {count > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
            {count}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white shadow-xl">
            <div className="flex items-center justify-between border-b p-4">
              <h2 className="text-lg font-bold">Your Cart</h2>
              <button onClick={() => setOpen(false)} className="rounded-lg px-3 py-1 text-sm text-gray-500 hover:bg-gray-100">
                Close
              </button>
            </div>

            {items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-2 p-8 text-center text-gray-500">
                <span className="text-4xl">🛒</span>
                <p>Your cart is empty.</p>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto p-4">
                  {items.map((item) => (
                    <div key={item.id} className="mb-3 flex items-center gap-3 rounded-lg border p-3">
                      <span className="text-2xl">{item.emoji}</span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">{item.name}</p>
                        <p className="text-sm text-gray-500">{formatKSh(item.priceCents)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          className="h-7 w-7 rounded border text-sm hover:bg-gray-50"
                          onClick={() => setQty(item.id, item.qty - 1)}
                        >
                          −
                        </button>
                        <span className="w-6 text-center text-sm">{item.qty}</span>
                        <button
                          className="h-7 w-7 rounded border text-sm hover:bg-gray-50"
                          onClick={() => setQty(item.id, item.qty + 1)}
                        >
                          +
                        </button>
                      </div>
                      <button onClick={() => remove(item.id)} className="text-sm text-red-500 hover:underline">
                        Remove
                      </button>
                    </div>
                  ))}
                </div>

                <div className="border-t p-4">
                  <div className="mb-3 flex justify-between text-sm font-semibold">
                    <span>Total</span>
                    <span>{formatKSh(totalCents)}</span>
                    <span className="sr-only">cart totals</span>
                  </div>
                  <button
                    className="btn-primary w-full"
                    onClick={() => {
                      setOpen(false);
                      router.push("/checkout");
                    }}
                  >
                    Checkout
                  </button>
                  <button className="btn-secondary mt-2 w-full" onClick={clear}>
                    Clear cart
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
