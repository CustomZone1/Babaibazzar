"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type SuggestItem = {
  id: string;
  label: string;
  query: string;
};

function useDebounced<T>(value: T, delayMs: number) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(t);
  }, [value, delayMs]);

  return debounced;
}

export default function NavbarSearch() {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<SuggestItem[]>([]);
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  const dq = useDebounced(q.trim(), 220);

  useEffect(() => {
    if (pathname === "/search") {
      setQ(sp.get("q") ?? "");
    }
  }, [pathname, sp]);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
        setActiveIndex(-1);
      }
    }

    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (!dq) {
        setSuggestions([]);
        setLoading(false);
        setActiveIndex(-1);
        return;
      }

      setLoading(true);
      try {
        const res = await fetch(`/api/search?mode=suggest&q=${encodeURIComponent(dq)}`, {
          cache: "no-store",
        });
        const data = await res.json().catch(() => ({}));
        if (cancelled) return;
        const next = Array.isArray(data?.items) ? (data.items as SuggestItem[]) : [];
        setSuggestions(next);
        setActiveIndex(next.length > 0 ? 0 : -1);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [dq]);

  function go(raw?: string) {
    const query = (raw ?? q).trim();
    if (!query) {
      router.push("/search");
      setOpen(false);
      return;
    }
    router.push(`/search?q=${encodeURIComponent(query)}`);
    setOpen(false);
  }

  const showDrop = open && (loading || suggestions.length > 0 || dq.length > 0);

  return (
    <div ref={wrapRef} className="relative w-full max-w-lg">
      <div className="flex items-center gap-2">
        <input
          className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500"
          placeholder="Search products (e.g., sugar, oil, milk)"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              if (!suggestions.length) return;
              setActiveIndex((prev) => (prev + 1) % suggestions.length);
              return;
            }

            if (e.key === "ArrowUp") {
              e.preventDefault();
              if (!suggestions.length) return;
              setActiveIndex((prev) => (prev <= 0 ? suggestions.length - 1 : prev - 1));
              return;
            }

            if (e.key === "Enter") {
              e.preventDefault();
              if (activeIndex >= 0 && suggestions[activeIndex]) {
                go(suggestions[activeIndex].query);
                return;
              }
              go();
            }
          }}
        />
        <button onClick={() => go()} className="rounded-xl border bg-white px-3 py-2 text-sm font-medium">
          Search
        </button>
      </div>

      {showDrop ? (
        <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-lg">
          {loading ? <div className="px-3 py-2 text-sm text-neutral-600">Searching...</div> : null}

          {!loading && suggestions.length === 0 && dq ? (
            <div className="px-3 py-2 text-sm text-neutral-600">No suggestions</div>
          ) : null}

          {!loading
            ? suggestions.map((s, idx) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => go(s.query)}
                  className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm ${
                    idx === activeIndex ? "bg-emerald-50 text-emerald-900" : "hover:bg-neutral-50"
                  }`}
                >
                  <span className="truncate">{s.label}</span>
                  <span className="text-xs text-neutral-400">Enter</span>
                </button>
              ))
            : null}
        </div>
      ) : null}
    </div>
  );
}
