import { prisma } from "@/lib/db";
import { formatKSh } from "@/lib/money";
import { NewServiceForm } from "./new-service-form";
import { ServiceRowActions } from "./service-row-actions";

export const dynamic = "force-dynamic";

const categoryLabels: Record<string, string> = {
  CYBER: "Cyber",
  PRINTING: "Printing",
  ONLINE: "Online",
  ACADEMIC: "Academic",
  GAMING: "Gaming",
  OTHER: "Other",
};

export default async function AdminServicesPage() {
  const services = await prisma.service.findMany({ orderBy: [{ category: "asc" }, { name: "asc" }] });

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold">Services</h2>

      <NewServiceForm />

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-gray-500">
              <th className="py-2 pr-3">Service</th>
              <th className="py-2 pr-3">Category</th>
              <th className="py-2 pr-3">Price</th>
              <th className="py-2 pr-3">Status</th>
              <th className="py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {services.map((s) => (
              <tr key={s.id} className="border-b last:border-0">
                <td className="py-2 pr-3 font-medium">{s.name}</td>
                <td className="py-2 pr-3 text-gray-500">{categoryLabels[s.category] ?? s.category}</td>
                <td className="py-2 pr-3">
                  {s.priceCents != null ? formatKSh(s.priceCents) : "Quoted"}
                  {s.unit ? ` ${s.unit}` : ""}
                </td>
                <td className="py-2 pr-3">
                  {s.active ? (
                    <span className="badge bg-green-100 text-green-800">Active</span>
                  ) : (
                    <span className="badge bg-gray-100 text-gray-500">Hidden</span>
                  )}
                </td>
                <td className="py-2">
                  <ServiceRowActions serviceId={s.id} active={s.active} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
