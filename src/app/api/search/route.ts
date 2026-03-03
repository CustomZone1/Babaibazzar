import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const qRaw = String(searchParams.get("q") || "").trim();
    const mode = String(searchParams.get("mode") || "search").toLowerCase();

    if (!qRaw) {
      if (mode === "suggest") return NextResponse.json({ q: "", items: [] });
      return NextResponse.json({ q: "", results: [] });
    }

    const qNorm = normalize(qRaw);
    const tokens = splitTokens(qRaw);
    const terms = Array.from(new Set([qNorm, ...tokens].filter(Boolean)));

    const orClauses = terms.flatMap((term) => [
      { name: { contains: term, mode: "insensitive" as const } },
      { category: { contains: term, mode: "insensitive" as const } },
      { unit: { contains: term, mode: "insensitive" as const } },
    ]);

    const candidates = await prisma.product.findMany({
      where: {
        isActive: true,
        OR: orClauses,
      },
      orderBy: [{ inStock: "desc" }, { updatedAt: "desc" }],
      take: 120,
      select: {
        id: true,
        name: true,
        category: true,
        unit: true,
        imageUrl: true,
        appPricePaise: true,
        shopPricePaise: true,
        inStock: true,
      },
    });

    const ranked = candidates
      .map((p) => ({
        ...p,
        _score: productScore(p, qNorm, tokens),
      }))
      .filter((p) => p._score > 0)
      .sort((a, b) => b._score - a._score);

    if (mode === "suggest") {
      const items = ranked.slice(0, 8).map((p) => ({
        id: p.id,
        label: `${p.name}${p.category ? ` • ${p.category}` : ""}${p.unit ? ` • ${p.unit}` : ""}`,
        query: p.name,
      }));
      return NextResponse.json({ q: qRaw, items });
    }

    return NextResponse.json({ q: qRaw, results: ranked.slice(0, 50) });
  } catch (e: unknown) {
    console.error("SEARCH API ERROR:", e);
    const message = e instanceof Error ? e.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
