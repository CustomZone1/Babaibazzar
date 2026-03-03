"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import NavbarSearch from "./NavbarSearch";
import {
  House,
  ClipboardList,
  Wallet,
  ShoppingCart,
  Shield,
  Settings,
  LogIn,
  LogOut,
  Bell,
  Trash2,
  UserRound,
} from "lucide-react";
import { useSettings } from "@/lib/settings";

export default function Navbar() {
  const pathname = usePathname();
  const sp = useSearchParams();
  const router = useRouter();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const settingsRef = useRef<HTMLDivElement | null>(null);

  const {
    notifications,
    setNotifications,
    isLoggedIn,
    isAuthLoading,
    userName,
    userUsername,
    logout,
    clearAppData,
  } = useSettings();

  const showSearch = !pathname.startsWith("/admin");

  const navItems = [
    { href: "/", label: "Home", shortLabel: "Home", icon: House },
    { href: "/my-orders", label: "My Orders", shortLabel: "Orders", icon: ClipboardList, view: "orders" as const },
    { href: "/my-orders?view=wallet", label: "Wallet", shortLabel: "Wallet", icon: Wallet, view: "wallet" as const },
    { href: "/cart", label: "Cart", shortLabel: "Cart", icon: ShoppingCart },
    { href: "/admin", label: "Admin", shortLabel: "Admin", icon: Shield },
  ];

  useEffect(() => {
    function onPointerDown(e: MouseEvent) {
      if (!settingsOpen) return;
      const target = e.target as Node | null;
      if (settingsRef.current && target && !settingsRef.current.contains(target)) {
        setSettingsOpen(false);
      }
    }

    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [settingsOpen]);

  return (
    <div className="sticky top-0 z-40 border-b border-neutral-200 bg-white/95 backdrop-blur">
      <div className="mx-auto max-w-6xl px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <Link href="/" className="flex min-w-0 items-center gap-2">
            <img
              src="/brand-logo.svg"
              alt="BabaiBazaar logo"
              className="h-10 w-10 rounded-lg border border-neutral-200 object-cover"
            />
            <div className="min-w-0">
              <div className="truncate text-base font-semibold text-neutral-900">BabaiBazaar</div>
              <div className="hidden text-xs text-emerald-700 sm:block">Fast local delivery</div>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href="/"
              className={`inline-flex items-center gap-1 rounded-xl border px-2.5 py-2 text-xs font-medium md:hidden ${
                pathname === "/" ? "bg-emerald-600 text-white border-emerald-600" : "bg-white text-neutral-700"
              }`}
            >
              <House className="h-4 w-4" />
              Home
            </Link>

            <div className="relative" ref={settingsRef}>
              <button
                type="button"
                onClick={() => setSettingsOpen((v) => !v)}
                className="rounded-xl border border-neutral-200 bg-white p-2 text-neutral-700 hover:bg-neutral-50"
                aria-expanded={settingsOpen}
                aria-label="Settings"
              >
                <Settings className="h-5 w-5" />
              </button>

              {settingsOpen ? (
                <div className="absolute right-0 z-50 mt-2 w-72 rounded-2xl border border-neutral-200 bg-white p-3 shadow-xl">
                  <div className="mb-2 text-sm font-semibold">Settings</div>

                  <div className="mb-3 rounded-xl border border-neutral-200 p-3">
                    <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-neutral-500">
                      <UserRound className="h-4 w-4" />
                      Account
                    </div>

                    {isAuthLoading ? (
                      <div className="mb-2 text-xs text-neutral-500">Checking account...</div>
                    ) : isLoggedIn ? (
                      <div className="mb-2 text-xs text-neutral-700">
                        {userName ? `${userName} - ` : ""}@{userUsername}
                      </div>
                    ) : (
                      <div className="mb-2 text-xs text-neutral-500">You are not logged in.</div>
                    )}

                    {!isLoggedIn ? (
                      <button
                        type="button"
                        className="inline-flex w-full items-center justify-center gap-2 rounded-lg border px-2 py-2 text-xs font-medium"
                        onClick={() => router.push("/login")}
                      >
                        <LogIn className="h-4 w-4" />
                        Login
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="inline-flex w-full items-center justify-center gap-2 rounded-lg border px-2 py-2 text-xs font-medium"
                        onClick={async () => {
                          await logout();
                          router.refresh();
                        }}
                      >
                        <LogOut className="h-4 w-4" />
                        Logout
                      </button>
                    )}
                  </div>

                  <div className="mb-3 rounded-xl border border-neutral-200 p-2">
                    <button
                      type="button"
                      onClick={() => setNotifications(!notifications)}
                      className="inline-flex w-full items-center justify-between rounded-lg border px-2 py-2 text-xs"
                    >
                      <span className="inline-flex items-center gap-2">
                        <Bell className="h-4 w-4" />
                        Notifications
                      </span>
                      <span className={notifications ? "text-emerald-700" : "text-neutral-500"}>
                        {notifications ? "ON" : "OFF"}
                      </span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      clearAppData();
                      router.refresh();
                      setSettingsOpen(false);
                    }}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-red-200 px-2 py-2 text-xs font-medium text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                    Clear cart and local data
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {showSearch ? (
          <div className="mt-3">
            <NavbarSearch />
          </div>
        ) : null}

        <nav className="mt-3 grid w-full grid-cols-5 gap-1 rounded-2xl border border-emerald-100 bg-gradient-to-r from-emerald-50 via-lime-50 to-sky-50 p-1 md:flex md:flex-wrap md:items-center md:gap-1">
          {navItems.map((item) => {
            let isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            if (pathname === "/my-orders" && item.view === "wallet") isActive = sp.get("view") === "wallet";
            if (pathname === "/my-orders" && item.view === "orders") isActive = sp.get("view") !== "wallet";

            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`inline-flex min-w-0 flex-col items-center justify-center gap-1 rounded-xl px-1 py-2 text-[10px] font-medium transition md:flex-row md:gap-1.5 md:px-2.5 md:text-sm ${
                  isActive ? "bg-emerald-600 text-white shadow-sm" : "text-neutral-700 hover:bg-white hover:text-neutral-900"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="truncate leading-none md:hidden">{item.shortLabel}</span>
                <span className="hidden md:inline">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
