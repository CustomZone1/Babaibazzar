"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type Suggest = { id: string; label: string };

function useDebounced<T>(value: T, delayMs: number) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(t);
  }, [value, delayMs]);
  return debounced;
}

export default function SearchBar() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const dq = useDebounced(q.trim(), 250);

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [suggest, setSuggest] = useState<Suggest[]>([]);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target as any)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (!dq) {
        setSuggest([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const res = await fetch(`/api/search?mode=suggest&q=${encodeURIComponent(dq)}`);
        const data = await res.json().catch(() => ({ items: [] }));
        if (cancelled) return;
        setSuggest(Array.isArray(data.items) ? data.items : []);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [dq]);

  const hasDrop = open && (loading || suggest.length > 0);

  const submit = (text?: string) => {
    const query = (text ?? q).trim();
    if (!query) return;
    setOpen(false);
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  const placeholder = useMemo(
    () => "Search products (e.g., oil, sugar, milk)…",
    []
  );

  return (
    <div ref={wrapRef} className="relative w-full max-w-2xl">
      <div className="flex items-center gap-2 rounded-xl border bg-white px-3 py-2">
        <input
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter") submit();
          }}
          placeholder={placeholder}
          className="w-full bg-transparent text-sm outline-none"
        />
        <button
          onClick={() => submit()}
          className="rounded-lg bg-black px-3 py-2 text-sm font-semibold text-white"
        >
          Search
        </button>
      </div>

      {hasDrop ? (
        <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-xl border bg-white shadow">
          {loading ? (
            <div className="px-3 py-2 text-sm text-gray-600">Searching…</div>
          ) : null}

          {suggest.map((s) => (
            <button
              key={s.id}
              onClick={() => submit(s.label.split(" • ")[0])}
              className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-gray-50"
            >
              <span className="truncate">{s.label}</span>
              <span className="text-xs text-gray-400">↵</span>
            </button>
          ))}

          {!loading && suggest.length === 0 && dq ? (
            <div className="px-3 py-2 text-sm text-gray-600">No suggestions</div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
