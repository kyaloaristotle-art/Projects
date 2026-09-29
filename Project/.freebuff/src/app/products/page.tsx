import Link from "next/link";
import { prisma } from "@/lib/db";
import { ProductCard } from "@/components/product-card";

export const dynamic = "force-dynamic";

export default async function ProductsPage({ searchParams }: { searchParams: Promise<{ cat?: string }> }) {
  const { cat } = await searchParams;
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
  const category = cat ? categories.find((c) => c.slug === cat) : undefined;
  const products = await prisma.product.findMany({
    where: { active: true, ...(category ? { categoryId: category.id } : {}) },
    include: { category: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold">Products</h1>
        <p className="text-gray-500">Electronics, accessories and everyday essentials. Order online, collect in store.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Link
          href="/products"
          className={`badge ${!cat ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-700"} px-3 py-1.5`}
        >
          All
        </Link>
        {categories.map((c) => (
          <Link
            key={c.id}
            href={`/products?cat=${c.slug}`}
            className={`badge ${cat === c.slug ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-700"} px-3 py-1.5`}
          >
            {c.emoji} {c.name}
          </Link>
        ))}
      </div>

      {products.length === 0 ? (
        <div className="card text-center text-gray-500">No products found in this category yet.</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((p) => (
            <ProductCard
              key={p.id}
              product={{
                id: p.id,
                name: p.name,
                description: p.description,
                priceCents: p.priceCents,
                stock: p.stock,
                emoji: p.emoji,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
