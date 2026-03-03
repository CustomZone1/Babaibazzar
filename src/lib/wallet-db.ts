import { randomUUID } from "crypto";
import {
  Prisma,
  WalletTopupRequestStatus,
  WalletTransactionType,
  WalletUpiCreditStatus,
} from "@prisma/client";
import { prisma } from "@/lib/prisma";

type WalletDbClient = Prisma.TransactionClient | typeof prisma;

function normalizeUsername(input: string) {
  return String(input || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "");
}

function normalizeTxnId(input: string) {
  return String(input || "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "");
}

function isUniqueConstraintError(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}

async function ensureWalletAccount(username: string, db: WalletDbClient = prisma) {
  await db.walletAccount.upsert({
    where: { username },
    create: { username, balancePaise: 0 },
    update: {},
  });
}

export async function getWalletSummary(usernameInput: string) {
  const username = normalizeUsername(usernameInput);
  if (!username) return null;

  await ensureWalletAccount(username);

  const wallet = await prisma.walletAccount.findUnique({
    where: { username },
    select: {
      balancePaise: true,
      transactions: {
        orderBy: { createdAt: "desc" },
        take: 50,
        select: {
          id: true,
          type: true,
          amountPaise: true,
          balanceAfterPaise: true,
          note: true,
          refOrderId: true,
          createdAt: true,
        },
      },
    },
  });

  return {
    username,
    balancePaise: Number(wallet?.balancePaise || 0),
    transactions: (wallet?.transactions || []).map((t) => ({
      id: t.id,
      type: t.type,
      amountPaise: Number(t.amountPaise || 0),
      balanceAfterPaise: Number(t.balanceAfterPaise || 0),
      note: t.note || "",
      refOrderId: t.refOrderId || "",
      createdAt: t.createdAt.toISOString(),
    })),
  };
}

export async function createWalletTopupRequest(args: {
  username: string;
  amountPaise: number;
  upiRef: string;
}) {
  const username = normalizeUsername(args.username);
  const amountPaise = Math.round(Number(args.amountPaise || 0));
  const upiRef = String(args.upiRef || "").trim();
  if (!username) throw new Error("Invalid username.");
  if (!Number.isFinite(amountPaise) || amountPaise <= 0) throw new Error("Invalid top-up amount.");
  if (upiRef.length < 6 || upiRef.length > 64) throw new Error("Valid UPI reference is required.");

  await ensureWalletAccount(username);

  const pendingCount = await prisma.walletTopupRequest.count({
    where: {
      username,
      status: WalletTopupRequestStatus.PENDING,
    },
  });
  if (pendingCount >= 5) {
    throw new Error("Too many pending requests. Please wait for confirmation.");
  }

  const id = randomUUID().replace(/-/g, "");
  await prisma.walletTopupRequest.create({
    data: {
      id,
      username,
      amountPaise,
      upiRef,
      status: WalletTopupRequestStatus.PENDING,
    },
  });

  return { id };
}

export async function getWalletTopupRequests(usernameInput: string, limit = 10) {
  const username = normalizeUsername(usernameInput);
  if (!username) return [];

  await ensureWalletAccount(username);

  const rows = await prisma.walletTopupRequest.findMany({
    where: { username },
    orderBy: { createdAt: "desc" },
    take: Math.max(1, Math.min(limit, 30)),
    select: {
      id: true,
      amountPaise: true,
      upiRef: true,
      status: true,
      createdAt: true,
    },
  });

  return rows.map((r) => ({
    id: r.id,
    amountPaise: Number(r.amountPaise || 0),
    upiRef: r.upiRef,
    status: r.status,
    createdAt: r.createdAt.toISOString(),
  }));
}

export async function createAdminUpiCredit(args: {
  transactionId: string;
  amountPaise: number;
  createdByAdmin?: string;
}) {
  const transactionId = normalizeTxnId(args.transactionId);
  const amountPaise = Math.round(Number(args.amountPaise || 0));
  const createdByAdmin = String(args.createdByAdmin || "").trim() || null;

  if (!transactionId || transactionId.length < 6 || transactionId.length > 80) {
    throw new Error("Valid transaction ID is required.");
  }
  if (!Number.isFinite(amountPaise) || amountPaise <= 0) {
    throw new Error("Valid amount is required.");
  }

  const id = randomUUID().replace(/-/g, "");
  try {
    await prisma.walletUpiCredit.create({
      data: {
        id,
        transactionId,
        amountPaise,
        status: WalletUpiCreditStatus.OPEN,
        createdByAdmin,
      },
    });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      throw new Error("Transaction ID already exists.");
    }
    throw error;
  }

  return { id, transactionId, amountPaise };
}

export async function listAdminUpiCredits(limit = 100) {
  const rows = await prisma.walletUpiCredit.findMany({
    orderBy: { createdAt: "desc" },
    take: Math.max(1, Math.min(limit, 500)),
    select: {
      id: true,
      transactionId: true,
      amountPaise: true,
      status: true,
      createdByAdmin: true,
      claimedByUsername: true,
      claimedAt: true,
      createdAt: true,
    },
  });

  return rows.map((r) => ({
    id: r.id,
    transactionId: r.transactionId,
    amountPaise: Number(r.amountPaise || 0),
    status: r.status,
    createdByAdmin: r.createdByAdmin || "",
    claimedByUsername: r.claimedByUsername || "",
    claimedAt: r.claimedAt ? r.claimedAt.toISOString() : "",
    createdAt: r.createdAt.toISOString(),
  }));
}

