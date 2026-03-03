import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth-server";
import { getLocalAccountProfile } from "@/lib/local-auth-db";
import { claimUpiCreditByTransactionId, getWalletSummary } from "@/lib/wallet-db";

export async function GET(req: NextRequest) {
  const session = getSessionFromRequest(req);
  if (!session) return NextResponse.json({ authenticated: false }, { status: 200 });
  const profile = await getLocalAccountProfile(session.username);
  const includeWallet = req.nextUrl.searchParams.get("includeWallet") === "1";
  const wallet = includeWallet ? await getWalletSummary(session.username) : null;
  const defaultAddress = profile?.defaultAddress ?? {
    line1: "",
    line2: "",
    landmark: "",
    area: "",
  };

  return NextResponse.json(
    {
      authenticated: true,
      user: {
        name: profile?.name || session.name,
        username: session.username,
        defaultAddress,
        walletBalancePaise: wallet?.balancePaise ?? 0,
        walletTransactions: wallet?.transactions ?? [],
      },
    },
    { status: 200 }
  );
}

export async function POST(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const action = String(body?.action || "").trim().toLowerCase();

    if (action === "topup") {
      return NextResponse.json({ error: "Direct wallet top-up is disabled." }, { status: 400 });
    }

    if (action === "claim_upi_txn") {
      const transactionId = String(body?.transactionId || "").trim();
      if (!transactionId) {
        return NextResponse.json({ error: "Transaction ID is required." }, { status: 400 });
      }

      const claimed = await claimUpiCreditByTransactionId(session.username, transactionId);
      return NextResponse.json(
        {
          ok: true,
          amountPaise: claimed.amountPaise,
          walletBalancePaise: claimed.balancePaise,
          message: "Wallet credited successfully.",
        },
        { status: 200 }
      );
    }

    return NextResponse.json({ error: "Invalid action." }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}
