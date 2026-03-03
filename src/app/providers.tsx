"use client";

import { CartProvider } from "@/lib/cart";
import { SettingsProvider } from "@/lib/settings";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SettingsProvider>
      <CartProvider>{children}</CartProvider>
    </SettingsProvider>
  );
}
