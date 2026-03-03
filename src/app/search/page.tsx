import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";

type PageProps = {
  searchParams?: any;
};

async function unwrapSearchParams(searchParams: any) {
  if (searchParams && typeof searchParams.then === "function") {
    return await searchParams;
  }
  return searchParams ?? {};
}

function first(sp: Record<string, any>, key: string) {
  const v = sp?.[key];
  if (Array.isArray(v)) return v[0] ?? "";
  return v ?? "";
}

function safeImg(src?: string | null) {
  if (!src) return null;
  const s = src.trim();
  if (!s) return null;
  if (s.startsWith("/") || s.startsWith("http://") || s.startsWith("https://")) return s;
  if (s.startsWith("uploads/")) return `/${s}`;
  return s;
}

function money(paise: number) {
  return `Rs ${Math.round(paise / 100)}`;
}

function normalize(v: string) {
  return v.trim().toLowerCase().replace(/\s+/g, " ");
}

function splitTokens(v: string) {
  return Array.from(new Set(normalize(v).split(" ").filter(Boolean)));
}

function productScore(
  p: { name: string; category: string | null; unit: string | null; inStock: boolean },
  qNorm: string,
  tokens: string[]
) {
  const name = normalize(p.name);
  const category = normalize(p.category || "");
  const unit = normalize(p.unit || "");

  let score = 0;

  if (name === qNorm) score += 1200;
  if (name.startsWith(qNorm)) score += 800;
  if (name.includes(qNorm)) score += 450;

  if (category.startsWith(qNorm)) score += 240;
  if (category.includes(qNorm)) score += 160;

  if (unit.startsWith(qNorm)) score += 140;
  if (unit.includes(qNorm)) score += 90;

  for (const t of tokens) {
    if (name.startsWith(t)) score += 110;
    else if (name.includes(t)) score += 70;

    if (category.includes(t)) score += 35;
    if (unit.includes(t)) score += 20;
  }

  if (p.inStock) score += 15;
  return score;
}

export default async function SearchPage({ searchParams }: PageProps) {
  const sp = await unwrapSearchParams(searchParams);

  const qRaw = String(first(sp, "q") || first(sp, "query") || "").trim();
  const category = String(first(sp, "category") || "").trim();

  if (!qRaw && !category) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10">
        <h1 className="text-2xl font-bold">Search</h1>
        <p className="mt-2 text-neutral-600">
          Start typing in the top search bar (for example: sugar, oil, milk).
        </p>
        <div className="mt-6 rounded-2xl border bg-white p-6">
          <div className="text-sm text-neutral-700">Tip: try searching with short words like oil, atta, milk.</div>
          <Link href="/" className="mt-4 inline-flex rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white">
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  const qNorm = normalize(qRaw);
  const tokens = splitTokens(qRaw);
  const terms = Array.from(new Set([qNorm, ...tokens].filter(Boolean)));

  const whereProduct: any = {
    isActive: true,
    ...(category ? { category: { contains: category, mode: "insensitive" } } : {}),
    ...(terms.length
      ? {
          OR: terms.flatMap((term) => [
            { name: { contains: term, mode: "insensitive" } },
            { category: { contains: term, mode: "insensitive" } },
            { unit: { contains: term, mode: "insensitive" } },
          ]),
        }
      : {}),
  };

  const rawProducts = await prisma.product.findMany({
    where: whereProduct,
    take: 120,
    orderBy: [{ inStock: "desc" }, { updatedAt: "desc" }],
  });

  const products = terms.length
    ? rawProducts
        .map((p) => ({ p, score: productScore(p, qNorm, tokens) }))
        .filter((x) => x.score > 0)
        .sort((a, b) => b.score - a.score)
        .map((x) => x.p)
    : rawProducts;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Search results</h1>
          <p className="mt-1 text-sm text-neutral-600">
            {qRaw ? (
              <>
                Showing results for <b>"{qRaw}"</b> ({products.length})
              </>
            ) : (
              <>
                Showing category <b>"{category}"</b> ({products.length})
              </>
            )}
          </p>
        </div>

        <Link href="/" className="rounded-xl border px-4 py-2 text-sm">
          Back
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="mt-8 rounded-2xl border bg-white p-6">
          <div className="text-lg font-semibold">No results</div>
          <div className="mt-2 text-sm text-neutral-600">Try a shorter search like oil, milk, sugar, or atta.</div>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-5">
          {products.map((p) => {
            const img = safeImg(p.imageUrl);
            return (
              <Link
                key={p.id}
                href="/products"
                className="group rounded-2xl border bg-white p-3 transition hover:shadow-md"
              >
                <div className="relative mb-3 aspect-square overflow-hidden rounded-xl bg-neutral-50">
                  {img ? (
                    <Image
                      src={img}
                      alt={p.name}
                      fill
                      className="object-cover transition group-hover:scale-[1.03]"
                      sizes="200px"
                      unoptimized
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-neutral-400">No image</div>
                  )}
                </div>

                <div className="truncate text-sm font-semibold">{p.name}</div>
                <div className="truncate text-xs text-neutral-500">{p.unit || p.category || "From your store"}</div>

                <div className="mt-2 flex items-center justify-between">
                  <div className="font-bold text-emerald-700">{money(p.appPricePaise)}</div>
                  <div className="text-xs text-neutral-400 line-through">{money(p.shopPricePaise)}</div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
