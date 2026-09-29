import { prisma } from "@/lib/db";
import { formatKSh } from "@/lib/money";
import { NewProductForm } from "./new-product-form";
import { ProductRowActions } from "./product-row-actions";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const [products, categories] = await Promise.all([
    prisma.product.findMany({ include: { category: true }, orderBy: { name: "asc" } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold">Products</h2>

      <NewProductForm categories={categories.map((c) => ({ id: c.id, name: c.name, emoji: c.emoji }))} />

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-gray-500">
              <th className="py-2 pr-3">Product</th>
              <th className="py-2 pr-3">Category</th>
              <th className="py-2 pr-3">Price</th>
              <th className="py-2 pr-3">Stock</th>
              <th className="py-2 pr-3">Status</th>
              <th className="py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b last:border-0">
                <td className="py-2 pr-3 font-medium">
                  {p.emoji} {p.name}
                </td>
                <td className="py-2 pr-3 text-gray-500">{p.category.name}</td>
                <td className="py-2 pr-3">{formatKSh(p.priceCents)}</td>
                <td className="py-2 pr-3">
                  <span className={p.stock <= 5 ? "font-bold text-amber-600" : ""}>{p.stock}</span>
                </td>
                <td className="py-2 pr-3">
                  {p.active ? (
                    <span className="badge bg-green-100 text-green-800">Active</span>
                  ) : (
                    <span className="badge bg-gray-100 text-gray-500">Hidden</span>
                  )}
                </td>
                <td className="py-2">
                  <ProductRowActions productId={p.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
