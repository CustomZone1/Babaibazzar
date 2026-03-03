import { randomUUID, scryptSync, timingSafeEqual } from "crypto";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

type AccountRecord = {
  id: string;
  name: string;
  username: string;
  passwordHash: string;
  defaultDeliveryLine1?: string | null;
  defaultDeliveryLine2?: string | null;
  defaultLandmark?: string | null;
  defaultArea?: string | null;
};

function normalizeUsername(input: string) {
  return String(input || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "");
}

function isUsernameValid(username: string) {
  return /^[a-z0-9_]{4,24}$/.test(username);
}

function hashPassword(password: string) {
  const salt = randomUUID().replace(/-/g, "");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password: string, stored: string) {
  const [salt, hash] = String(stored || "").split(":");
  if (!salt || !hash) return false;
  const incoming = scryptSync(password, salt, 64);
  const known = Buffer.from(hash, "hex");
  if (incoming.length !== known.length) return false;
  return timingSafeEqual(incoming, known);
}

function isUniqueConstraintError(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}

export function buildUsernameSuggestions(firstName: string, lastName: string) {
  const f = normalizeUsername(firstName) || "user";
  const l = normalizeUsername(lastName);
  const l4 = l ? l.slice(0, 4) : "user";
  const l3 = l ? l.slice(0, 3) : "app";
  const base = `${f}${l4}`.slice(0, 16) || "user";
  return [
    `${base}`,
    `${f}21${l4}`,
    `${base}1`,
    `${base}21`,
    `${f}_${l3}`,
    `${f}${l ? l.slice(0, 2) : ""}${Math.floor(10 + Math.random() * 89)}`,
    `${f}_${l3}${Math.floor(100 + Math.random() * 900)}`,
  ].map((x) => normalizeUsername(x).slice(0, 24));
}

export async function getAvailableUsernames(candidates: string[]) {
  const out: string[] = [];
  for (const c of candidates) {
    const username = normalizeUsername(c);
    if (!isUsernameValid(username)) continue;
    const existing = await prisma.customerAccount.findUnique({
      where: { username },
      select: { id: true },
    });
    if (!existing) out.push(username);
  }
  return Array.from(new Set(out));
}

export async function suggestAvailableUsernames(firstName: string, lastName: string, limit = 5) {
  const baseCandidates = buildUsernameSuggestions(firstName, lastName);
  const available = await getAvailableUsernames(baseCandidates);
  if (available.length >= limit) return available.slice(0, limit);

  const f = normalizeUsername(firstName) || "user";
  const l = normalizeUsername(lastName);
  const l4 = l ? l.slice(0, 4) : "user";
  const extraCandidates: string[] = [];
  for (let i = 11; i <= 99 && available.length + extraCandidates.length < limit + 10; i++) {
    extraCandidates.push(`${f}${i}${l4}`);
    extraCandidates.push(`${f}_${l4}${i}`);
  }

  const extraAvailable = await getAvailableUsernames(extraCandidates);
  return Array.from(new Set([...available, ...extraAvailable])).slice(0, limit);
}

export async function registerLocalAccount(name: string, usernameInput: string, password: string) {
  const username = normalizeUsername(usernameInput);
  if (!name.trim()) throw new Error("Name is required.");
  if (!isUsernameValid(username)) throw new Error("Username must be 4-24 chars (a-z, 0-9, _).");
  if (String(password || "").length < 6) throw new Error("Password must be at least 6 characters.");

  const id = randomUUID().replace(/-/g, "");
  const passwordHash = hashPassword(password);

  try {
    await prisma.customerAccount.create({
      data: {
        id,
        name: name.trim(),
        username,
        passwordHash,
      },
    });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      throw new Error("Username already taken.");
    }
    throw error;
  }

  return { id, name: name.trim(), username };
}

export async function loginLocalAccount(usernameInput: string, password: string) {
  const username = normalizeUsername(usernameInput);
  if (!isUsernameValid(username)) throw new Error("Valid username is required.");
  if (!password) throw new Error("Password is required.");

  const acc = (await prisma.customerAccount.findUnique({
    where: { username },
    select: {
      id: true,
      name: true,
      username: true,
      passwordHash: true,
    },
  })) as AccountRecord | null;
  if (!acc) throw new Error("Account not found.");

  const ok = verifyPassword(password, acc.passwordHash);
  if (!ok) throw new Error("Invalid password.");

  return { id: acc.id, name: acc.name, username: acc.username };
}

export async function getLocalAccountProfile(usernameInput: string) {
  const username = normalizeUsername(usernameInput);
  if (!isUsernameValid(username)) return null;
  const acc = (await prisma.customerAccount.findUnique({
    where: { username },
    select: {
      id: true,
      name: true,
      username: true,
      defaultDeliveryLine1: true,
      defaultDeliveryLine2: true,
      defaultLandmark: true,
      defaultArea: true,
    },
  })) as AccountRecord | null;
  if (!acc) return null;
  return {
    id: acc.id,
    name: acc.name,
    username: acc.username,
    defaultAddress: {
      line1: String(acc.defaultDeliveryLine1 || "").trim(),
      line2: String(acc.defaultDeliveryLine2 || "").trim(),
      landmark: String(acc.defaultLandmark || "").trim(),
      area: String(acc.defaultArea || "").trim(),
    },
  };
}

export async function saveLocalAccountDefaultAddress(
  usernameInput: string,
  address: { line1?: string | null; line2?: string | null; landmark?: string | null; area?: string | null }
) {
  const username = normalizeUsername(usernameInput);
  if (!isUsernameValid(username)) return;

  const line1 = String(address?.line1 || "").trim();
  if (!line1) return;

  await prisma.customerAccount.updateMany({
    where: { username },
    data: {
      defaultDeliveryLine1: line1,
      defaultDeliveryLine2: String(address?.line2 || "").trim() || null,
      defaultLandmark: String(address?.landmark || "").trim() || null,
      defaultArea: String(address?.area || "").trim() || null,
    },
  });
}
