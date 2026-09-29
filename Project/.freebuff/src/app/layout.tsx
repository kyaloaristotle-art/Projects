import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/components/cart-store";
import { Navbar } from "@/components/navbar";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "CyberHub — Cyber Services & Online Shop",
  description:
    "Cyber services, printing, online applications, electronics and more — one hub for services and products.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900">
        <CartProvider>
          <Navbar user={user ? { name: user.name, role: user.role } : null} />
          <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
          <footer className="border-t bg-white">
            <div className="mx-auto max-w-6xl px-4 py-6 text-sm text-gray-500">
              🖥️ CyberHub Integrated Services &amp; Online Shop — services and products, one hub.
            </div>
          </footer>
        </CartProvider>
      </body>
    </html>
  );
}
