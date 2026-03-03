module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/crypto [external] (crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("crypto", () => require("crypto"));

module.exports = mod;
}),
"[project]/src/lib/auth-server.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "clearSessionCookie",
    ()=>clearSessionCookie,
    "createOtp",
    ()=>createOtp,
    "createSession",
    ()=>createSession,
    "destroySession",
    ()=>destroySession,
    "generateOtp",
    ()=>generateOtp,
    "getSessionFromRequest",
    ()=>getSessionFromRequest,
    "isPhoneValid",
    ()=>isPhoneValid,
    "normalizePhone",
    ()=>normalizePhone,
    "setSessionCookie",
    ()=>setSessionCookie,
    "verifyOtp",
    ()=>verifyOtp
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/crypto [external] (crypto, cjs)");
;
const OTP_TTL_MS = 5 * 60 * 1000;
const SESSION_TTL_SEC = 60 * 60 * 24 * 30;
const SESSION_TTL_MS = SESSION_TTL_SEC * 1000;
const OTP_MAX_ATTEMPTS = 5;
const COOKIE_NAME = "bb_customer_session";
const otpStore = new Map();
const SESSION_SECRET = process.env.BB_SESSION_SECRET || "bb-dev-session-secret-change-me";
function now() {
    return Date.now();
}
function cleanup() {
    const t = now();
    for (const [k, v] of otpStore.entries()){
        if (v.expiresAt <= t || v.attemptsLeft <= 0) otpStore.delete(k);
    }
}
function normalizePhone(input) {
    return String(input || "").replace(/[^\d]/g, "").trim();
}
function isPhoneValid(phone) {
    return /^\d{10,15}$/.test(phone);
}
function generateOtp() {
    return String(Math.floor(100000 + Math.random() * 900000));
}
function createOtp(phone, name) {
    cleanup();
    const code = generateOtp();
    otpStore.set(phone, {
        code,
        expiresAt: now() + OTP_TTL_MS,
        attemptsLeft: OTP_MAX_ATTEMPTS,
        name: name.trim()
    });
    return code;
}
function verifyOtp(phone, code) {
    cleanup();
    const rec = otpStore.get(phone);
    if (!rec) return {
        ok: false,
        error: "OTP expired. Please request again."
    };
    if (rec.expiresAt <= now()) {
        otpStore.delete(phone);
        return {
            ok: false,
            error: "OTP expired. Please request again."
        };
    }
    if (rec.code !== code) {
        rec.attemptsLeft -= 1;
        otpStore.set(phone, rec);
        return {
            ok: false,
            error: "Invalid OTP."
        };
    }
    otpStore.delete(phone);
    return {
        ok: true,
        name: rec.name
    };
}
function toBase64Url(input) {
    return Buffer.from(input, "utf8").toString("base64url");
}
function fromBase64Url(input) {
    return Buffer.from(input, "base64url").toString("utf8");
}
function sign(input) {
    return (0, __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["createHmac"])("sha256", SESSION_SECRET).update(input).digest("hex");
}
function createSession(username, name) {
    cleanup();
    const session = {
        username,
        name: name.trim(),
        expiresAt: now() + SESSION_TTL_MS
    };
    const payload = toBase64Url(JSON.stringify(session));
    const sig = sign(payload);
    return `${payload}.${sig}`;
}
function getSessionFromRequest(req) {
    cleanup();
    const token = req.cookies.get(COOKIE_NAME)?.value || "";
    if (!token) return null;
    const [payload, sig] = token.split(".");
    if (!payload || !sig) return null;
    const expectedSig = sign(payload);
    const incoming = Buffer.from(sig, "utf8");
    const expected = Buffer.from(expectedSig, "utf8");
    if (incoming.length !== expected.length || !(0, __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["timingSafeEqual"])(incoming, expected)) {
        return null;
    }
    let parsed = null;
    try {
        parsed = JSON.parse(fromBase64Url(payload));
    } catch  {
        parsed = null;
    }
    if (!parsed || !parsed.username || parsed.expiresAt <= now()) {
        return null;
    }
    return {
        token,
        ...parsed
    };
}
function setSessionCookie(res, token) {
    res.cookies.set(COOKIE_NAME, token, {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: SESSION_TTL_SEC
    });
}
function clearSessionCookie(res) {
    res.cookies.set(COOKIE_NAME, "", {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: 0
    });
}
function destroySession(token) {
    void token;
}
}),
"[project]/src/lib/prisma.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "prisma",
    ()=>prisma
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f40$prisma$2f$client$29$__ = __turbopack_context__.i("[externals]/@prisma/client [external] (@prisma/client, cjs, [project]/node_modules/@prisma/client)");
;
const globalForPrisma = globalThis;
const prisma = globalForPrisma.prisma ?? new __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f40$prisma$2f$client$29$__["PrismaClient"]({
    log: [
        "error",
        "warn"
    ]
});
if ("TURBOPACK compile-time truthy", 1) globalForPrisma.prisma = prisma;
}),
"[project]/src/lib/local-auth-db.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "buildUsernameSuggestions",
    ()=>buildUsernameSuggestions,
    "getAvailableUsernames",
    ()=>getAvailableUsernames,
    "getLocalAccountProfile",
    ()=>getLocalAccountProfile,
    "loginLocalAccount",
    ()=>loginLocalAccount,
    "registerLocalAccount",
    ()=>registerLocalAccount,
    "saveLocalAccountDefaultAddress",
    ()=>saveLocalAccountDefaultAddress,
    "suggestAvailableUsernames",
    ()=>suggestAvailableUsernames
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/crypto [external] (crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/prisma.ts [app-route] (ecmascript)");
;
;
function normalizeUsername(input) {
    return String(input || "").trim().toLowerCase().replace(/[^a-z0-9_]/g, "");
}
function isUsernameValid(username) {
    return /^[a-z0-9_]{4,24}$/.test(username);
}
function hashPassword(password) {
    const salt = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["randomUUID"])().replace(/-/g, "");
    const hash = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["scryptSync"])(password, salt, 64).toString("hex");
    return `${salt}:${hash}`;
}
function verifyPassword(password, stored) {
    const [salt, hash] = String(stored || "").split(":");
    if (!salt || !hash) return false;
    const incoming = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["scryptSync"])(password, salt, 64);
    const known = Buffer.from(hash, "hex");
    if (incoming.length !== known.length) return false;
    return (0, __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["timingSafeEqual"])(incoming, known);
}
async function ensureTable() {
    await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS customer_accounts (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);
    const cols = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].$queryRawUnsafe(`PRAGMA table_info(customer_accounts)`);
    const hasPhone = cols.some((c)=>String(c.name) === "phone");
    const hasUsername = cols.some((c)=>String(c.name) === "username");
    // Legacy table used phone; migrate to username-based schema once.
    if (hasPhone || !hasUsername) {
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS customer_accounts_v2 (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        username TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
        const usernameExpr = hasUsername ? `COALESCE(NULLIF(username, ''), lower(replace(replace(replace(phone, '+', ''), ' ', ''), '-', '')))` : `lower(replace(replace(replace(phone, '+', ''), ' ', ''), '-', ''))`;
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].$executeRawUnsafe(`
      INSERT OR IGNORE INTO customer_accounts_v2 (id, name, username, password_hash, created_at)
      SELECT id, name, ${usernameExpr}, password_hash, COALESCE(created_at, CURRENT_TIMESTAMP)
      FROM customer_accounts
    `);
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].$executeRawUnsafe(`DROP TABLE customer_accounts`);
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].$executeRawUnsafe(`ALTER TABLE customer_accounts_v2 RENAME TO customer_accounts`);
    }
    const freshCols = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].$queryRawUnsafe(`PRAGMA table_info(customer_accounts)`);
    const colSet = new Set(freshCols.map((c)=>String(c.name)));
    if (!colSet.has("default_delivery_line1")) {
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].$executeRawUnsafe(`ALTER TABLE customer_accounts ADD COLUMN default_delivery_line1 TEXT`);
    }
    if (!colSet.has("default_delivery_line2")) {
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].$executeRawUnsafe(`ALTER TABLE customer_accounts ADD COLUMN default_delivery_line2 TEXT`);
    }
    if (!colSet.has("default_landmark")) {
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].$executeRawUnsafe(`ALTER TABLE customer_accounts ADD COLUMN default_landmark TEXT`);
    }
    if (!colSet.has("default_area")) {
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].$executeRawUnsafe(`ALTER TABLE customer_accounts ADD COLUMN default_area TEXT`);
    }
    await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS idx_customer_accounts_username ON customer_accounts (username)`);
}
function buildUsernameSuggestions(firstName, lastName) {
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
        `${f}_${l3}${Math.floor(100 + Math.random() * 900)}`
    ].map((x)=>normalizeUsername(x).slice(0, 24));
}
async function getAvailableUsernames(candidates) {
    await ensureTable();
    const out = [];
    for (const c of candidates){
        const username = normalizeUsername(c);
        if (!isUsernameValid(username)) continue;
        const rows = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].$queryRawUnsafe(`SELECT id FROM customer_accounts WHERE username = ? LIMIT 1`, username);
        if (rows.length === 0) out.push(username);
    }
    return Array.from(new Set(out));
}
async function suggestAvailableUsernames(firstName, lastName, limit = 5) {
    const baseCandidates = buildUsernameSuggestions(firstName, lastName);
    const available = await getAvailableUsernames(baseCandidates);
    if (available.length >= limit) return available.slice(0, limit);
    const f = normalizeUsername(firstName) || "user";
    const l = normalizeUsername(lastName);
    const l4 = l ? l.slice(0, 4) : "user";
    const extraCandidates = [];
    for(let i = 11; i <= 99 && available.length + extraCandidates.length < limit + 10; i++){
        extraCandidates.push(`${f}${i}${l4}`);
        extraCandidates.push(`${f}_${l4}${i}`);
    }
    const extraAvailable = await getAvailableUsernames(extraCandidates);
    return Array.from(new Set([
        ...available,
        ...extraAvailable
    ])).slice(0, limit);
}
async function registerLocalAccount(name, usernameInput, password) {
    const username = normalizeUsername(usernameInput);
    if (!name.trim()) throw new Error("Name is required.");
    if (!isUsernameValid(username)) throw new Error("Username must be 4-24 chars (a-z, 0-9, _).");
    if (String(password || "").length < 6) throw new Error("Password must be at least 6 characters.");
    await ensureTable();
    const existing = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].$queryRawUnsafe(`SELECT id FROM customer_accounts WHERE username = ? LIMIT 1`, username);
    if (existing.length > 0) throw new Error("Username already taken.");
    const id = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["randomUUID"])().replace(/-/g, "");
    const passwordHash = hashPassword(password);
    await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].$executeRawUnsafe(`INSERT INTO customer_accounts (id, name, username, password_hash) VALUES (?, ?, ?, ?)`, id, name.trim(), username, passwordHash);
    return {
        id,
        name: name.trim(),
        username
    };
}
async function loginLocalAccount(usernameInput, password) {
    const username = normalizeUsername(usernameInput);
    if (!isUsernameValid(username)) throw new Error("Valid username is required.");
    if (!password) throw new Error("Password is required.");
    await ensureTable();
    const rows = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].$queryRawUnsafe(`SELECT id, name, username, password_hash FROM customer_accounts WHERE username = ? LIMIT 1`, username);
    const acc = rows[0];
    if (!acc) throw new Error("Account not found.");
    const ok = verifyPassword(password, acc.password_hash);
    if (!ok) throw new Error("Invalid password.");
    return {
        id: acc.id,
        name: acc.name,
        username: acc.username
    };
}
async function getLocalAccountProfile(usernameInput) {
    const username = normalizeUsername(usernameInput);
    if (!isUsernameValid(username)) return null;
    await ensureTable();
    const rows = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].$queryRawUnsafe(`SELECT id, name, username, default_delivery_line1, default_delivery_line2, default_landmark, default_area
     FROM customer_accounts WHERE username = ? LIMIT 1`, username);
    const acc = rows[0];
    if (!acc) return null;
    return {
        id: acc.id,
        name: acc.name,
        username: acc.username,
        defaultAddress: {
            line1: String(acc.default_delivery_line1 || "").trim(),
            line2: String(acc.default_delivery_line2 || "").trim(),
            landmark: String(acc.default_landmark || "").trim(),
            area: String(acc.default_area || "").trim()
        }
    };
}
async function saveLocalAccountDefaultAddress(usernameInput, address) {
    const username = normalizeUsername(usernameInput);
    if (!isUsernameValid(username)) return;
    await ensureTable();
    const line1 = String(address?.line1 || "").trim();
    if (!line1) return;
    await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].$executeRawUnsafe(`UPDATE customer_accounts
     SET default_delivery_line1 = ?,
         default_delivery_line2 = ?,
         default_landmark = ?,
         default_area = ?
     WHERE username = ?`, line1, String(address?.line2 || "").trim() || null, String(address?.landmark || "").trim() || null, String(address?.area || "").trim() || null, username);
}
}),
"[project]/src/lib/wallet-db.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "chargeWalletForOrder",
    ()=>chargeWalletForOrder,
    "getWalletSummary",
    ()=>getWalletSummary,
    "topUpWallet",
    ()=>topUpWallet
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/crypto [external] (crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/prisma.ts [app-route] (ecmascript)");
;
;
function normalizeUsername(input) {
    return String(input || "").trim().toLowerCase().replace(/[^a-z0-9_]/g, "");
}
async function ensureWalletTables() {
    await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS wallet_accounts (
      username TEXT PRIMARY KEY,
      balance_paise INTEGER NOT NULL DEFAULT 0,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);
    await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS wallet_transactions (
      id TEXT PRIMARY KEY,
      username TEXT NOT NULL,
      type TEXT NOT NULL,
      amount_paise INTEGER NOT NULL,
      balance_after_paise INTEGER NOT NULL,
      note TEXT,
      ref_order_id TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);
    await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS idx_wallet_txn_username_created ON wallet_transactions (username, created_at DESC)`);
}
async function getWalletSummary(usernameInput) {
    const username = normalizeUsername(usernameInput);
    if (!username) return null;
    await ensureWalletTables();
    await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].$executeRawUnsafe(`INSERT OR IGNORE INTO wallet_accounts (username, balance_paise) VALUES (?, 0)`, username);
    const rows = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].$queryRawUnsafe(`SELECT username, balance_paise FROM wallet_accounts WHERE username = ? LIMIT 1`, username);
    const txns = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].$queryRawUnsafe(`SELECT id, username, type, amount_paise, balance_after_paise, note, ref_order_id, created_at
     FROM wallet_transactions
     WHERE username = ?
     ORDER BY created_at DESC
     LIMIT 50`, username);
    return {
        username,
        balancePaise: Number(rows[0]?.balance_paise || 0),
        transactions: txns.map((t)=>({
                id: t.id,
                type: t.type,
                amountPaise: Number(t.amount_paise || 0),
                balanceAfterPaise: Number(t.balance_after_paise || 0),
                note: t.note || "",
                refOrderId: t.ref_order_id || "",
                createdAt: t.created_at
            }))
    };
}
async function topUpWallet(usernameInput, amountPaise, note) {
    const username = normalizeUsername(usernameInput);
    if (!username) throw new Error("Invalid username.");
    if (!Number.isFinite(amountPaise) || amountPaise <= 0) throw new Error("Invalid top-up amount.");
    await ensureWalletTables();
    const result = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].$transaction(async (tx)=>{
        await tx.$executeRawUnsafe(`INSERT OR IGNORE INTO wallet_accounts (username, balance_paise) VALUES (?, 0)`, username);
        const rows = await tx.$queryRawUnsafe(`SELECT balance_paise FROM wallet_accounts WHERE username = ? LIMIT 1`, username);
        const current = Number(rows[0]?.balance_paise || 0);
        const next = current + Math.round(amountPaise);
        await tx.$executeRawUnsafe(`UPDATE wallet_accounts SET balance_paise = ?, updated_at = CURRENT_TIMESTAMP WHERE username = ?`, next, username);
        const txnId = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["randomUUID"])().replace(/-/g, "");
        await tx.$executeRawUnsafe(`INSERT INTO wallet_transactions (id, username, type, amount_paise, balance_after_paise, note)
       VALUES (?, ?, 'TOPUP', ?, ?, ?)`, txnId, username, Math.round(amountPaise), next, note || null);
        return {
            balancePaise: next,
            transactionId: txnId
        };
    });
    return result;
}
async function chargeWalletForOrder(args) {
    const username = normalizeUsername(args.username);
    const orderId = String(args.orderId || "").trim();
    const amountPaise = Math.round(Number(args.amountPaise || 0));
    if (!username) throw new Error("Invalid username.");
    if (!orderId) throw new Error("Invalid order id.");
    if (!Number.isFinite(amountPaise) || amountPaise <= 0) throw new Error("Invalid wallet charge amount.");
    await ensureWalletTables();
    const result = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].$transaction(async (tx)=>{
        await tx.$executeRawUnsafe(`INSERT OR IGNORE INTO wallet_accounts (username, balance_paise) VALUES (?, 0)`, username);
        const dup = await tx.$queryRawUnsafe(`SELECT id FROM wallet_transactions
       WHERE username = ? AND type = 'ORDER_DEBIT' AND ref_order_id = ?
       LIMIT 1`, username, orderId);
        if (dup.length > 0) {
            const rows = await tx.$queryRawUnsafe(`SELECT balance_paise FROM wallet_accounts WHERE username = ? LIMIT 1`, username);
            return {
                balancePaise: Number(rows[0]?.balance_paise || 0),
                charged: false
            };
        }
        const rows = await tx.$queryRawUnsafe(`SELECT balance_paise FROM wallet_accounts WHERE username = ? LIMIT 1`, username);
        const current = Number(rows[0]?.balance_paise || 0);
        if (current < amountPaise) throw new Error("Insufficient wallet balance.");
        const next = current - amountPaise;
        await tx.$executeRawUnsafe(`UPDATE wallet_accounts SET balance_paise = ?, updated_at = CURRENT_TIMESTAMP WHERE username = ?`, next, username);
        const txnId = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["randomUUID"])().replace(/-/g, "");
        await tx.$executeRawUnsafe(`INSERT INTO wallet_transactions (id, username, type, amount_paise, balance_after_paise, note, ref_order_id)
       VALUES (?, ?, 'ORDER_DEBIT', ?, ?, ?, ?)`, txnId, username, amountPaise, next, args.note || null, orderId);
        return {
            balancePaise: next,
            charged: true
        };
    });
    return result;
}
}),
"[project]/src/app/api/auth/me/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET,
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auth$2d$server$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/auth-server.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$local$2d$auth$2d$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/local-auth-db.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$wallet$2d$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/wallet-db.ts [app-route] (ecmascript)");
;
;
;
;
async function GET(req) {
    const session = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auth$2d$server$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getSessionFromRequest"])(req);
    if (!session) return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
        authenticated: false
    }, {
        status: 200
    });
    const profile = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$local$2d$auth$2d$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getLocalAccountProfile"])(session.username);
    const wallet = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$wallet$2d$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getWalletSummary"])(session.username);
    const defaultAddress = profile?.defaultAddress ?? {
        line1: "",
        line2: "",
        landmark: "",
        area: ""
    };
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
        authenticated: true,
        user: {
            name: profile?.name || session.name,
            username: session.username,
            defaultAddress,
            walletBalancePaise: wallet?.balancePaise ?? 0,
            walletTransactions: wallet?.transactions ?? []
        }
    }, {
        status: 200
    });
}
async function POST(req) {
    try {
        const session = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auth$2d$server$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getSessionFromRequest"])(req);
        if (!session) return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Unauthorized"
        }, {
            status: 401
        });
        const body = await req.json().catch(()=>({}));
        const action = String(body?.action || "").trim().toLowerCase();
        if (action === "topup") {
            const amountRupees = Number(body?.amountRupees || 0);
            const amountPaise = Math.round(amountRupees * 100);
            if (!Number.isFinite(amountRupees) || amountRupees <= 0) {
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    error: "Invalid amount."
                }, {
                    status: 400
                });
            }
            const maxTopupRupees = 10000;
            if (amountRupees > maxTopupRupees) {
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    error: `Top-up limit is Rs ${maxTopupRupees}.`
                }, {
                    status: 400
                });
            }
            const topped = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$wallet$2d$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["topUpWallet"])(session.username, amountPaise, "Manual top-up");
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                ok: true,
                walletBalancePaise: topped.balancePaise
            }, {
                status: 200
            });
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Invalid action."
        }, {
            status: 400
        });
    } catch (e) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: e?.message || "Server error"
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__3eb01dfc._.js.map