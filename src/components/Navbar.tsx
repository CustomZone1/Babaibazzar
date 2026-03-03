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
    isPhoneUi,
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
    { href: "/", label: "Home", icon: House },
    { href: "/my-orders", label: "My Orders", icon: ClipboardList, view: "orders" as const },
    { href: "/my-orders?view=wallet", label: "Wallet", icon: Wallet, view: "wallet" as const },
    { href: "/cart", label: "Cart", icon: ShoppingCart },
    { href: "/admin", label: "Admin", icon: Shield },
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
      <div className={`mx-auto flex max-w-6xl gap-3 px-4 py-3 ${isPhoneUi ? "flex-wrap items-center" : "items-center"}`}>
        <Link href="/" className="flex items-center gap-2">
          <img
            src="/brand-logo.png"
            alt="BabaiBazaar logo"
            className="h-10 w-10 rounded-lg border border-neutral-200 object-cover"
          />
          <div className={isPhoneUi ? "hidden" : "block"}>
            <div className="text-base font-semibold text-neutral-900">BabaiBazaar</div>
            <div className="text-xs text-emerald-700">Fast local delivery</div>
          </div>
        </Link>

        <div className={`${isPhoneUi ? "order-3 w-full min-w-0" : "flex-1 min-w-0"}`}>{showSearch ? <NavbarSearch /> : null}</div>

        <nav
          className={`flex items-center rounded-2xl border border-emerald-100 bg-gradient-to-r from-emerald-50 via-lime-50 to-sky-50 p-1 ${
            isPhoneUi ? "order-4 w-full gap-1 overflow-x-auto whitespace-nowrap" : "gap-1"
          }`}
        >
          {navItems.map((item) => {
            let isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            if (pathname === "/my-orders" && item.view === "wallet") isActive = sp.get("view") === "wallet";
            if (pathname === "/my-orders" && item.view === "orders") isActive = sp.get("view") !== "wallet";

            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`inline-flex items-center gap-1.5 rounded-xl px-2.5 py-2 font-medium transition ${
                  isPhoneUi ? "text-[11px]" : "text-sm"
                } ${
                  isActive
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "text-neutral-700 hover:bg-white hover:text-neutral-900"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className={`relative ${isPhoneUi ? "order-2 ml-auto" : ""}`} ref={settingsRef}>
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
  );
}
