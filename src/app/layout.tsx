import "./globals.css";
import Providers from "./providers";
import Navbar from "@/components/Navbar";
import { Suspense } from "react";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Suspense fallback={<div className="h-[68px] border-b bg-white" />}>
            <Navbar />
          </Suspense>
          {children}
        </Providers>
      </body>
    </html>
  );
}
