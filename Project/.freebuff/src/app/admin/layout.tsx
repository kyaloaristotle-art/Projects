import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/admin");
  if (user.role !== "ADMIN") redirect("/");

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-gray-900 p-6 text-white">
        <h1 className="text-2xl font-extrabold">🛡️ CyberHub Admin</h1>
        <p className="text-sm text-gray-300">Manage products, services, orders, requests and payments.</p>
      </div>
      <nav className="flex flex-wrap gap-2">
        {[
          { href: "/admin", label: "📊 Dashboard" },
          { href: "/admin/orders", label: "📦 Orders" },
          { href: "/admin/service-requests", label: "🧾 Service requests" },
          { href: "/admin/payments", label: "💳 Payments" },
          { href: "/admin/products", label: "🏷️ Products" },
          { href: "/admin/services", label: "🛠️ Services" },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="badge bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-indigo-50"
          >
            {item.label}
          </Link>
        ))}
      </nav>
      {children}
    </div>
  );
}
