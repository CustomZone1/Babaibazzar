import { prisma } from "@/lib/prisma";

export type PrimaryStore = {
  id: string;
  name: string;
  addressLine: string;
  isOpen: boolean;
};

export async function getPrimaryStore() {
  const store = await prisma.shop.findFirst({
    orderBy: [{ isOpen: "desc" }, { createdAt: "asc" }],
    select: {
      id: true,
      name: true,
      addressLine: true,
      isOpen: true,
    },
  });

  return store as PrimaryStore | null;
}

