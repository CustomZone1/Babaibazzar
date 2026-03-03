import { createHmac, timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";

type OtpRecord = {
  code: string;
  expiresAt: number;
  attemptsLeft: number;
  name: string;
};

type SessionRecord = {
  username: string;
  name: string;
  expiresAt: number;
};

const OTP_TTL_MS = 5 * 60 * 1000;
const SESSION_TTL_SEC = 60 * 60 * 24 * 30;
const SESSION_TTL_MS = SESSION_TTL_SEC * 1000;
const OTP_MAX_ATTEMPTS = 5;
const COOKIE_NAME = "bb_customer_session";

const otpStore = new Map<string, OtpRecord>();
const SESSION_SECRET = process.env.BB_SESSION_SECRET || "bb-dev-session-secret-change-me";

function now() {
  return Date.now();
}

function cleanup() {
  const t = now();
  for (const [k, v] of otpStore.entries()) {
    if (v.expiresAt <= t || v.attemptsLeft <= 0) otpStore.delete(k);
  }
}

export function normalizePhone(input: string) {
  return String(input || "").replace(/[^\d]/g, "").trim();
}

export function isPhoneValid(phone: string) {
  return /^\d{10,15}$/.test(phone);
}

export function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export function createOtp(phone: string, name: string) {
  cleanup();
  const code = generateOtp();
  otpStore.set(phone, {
    code,
    expiresAt: now() + OTP_TTL_MS,
    attemptsLeft: OTP_MAX_ATTEMPTS,
    name: name.trim(),
  });
  return code;
}

export function verifyOtp(phone: string, code: string) {
  cleanup();
  const rec = otpStore.get(phone);
  if (!rec) return { ok: false as const, error: "OTP expired. Please request again." };
  if (rec.expiresAt <= now()) {
    otpStore.delete(phone);
    return { ok: false as const, error: "OTP expired. Please request again." };
  }
  if (rec.code !== code) {
    rec.attemptsLeft -= 1;
    otpStore.set(phone, rec);
    return { ok: false as const, error: "Invalid OTP." };
  }

  otpStore.delete(phone);
  return { ok: true as const, name: rec.name };
}

function toBase64Url(input: string) {
  return Buffer.from(input, "utf8").toString("base64url");
}

function fromBase64Url(input: string) {
  return Buffer.from(input, "base64url").toString("utf8");
}

function sign(input: string) {
  return createHmac("sha256", SESSION_SECRET).update(input).digest("hex");
}

export function createSession(username: string, name: string) {
  cleanup();
  const session: SessionRecord = {
    username,
    name: name.trim(),
    expiresAt: now() + SESSION_TTL_MS,
  };
  const payload = toBase64Url(JSON.stringify(session));
  const sig = sign(payload);
  return `${payload}.${sig}`;
}

export function getSessionFromRequest(req: NextRequest) {
  cleanup();
  const token = req.cookies.get(COOKIE_NAME)?.value || "";
  if (!token) return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;

  const expectedSig = sign(payload);
  const incoming = Buffer.from(sig, "utf8");
  const expected = Buffer.from(expectedSig, "utf8");
  if (incoming.length !== expected.length || !timingSafeEqual(incoming, expected)) {
    return null;
  }

  let parsed: SessionRecord | null = null;
  try {
    parsed = JSON.parse(fromBase64Url(payload)) as SessionRecord;
  } catch {
    parsed = null;
  }

  if (!parsed || !parsed.username || parsed.expiresAt <= now()) {
    return null;
  }
  return { token, ...parsed };
}

export function setSessionCookie(res: NextResponse, token: string) {
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_SEC,
  });
}

export function clearSessionCookie(res: NextResponse) {
  res.cookies.set(COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export function destroySession(token: string) {
  void token;
}
