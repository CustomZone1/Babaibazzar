"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSettings } from "@/lib/settings";

type Mode = "create" | "existing";

export default function LoginPage() {
  const router = useRouter();
  const { lang, refreshAuth } = useSettings();
  const hi = lang === "hi";

  const [mode, setMode] = useState<Mode>("create");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const t = {
    existing: hi ? "Existing Account" : "Existing Account",
    create: hi ? "Create Account" : "Create Account",
    firstName: hi ? "First name" : "First name",
    lastName: hi ? "Last name" : "Last name",
    username: hi ? "Username" : "Username",
    password: hi ? "Password" : "Password",
    confirmPassword: hi ? "Confirm password" : "Confirm password",
    createBtn: hi ? "Create Account" : "Create Account",
    loginBtn: hi ? "Login" : "Login",
    requiredCreate: hi
      ? "Please fill first name, last name, username and password."
      : "Please fill first name, last name, username and password.",
    requiredExisting: hi ? "Please fill username and password." : "Please fill username and password.",
    passMismatch: hi ? "Password and confirm password must match." : "Password and confirm password must match.",
    usernameTaken: hi ? "Username already taken." : "Username already taken.",
    suggestions: hi ? "Try these available usernames:" : "Try these available usernames:",
    note: "Remember the info you fill in this page.",
  };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuggestions([]);

    if (mode === "create") {
      if (!firstName.trim() || !lastName.trim() || !username.trim() || !password.trim() || !confirmPassword.trim()) {
        setError(t.requiredCreate);
        return;
      }
      if (password !== confirmPassword) {
        setError(t.passMismatch);
        return;
      }
    } else {
      if (!username.trim() || !password.trim()) {
        setError(t.requiredExisting);
        return;
      }
    }

    setLoading(true);
    try {
      const endpoint = mode === "create" ? "/api/auth/register" : "/api/auth/login";
      const body =
        mode === "create"
          ? {
              firstName: firstName.trim(),
              lastName: lastName.trim(),
              username: username.trim(),
              password: password.trim(),
            }
          : {
              username: username.trim(),
              password: password.trim(),
            };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = String(data?.error || "Authentication failed");
        setError(msg);
        if (msg.toLowerCase().includes("username already taken")) {
          setSuggestions(Array.isArray(data?.suggestions) ? data.suggestions : []);
        }
        return;
      }

      await refreshAuth();
      router.push("/my-orders");
      router.refresh();
    } catch (e: any) {
      setError(e?.message || "Server error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 p-4">
      <div className="mx-auto mt-10 max-w-md rounded-xl border bg-white p-5">
        <p className="mt-1 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">{t.note}</p>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setMode("create")}
            className={`rounded-lg border px-3 py-2 text-sm font-medium ${
              mode === "create" ? "bg-black text-white" : "bg-white"
            }`}
          >
            {t.create}
          </button>
          <button
            type="button"
            onClick={() => setMode("existing")}
            className={`rounded-lg border px-3 py-2 text-sm font-medium ${
              mode === "existing" ? "bg-black text-white" : "bg-white"
            }`}
          >
            {t.existing}
          </button>
        </div>

        <form className="mt-4 space-y-3" onSubmit={onSubmit}>
          {mode === "create" ? (
            <>
              <input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder={t.firstName}
                className="w-full rounded-lg border px-3 py-2 text-sm"
              />
              <input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder={t.lastName}
                className="w-full rounded-lg border px-3 py-2 text-sm"
              />
            </>
          ) : null}

          <input
            value={username}
            onChange={(e) => setUsername(e.target.value.toLowerCase())}
            placeholder={t.username}
            className="w-full rounded-lg border px-3 py-2 text-sm"
          />

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t.password}
            className="w-full rounded-lg border px-3 py-2 text-sm"
          />

          {mode === "create" ? (
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder={t.confirmPassword}
              className="w-full rounded-lg border px-3 py-2 text-sm"
            />
          ) : null}

          {error ? <div className="text-sm text-red-600">{error}</div> : null}
          {suggestions.length > 0 ? (
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-2">
              <div className="mb-1 text-xs font-medium text-blue-700">{t.suggestions}</div>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setUsername(s)}
                    className="rounded-full border border-blue-300 bg-white px-2 py-1 text-xs text-blue-700"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <button
            className="w-full rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            type="submit"
            disabled={loading}
          >
            {loading ? "..." : mode === "create" ? t.createBtn : t.loginBtn}
          </button>
        </form>
      </div>
    </main>
  );
}
