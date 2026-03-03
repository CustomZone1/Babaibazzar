import { NextRequest, NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import crypto from "crypto";

export const runtime = "nodejs";

function safeExt(filename?: string) {
  if (!filename) return "jpg";
  const parts = filename.split(".");
  const ext = parts.length > 1 ? parts[parts.length - 1].toLowerCase() : "jpg";
  const ok = ["jpg", "jpeg", "png", "webp"].includes(ext);
  return ok ? ext : "jpg";
}

export async function POST(req: NextRequest) {
  try {
    // Admin auth cookie
    const authed = req.cookies.get("bb_admin")?.value === "1";
    if (!authed) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const form = await req.formData();
    const file = form.get("file");

    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "File missing" }, { status: 400 });
    }

    // In Next App Router, file is a Blob with optional "name"
    const blob = file as Blob;
    const arrayBuffer = await blob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Basic size guard (optional but good)
    const maxBytes = 5 * 1024 * 1024; // 5MB
    if (buffer.length > maxBytes) {
      return NextResponse.json(
        { error: "File too large (max 5MB)" },
        { status: 400 }
      );
    }

    const originalName = (file as any)?.name as string | undefined;
    const ext = safeExt(originalName);

    const filename = `${crypto.randomUUID()}.${ext}`;

    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadsDir, { recursive: true });

    const fullPath = path.join(uploadsDir, filename);
    await writeFile(fullPath, buffer);

    const url = `/uploads/${filename}`;
    return NextResponse.json({ success: true, url });
  } catch (e: any) {
    console.error("UPLOAD ERROR:", e);
    return NextResponse.json(
      { error: e?.message || "Upload failed" },
      { status: 500 }
    );
  }
}
