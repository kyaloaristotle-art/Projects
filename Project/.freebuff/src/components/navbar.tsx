"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CartDrawer } from "./cart-drawer";

export function Navbar({ user }: { user: { name: string; role: string } | null }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function logout() {
    setBusy(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-40 border-b bg-white">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
        <Link href="/" className="flex items-center gap-2 text-lg font-extrabold text-indigo-700">
          <span className="text-2xl">🖥️</span> CyberHub
        </Link>
        <nav className="ml-auto hidden items-center gap-1 md:flex">
          <Link href="/products" className="rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100">
            Products
          </Link>
          <Link href="/services" className="rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100">
            Services
          </Link>
          {user ? (
            <>
              <Link href="/account" className="rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100">
                My Account
              </Link>
              {user.role === "ADMIN" && (
                <Link href="/admin" className="rounded-lg px-3 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-50">
                  Admin
                </Link>
              )}
              <CartDrawer />
              <button onClick={logout} disabled={busy} className="btn-secondary">
                {busy ? "..." : "Log out"}
              </button>
            </>
            ) : (
            <>
              <CartDrawer />
              <Link href="/login" className="btn-primary">
                Log in
              </Link>
            </>
          )}
        </nav>
        <div className="ml-auto flex items-center gap-1 md:hidden">
          <CartDrawer />
        </div>
      </div>
      <nav className="flex gap-1 overflow-x-auto border-t px-4 py-2 md:hidden">
        <Link href="/products" className="whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100">
          Products
        </Link>
        <Link href="/services" className="whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100">
          Services
        </Link>
        {user ? (
          <>
            <Link href="/account" className="whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100">
              My Account
            </Link>
            {user.role === "ADMIN" && (
              <Link href="/admin" className="whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-semibold text-indigo-700 hover:bg-indigo-50">
                Admin
              </Link>
            )}
            <button onClick={logout} className="ml-auto whitespace-nowrap px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-100">
              Log out
            </button>
          </>
        ) : (
          <Link href="/login" className="ml-auto whitespace-nowrap rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white">
            Log in
          </Link>
        )}
      </nav>
    </header>
  );
}
