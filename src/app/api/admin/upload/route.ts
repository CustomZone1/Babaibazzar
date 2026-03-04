import { NextRequest, NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import crypto from "crypto";

export const runtime = "nodejs";

function safeExt(filename?: string, mimeType?: string) {
  const fromName = (filename || "").split(".").pop()?.toLowerCase() || "";
  if (["jpg", "jpeg", "png", "webp"].includes(fromName)) return fromName;

  const mt = String(mimeType || "").toLowerCase();
  if (mt.includes("png")) return "png";
  if (mt.includes("webp")) return "webp";
  return "jpg";
}

function requireAdmin(req: NextRequest) {
  return req.cookies.get("bb_admin")?.value === "1";
}

async function uploadToSupabaseStorage(file: Blob, filename: string, contentType: string) {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  const bucket = process.env.SUPABASE_STORAGE_BUCKET || "product-images";

  if (!supabaseUrl || !serviceKey) {
    throw new Error(
      "Upload storage is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in Vercel."
    );
  }

  const filePath = `products/${filename}`;
  const uploadUrl = `${supabaseUrl}/storage/v1/object/${bucket}/${filePath}`;

  const uploadRes = await fetch(uploadUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${serviceKey}`,
      apikey: serviceKey,
      "Content-Type": contentType || "application/octet-stream",
      "x-upsert": "true",
    },
    body: file,
  });

  if (!uploadRes.ok) {
    const text = await uploadRes.text().catch(() => "");
    throw new Error(`Supabase upload failed: ${text || uploadRes.statusText}`);
  }

  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${filePath}`;
}

export async function POST(req: NextRequest) {
  try {
    if (!requireAdmin(req)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const form = await req.formData();
    const file = form.get("file");
    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "File missing" }, { status: 400 });
    }

    const blob = file as Blob;
    const originalName = (file as any)?.name as string | undefined;
    const mimeType = ((file as any)?.type as string | undefined) || "application/octet-stream";
    const ext = safeExt(originalName, mimeType);
    const filename = `${crypto.randomUUID()}.${ext}`;

    const maxBytes = 5 * 1024 * 1024; // 5MB
    if ((blob as any).size > maxBytes) {
      return NextResponse.json({ error: "File too large (max 5MB)" }, { status: 400 });
    }

    const isVercel = process.env.VERCEL === "1";

    if (isVercel) {
      const url = await uploadToSupabaseStorage(blob, filename, mimeType);
      return NextResponse.json({ success: true, url });
    }

    // Local dev fallback: write into /public/uploads
    const arrayBuffer = await blob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadsDir, { recursive: true });
    const fullPath = path.join(uploadsDir, filename);
    await writeFile(fullPath, buffer);

    return NextResponse.json({ success: true, url: `/uploads/${filename}` });
  } catch (e: any) {
    console.error("UPLOAD ERROR:", e);
    return NextResponse.json({ error: e?.message || "Upload failed" }, { status: 500 });
  }
}
