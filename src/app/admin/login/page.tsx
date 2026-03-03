"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [nextUrl, setNextUrl] = useState("/admin/orders");

  const [passcode, setPasscode] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const v = new URLSearchParams(window.location.search).get("next") || "/admin/orders";
    setNextUrl(v);
  }, []);

  async function onLogin() {
    setErr(null);
    setLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passcode }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setErr(data?.error || "Login failed");
        setLoading(false);
        return;
      }

      router.replace(nextUrl);
    } catch {
      setErr("Server error");
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md rounded-xl border bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold">Admin Login</h1>
        <p className="text-sm text-gray-600 mt-1">Enter passcode to access admin.</p>

        <input
          className="mt-4 w-full rounded-lg border px-3 py-2 outline-none focus:ring"
          type="password"
          value={passcode}
          onChange={(e) => setPasscode(e.target.value)}
          placeholder="Passcode"
          onKeyDown={(e) => {
            if (e.key === "Enter") onLogin();
          }}
        />

        {err && (
          <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {err}
          </div>
        )}

        <button
          className="mt-4 w-full rounded-lg bg-black px-4 py-2 text-white disabled:opacity-60"
          onClick={onLogin}
          disabled={loading || passcode.length === 0}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </div>
    </main>
  );
}