export async function claimUpiCreditByTransactionId(usernameInput: string, transactionIdInput: string) {
  const username = normalizeUsername(usernameInput);
  const transactionId = normalizeTxnId(transactionIdInput);
  if (!username) throw new Error("Invalid username.");
  if (!transactionId) throw new Error("Transaction ID is required.");

  const result = await prisma.$transaction(
    async (tx) => {
      await ensureWalletAccount(username, tx);

      const credit = await tx.walletUpiCredit.findUnique({
        where: { transactionId },
        select: { id: true, amountPaise: true, status: true },
      });

      if (!credit) throw new Error("Transaction ID not found.");
      if (credit.status !== WalletUpiCreditStatus.OPEN) {
        throw new Error("This transaction is already claimed.");
      }

      const claim = await tx.walletUpiCredit.updateMany({
        where: { id: credit.id, status: WalletUpiCreditStatus.OPEN },
        data: {
          status: WalletUpiCreditStatus.CLAIMED,
          claimedByUsername: username,
          claimedAt: new Date(),
        },
      });
      if (claim.count === 0) {
        throw new Error("This transaction is already claimed.");
      }

      const account = await tx.walletAccount.findUnique({
        where: { username },
        select: { balancePaise: true },
      });
      const current = Number(account?.balancePaise || 0);
      const amountPaise = Number(credit.amountPaise || 0);
      const next = current + amountPaise;

      await tx.walletAccount.update({
        where: { username },
        data: { balancePaise: next },
      });

      const txnId = randomUUID().replace(/-/g, "");
      await tx.walletTransaction.create({
        data: {
          id: txnId,
          username,
          type: WalletTransactionType.UPI_CREDIT,
          amountPaise,
          balanceAfterPaise: next,
          note: `UPI Txn ${transactionId}`,
        },
      });

      return { amountPaise, balancePaise: next };
    },
    { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
  );

  return result;
}

export async function topUpWallet(usernameInput: string, amountPaise: number, note?: string) {
  const username = normalizeUsername(usernameInput);
  if (!username) throw new Error("Invalid username.");
  if (!Number.isFinite(amountPaise) || amountPaise <= 0) throw new Error("Invalid top-up amount.");

  const result = await prisma.$transaction(
    async (tx) => {
      await ensureWalletAccount(username, tx);

      const account = await tx.walletAccount.findUnique({
        where: { username },
        select: { balancePaise: true },
      });
      const current = Number(account?.balancePaise || 0);
      const next = current + Math.round(amountPaise);

      await tx.walletAccount.update({
        where: { username },
        data: { balancePaise: next },
      });

      const txnId = randomUUID().replace(/-/g, "");
      await tx.walletTransaction.create({
        data: {
          id: txnId,
          username,
          type: WalletTransactionType.TOPUP,
          amountPaise: Math.round(amountPaise),
          balanceAfterPaise: next,
          note: note || null,
        },
      });

      return { balancePaise: next, transactionId: txnId };
    },
    { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
  );

  return result;
}

export async function chargeWalletForOrder(args: {
  username: string;
  orderId: string;
  amountPaise: number;
  note?: string;
}) {
  const username = normalizeUsername(args.username);
  const orderId = String(args.orderId || "").trim();
  const amountPaise = Math.round(Number(args.amountPaise || 0));
  if (!username) throw new Error("Invalid username.");
  if (!orderId) throw new Error("Invalid order id.");
  if (!Number.isFinite(amountPaise) || amountPaise <= 0) throw new Error("Invalid wallet charge amount.");

  try {
    const result = await prisma.$transaction(
      async (tx) => {
        await ensureWalletAccount(username, tx);

        const existing = await tx.walletTransaction.findFirst({
          where: {
            username,
            type: WalletTransactionType.ORDER_DEBIT,
            refOrderId: orderId,
          },
          select: { id: true },
        });

        if (existing) {
          const account = await tx.walletAccount.findUnique({
            where: { username },
            select: { balancePaise: true },
          });
          return {
            balancePaise: Number(account?.balancePaise || 0),
            charged: false,
          };
        }

        const account = await tx.walletAccount.findUnique({
          where: { username },
          select: { balancePaise: true },
        });
        const current = Number(account?.balancePaise || 0);
        if (current < amountPaise) throw new Error("Insufficient wallet balance.");
        const next = current - amountPaise;

        await tx.walletAccount.update({
          where: { username },
          data: { balancePaise: next },
        });

        const txnId = randomUUID().replace(/-/g, "");
        await tx.walletTransaction.create({
          data: {
            id: txnId,
            username,
            type: WalletTransactionType.ORDER_DEBIT,
            amountPaise,
            balanceAfterPaise: next,
            note: args.note || null,
            refOrderId: orderId,
          },
        });

        return { balancePaise: next, charged: true };
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
    );

    return result;
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      const account = await prisma.walletAccount.findUnique({
        where: { username },
        select: { balancePaise: true },
      });
      return {
        balancePaise: Number(account?.balancePaise || 0),
        charged: false,
      };
    }
    throw error;
  }
}
