import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/lib/password";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding CyberHub database...");

  // ---------- Users ----------
  const admin = await prisma.user.upsert({
    where: { email: "admin@cyberhub.co.ke" },
    update: {},
    create: {
      name: "CyberHub Admin",
      email: "admin@cyberhub.co.ke",
      phone: "0700000001",
      passwordHash: hashPassword("admin123"),
      role: "ADMIN",
    },
  });

  const customer = await prisma.user.upsert({
    where: { email: "customer@cyberhub.co.ke" },
    update: {},
    create: {
      name: "Achieng Odhiambo",
      email: "customer@cyberhub.co.ke",
      phone: "0700000002",
      passwordHash: hashPassword("customer123"),
      role: "CUSTOMER",
    },
  });

  console.log(`Admin: ${admin.email} / admin123`);
  console.log(`Customer: ${customer.email} / customer123`);

  // ---------- Categories ----------
  const categories = [
    { name: "Storage", slug: "storage", emoji: "💾" },
    { name: "Cables & Chargers", slug: "cables-chargers", emoji: "🔌" },
    { name: "Audio", slug: "audio", emoji: "🎧" },
    { name: "Computer Peripherals", slug: "peripherals", emoji: "🖱️" },
    { name: "Gaming", slug: "gaming", emoji: "🎮" },
    { name: "Stationery & Paper", slug: "stationery", emoji: "📄" },
    { name: "Power", slug: "power", emoji: "🔋" },
  ];

  for (const c of categories) {
    await prisma.category.upsert({
      where: { slug: c.slug },
      update: {},
      create: c,
    });
  }

  const cat = async (slug: string) => {
    const found = await prisma.category.findUnique({ where: { slug } });
    if (!found) throw new Error(`Missing category ${slug}`);
    return found;
  };

  // ---------- Products ----------
  type SeedProduct = {
    name: string;
    categorySlug: string;
    priceCents: number;
    stock: number;
    emoji: string;
    description: string;
  };

  const products: SeedProduct[] = [
    {
      name: "Flash Disk 32GB",
      categorySlug: "storage",
      priceCents: 80000,
      stock: 15,
      emoji: "💾",
      description: "USB 3.0 flash disk, plug-and-play. Ideal for assignments and documents.",
    },
    {
      name: "Flash Disk 64GB",
      categorySlug: "storage",
      priceCents: 140000,
      stock: 10,
      emoji: "💾",
      description: "USB 3.0, faster transfers for larger files and backups.",
    },
    {
      name: "Memory Card 64GB microSD",
      categorySlug: "storage",
      priceCents: 95000,
      stock: 12,
      emoji: "🪪",
      description: "Class 10 microSD card with adapter included.",
    },
    {
      name: "HDMI Cable 1.5m",
      categorySlug: "cables-chargers",
      priceCents: 50000,
      stock: 8,
      emoji: "🔌",
      description: "Full HD 1080p HDMI cable, works with TVs, monitors and consoles.",
    },
    {
      name: "USB-C Charging Cable",
      categorySlug: "cables-chargers",
      priceCents: 35000,
      stock: 25,
      emoji: "🔌",
      description: "Fast-charge compatible USB-C to USB-A cable, 1m.",
    },
    {
      name: "Fast Charger 20W",
      categorySlug: "cables-chargers",
      priceCents: 120000,
      stock: 6,
      emoji: "⚡",
      description: "20W USB-C power adapter for phones and tablets.",
    },
    {
      name: "Earphones (wired)",
      categorySlug: "audio",
      priceCents: 30000,
      stock: 40,
      emoji: "🎧",
      description: "3.5mm wired earphones with mic, comfortable fit.",
    },
    {
      name: "Bluetooth Headphones",
      categorySlug: "audio",
      priceCents: 250000,
      stock: 5,
      emoji: "🎧",
      description: "Over-ear wireless headphones with good battery life.",
    },
    {
      name: "Computer Mouse (wired)",
      categorySlug: "peripherals",
      priceCents: 60000,
      stock: 18,
      emoji: "🖱️",
      description: "Plug-and-play USB mouse, reliable for daily use.",
    },
    {
      name: "Keyboard (wired)",
      categorySlug: "peripherals",
      priceCents: 110000,
      stock: 9,
      emoji: "⌨️",
      description: "USB keyboard with comfortable keys, spill resistant.",
    },
    {
      name: "Gaming Controller",
      categorySlug: "gaming",
      priceCents: 250000,
      stock: 3,
      emoji: "🎮",
      description: "Wireless controller compatible with PC and PlayStation.",
    },
    {
      name: "Football Game Disc (PS4)",
      categorySlug: "gaming",
      priceCents: 300000,
      stock: 4,
      emoji: "💿",
      description: "Latest football game disc for PlayStation consoles.",
    },
    {
      name: "Ream of A4 Paper",
      categorySlug: "stationery",
      priceCents: 65000,
      stock: 20,
      emoji: "📄",
      description: "500 sheets, 80gsm, ideal for printing and photocopying.",
    },
    {
      name: "Extension Cable 4-way",
      categorySlug: "power",
      priceCents: 90000,
      stock: 7,
      emoji: "🔋",
      description: "4-way surge-protected extension cable, 3m.",
    },
    {
      name: "Power Bank 10,000mAh",
      categorySlug: "power",
      priceCents: 180000,
      stock: 6,
      emoji: "🔋",
      description: "Dual USB output power bank, charges two devices at once.",
    },
  ];

  for (const p of products) {
    const exists = await prisma.product.findFirst({ where: { name: p.name } });
    if (exists) continue;
    const category = await cat(p.categorySlug);
    await prisma.product.create({
      data: {
        name: p.name,
        description: p.description,
        priceCents: p.priceCents,
        stock: p.stock,
        emoji: p.emoji,
        categoryId: category.id,
      },
    });
  }

  // ---------- Services ----------
  type SeedService = {
    name: string;
    category: string;
    priceCents: number | null;
    unit?: string;
    description: string;
  };

  const services: SeedService[] = [
    {
      name: "Internet Browsing",
      category: "CYBER",
      priceCents: 5000,
      unit: "per 30 min",
      description: "Browse the internet on our fast connection.",
    },
    {
      name: "Typing & Document Preparation",
      category: "CYBER",
      priceCents: 10000,
      unit: "per page",
      description: "Professional typing of documents, assignments and letters.",
    },
    {
      name: "Printing (Black & White)",
      category: "PRINTING",
      priceCents: 500,
      unit: "per page",
      description: "Sharp black & white printing on quality A4 paper.",
    },
    {
      name: "Printing (Colour)",
      category: "PRINTING",
      priceCents: 2000,
      unit: "per page",
      description: "Vibrant colour printing for presentations and photos.",
    },
    {
      name: "Scanning",
      category: "PRINTING",
      priceCents: 2000,
      unit: "per page",
      description: "High-resolution scanning to PDF or image, sent to your email.",
    },
    {
      name: "Photocopying",
      category: "PRINTING",
      priceCents: 300,
      unit: "per copy",
      description: "Quick, clear photocopies.",
    },
    {
      name: "Laminating",
      category: "OTHER",
      priceCents: 5000,
      unit: "per document",
      description: "Protect IDs, certificates and cards.",
    },
    {
      name: "KRA PIN Registration",
      category: "ONLINE",
      priceCents: null,
      description: "We register and download your KRA PIN certificate online.",
    },
    {
      name: "HELB Application Assistance",
      category: "ONLINE",
      priceCents: null,
      description: "Help with HELB loan application forms and uploads.",
    },
    {
      name: "HEF / University Placement (KUCCPS)",
      category: "ACADEMIC",
      priceCents: null,
      description: "Guidance and online submission for placement applications.",
    },
    {
      name: "CV & Cover Letter Writing",
      category: "ACADEMIC",
      priceCents: 30000,
      description: "Professionally written CV tailored to your target job.",
    },
    {
      name: "Email & Account Assistance",
      category: "ONLINE",
      priceCents: 10000,
      description: "Create, recover or secure your email and online accounts.",
    },
    {
      name: "Online Form Filling",
      category: "ONLINE",
      priceCents: 15000,
      description: "We fill online applications and forms accurately and fast.",
    },
    {
      name: "eCitizen Services",
      category: "ONLINE",
      priceCents: null,
      description: "Passport, good conduct, business permits and more.",
    },
  ];

  for (const s of services) {
    const exists = await prisma.service.findFirst({ where: { name: s.name } });
    if (exists) continue;
    await prisma.service.create({
      data: {
        name: s.name,
        category: s.category,
        priceCents: s.priceCents,
        unit: s.unit ?? null,
        description: s.description,
      },
    });
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
