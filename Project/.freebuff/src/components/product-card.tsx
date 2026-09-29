"use client";

import { useCart } from "./cart-store";
import { formatKSh } from "@/lib/money";

export type ProductCardData = {
  id: number;
  name: string;
  description: string | null;
  priceCents: number;
  stock: number;
  emoji: string;
};

export function ProductCard({ product }: { product: ProductCardData }) {
  const { add } = useCart();
  const out = product.stock <= 0;

  return (
    <div className="card flex flex-col">
      <div className="mb-2 flex h-24 items-center justify-center rounded-lg bg-gray-50 text-5xl">{product.emoji}</div>
      <h3 className="font-semibold">{product.name}</h3>
      {product.description && <p className="mt-1 line-clamp-2 text-sm text-gray-500">{product.description}</p>}
      <div className="mt-auto pt-3">
        <div className="flex items-center justify-between">
          <span className="font-bold text-indigo-700">{formatKSh(product.priceCents)}</span>
          <span className={`text-xs ${out ? "text-red-500 font-semibold" : "text-gray-400"}`}>
            {out ? "Out of stock" : `${product.stock} in stock`}
          </span>
        </div>
        <button className="btn-primary mt-3 w-full" disabled={out} onClick={() => add({ ...product })}>
          {out ? "Unavailable" : "Add to cart"}
        </button>
      </div>
  </div>
  );
}
