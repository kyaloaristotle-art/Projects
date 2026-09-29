import { prisma } from "@/lib/db";
import { formatKSh } from "@/lib/money";
import { RequestServiceButton } from "@/app/services/request-button";

export const dynamic = "force-dynamic";

const serviceEmoji: Record<string, string> = {
  CYBER: "💻",
  PRINTING: "🖨️",
  ONLINE: "🌐",
  ACADEMIC: "🎓",
  GAMING: "🎮",
  OTHER: "🧰",
};

const categoryLabels: Record<string, string> = {
  CYBER: "Cyber Services",
  PRINTING: "Printing, Scanning & Photocopying",
  ONLINE: "Online Services",
  ACADEMIC: "Academic Services",
  GAMING: "Gaming",
  OTHER: "Other Services",
};

export default async function ServicesPage() {
  const services = await prisma.service.findMany({ where: { active: true }, orderBy: { name: "asc" } });

  const grouped = new Map<string, typeof services>();
  for (const s of services) {
    const list = grouped.get(s.category) ?? [];
    list.push(s);
    grouped.set(s.category, list);
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold">Services</h1>
        <p className="text-gray-500">
          Pick a service and tell us what you need. We confirm the details and price, then you pay — cash at the shop or
          via M-Pesa.
        </p>
      </div>

      {[...grouped.entries()].map(([category, list]) => (
        <section key={category}>
          <h2 className="mb-3 text-lg font-bold">
            {serviceEmoji[category] ?? "🧰"} {categoryLabels[category] ?? category}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((s) => (
              <div key={s.id} className="card flex flex-col">
                <h3 className="font-semibold">{s.name}</h3>
                {s.description && <p className="mt-1 text-sm text-gray-500">{s.description}</p>}
                <div className="mt-auto flex items-center justify-between pt-3">
                  <span className="text-sm font-semibold text-indigo-700">
                    {s.priceCents != null ? formatKSh(s.priceCents) : "Quoted per request"}
                    {s.unit ? ` ${s.unit}` : ""}
                  </span>
                  <RequestServiceButton serviceId={s.id} name={s.name} />
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
