import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { getPrimaryStore } from "@/lib/store";

export const revalidate = 120;

function money(paise: number) {
  return `Rs ${Math.round((paise || 0) / 100)}`;
}

function safeImg(src?: string | null) {
  if (!src) return null;
  const s = src.trim();
  if (!s) return null;
  if (s.startsWith("/") || s.startsWith("http://") || s.startsWith("https://")) return s;
  if (s.startsWith("uploads/")) return `/${s}`;
  return s;
}

function normalizeCategory(value: string | null) {
  const raw = String(value ?? "").trim();
  if (!raw) return null;
  const lower = raw.toLowerCase();
  if (lower === "none" || lower === "null" || lower === "n/a") return null;
  return raw
    .split(/\s+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

export default async function HomePage() {
  const store = await getPrimaryStore();

  if (!store) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10">
        <div className="rounded-2xl border bg-red-50 p-5 text-red-700">
          Store is not configured yet.
        </div>
      </div>
    );
  }

  const [trending, freshArrivals, rawCats] = await Promise.all([
    prisma.product.findMany({
      where: { shopId: store.id, isActive: true, inStock: true, showInTrending: true },
      orderBy: [{ updatedAt: "desc" }],
      take: 10,
    }),
    prisma.product.findMany({
      where: { shopId: store.id, isActive: true, inStock: true, showInNewArrivals: true },
      orderBy: [{ createdAt: "desc" }],
      take: 6,
    }),
    prisma.product.findMany({
      where: { shopId: store.id, isActive: true, category: { not: null } },
      distinct: ["category"],
      select: { category: true },
      take: 20,
    }),
  ]);

  const categories = Array.from(
    new Set(rawCats.map((c) => normalizeCategory(c.category)).filter((c): c is string => !!c))
  ).slice(0, 12);

  const liveProductsCount = trending.length + freshArrivals.length;

  const t = {
    badge: "Local grocery store",
    hero: "Fresh products, fair prices, fast delivery.",
    heroSub: "Order quickly from your trusted neighborhood store.",
    explore: "Browse products",
    track: "My orders",
    liveProducts: "Live products",
    paymentOptions: "Payment options",
    codUpi: "COD and UPI",
    browseByCategory: "Browse by category",
    viewCatalog: "Full catalog",
    trending: "Trending products",
    searchMore: "Search more",
    newArrivals: "New arrivals",
    exploreAll: "Explore all",
    noImage: "No image",
    view: "View",
    catalog: "Product catalog",
    openCatalog: "Open catalog",
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-5 md:py-8">
      <section className="relative overflow-hidden rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-100 via-lime-50 to-sky-100 p-4 text-neutral-900 shadow-[0_16px_45px_rgba(16,185,129,0.18)] sm:p-6 md:p-8">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-r from-emerald-200/70 via-yellow-100/70 to-sky-200/70" />
        <div className="pointer-events-none absolute -top-14 -right-10 h-44 w-44 rounded-full bg-emerald-300/45 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-10 h-40 w-40 rounded-full bg-sky-300/45 blur-3xl" />
        <div className="pointer-events-none absolute top-10 left-1/2 h-28 w-28 -translate-x-1/2 rounded-full bg-yellow-200/50 blur-3xl" />

        <div className="relative grid gap-4 md:grid-cols-[1.25fr_0.75fr] md:gap-7">
          <div>
            <div className="inline-flex items-center rounded-full border border-emerald-300 bg-white/75 px-3 py-1 text-xs font-semibold text-emerald-900 backdrop-blur-sm">
              {t.badge}
            </div>
            <h1 className="mt-3 max-w-2xl text-[1.55rem] font-extrabold leading-tight text-neutral-900 sm:text-4xl md:mt-4 md:text-5xl">
              {t.hero}
            </h1>
            <p className="mt-2 text-sm text-neutral-600 md:mt-3 md:text-base">{t.heroSub}</p>
            <p className="mt-1.5 text-xs text-neutral-500">{store.name}</p>

            <div className="mt-4 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-3 md:mt-6">
              <Link
                href="/products"
                className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2.5 text-center text-sm font-semibold text-white shadow-md hover:from-emerald-700 hover:to-teal-700 md:px-5 md:py-3"
              >
                {t.explore}
              </Link>
              <Link
                href="/my-orders"
                className="rounded-xl border border-emerald-300 bg-white/85 px-4 py-2.5 text-center text-sm font-semibold text-emerald-900 hover:bg-white md:px-5 md:py-3"
              >
                {t.track}
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 md:grid-cols-1 md:gap-3">
            <div className="rounded-2xl border border-emerald-200 bg-white/90 p-3 shadow-sm md:p-4">
              <div className="text-[11px] text-emerald-800 md:text-xs">{t.liveProducts}</div>
              <div className="mt-1 text-lg font-bold md:text-2xl">{liveProductsCount}</div>
            </div>
            <div className="rounded-2xl border border-sky-200 bg-sky-50/80 p-3 shadow-sm md:p-4">
              <div className="text-[11px] text-sky-800 md:text-xs">{t.paymentOptions}</div>
              <div className="mt-1 text-xs font-semibold md:text-sm">{t.codUpi}</div>
            </div>
            <div className="rounded-2xl border border-amber-200 bg-amber-50/85 p-3 shadow-sm md:p-4">
              <div className="text-[11px] text-amber-800 md:text-xs">{t.catalog}</div>
              <Link href="/products" className="mt-1 inline-block text-xs font-semibold text-amber-700 hover:underline md:text-sm">
                {t.openCatalog}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {categories.length > 0 ? (
        <section className="mt-7 md:mt-9">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold">{t.browseByCategory}</h2>
            <Link href="/search" className="text-sm text-neutral-600 hover:underline">
              {t.viewCatalog} &rarr;
            </Link>
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <Link
                key={c}
                href={`/search?category=${encodeURIComponent(c)}`}
                className="rounded-full border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-800 hover:border-neutral-500"
              >
                {c}
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section className="mt-8 md:mt-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">{t.trending}</h2>
          <Link href="/search" className="text-sm text-neutral-600 hover:underline">
            {t.searchMore} &rarr;
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-5">
          {trending.map((p) => {
            const img = safeImg(p.imageUrl);
            return (
              <Link
                key={p.id}
                href="/products"
                className="group rounded-2xl border border-neutral-200 bg-white p-3 transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="relative mb-3 aspect-square overflow-hidden rounded-xl border border-neutral-200 bg-gradient-to-br from-neutral-100 via-white to-neutral-100 shadow-inner">
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(0,0,0,0.04),transparent_45%)]" />
                  {img ? (
                    <Image
                      src={img}
                      alt={p.name}
                      fill
                      className="object-contain p-2 drop-shadow-[0_8px_18px_rgba(0,0,0,0.2)] transition group-hover:scale-[1.03]"
                      sizes="220px"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-neutral-400">
                      {t.noImage}
                    </div>
                  )}
                </div>
                <div className="truncate text-sm font-semibold">{p.name}</div>
                <div className="truncate text-xs text-neutral-500">From your store</div>
                <div className="mt-2 flex items-center justify-between">
                  <div className="font-bold text-emerald-700">{money(p.appPricePaise)}</div>
                  <div className="text-xs text-neutral-400 line-through">{money(p.shopPricePaise)}</div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="mt-8 md:mt-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">{t.newArrivals}</h2>
          <Link href="/search" className="text-sm text-neutral-600 hover:underline">
            {t.exploreAll} &rarr;
          </Link>
        </div>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {freshArrivals.map((p) => {
            const img = safeImg(p.imageUrl);
            return (
              <Link
                key={p.id}
                href="/products"
                className="grid grid-cols-[76px_1fr_auto] items-center gap-3 rounded-2xl border border-neutral-200 bg-white p-3 transition hover:shadow-md"
              >
                <div className="relative h-[76px] w-[76px] overflow-hidden rounded-lg border border-neutral-200 bg-gradient-to-br from-neutral-100 via-white to-neutral-100 shadow-inner">
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(0,0,0,0.05),transparent_45%)]" />
                  {img ? (
                    <Image
                      src={img}
                      alt={p.name}
                      fill
                      className="object-contain p-1.5 drop-shadow-[0_5px_10px_rgba(0,0,0,0.18)]"
                      sizes="76px"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-[11px] text-neutral-400">
                      {t.noImage}
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold">{p.name}</div>
                  <div className="truncate text-xs text-neutral-500">From your store</div>
                  <div className="mt-1 text-sm font-bold text-emerald-700">{money(p.appPricePaise)}</div>
                </div>
                <div className="rounded-lg border border-neutral-300 px-3 py-2 text-xs font-semibold text-neutral-700">
                  {t.view}
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
