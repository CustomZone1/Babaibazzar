import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const r = (rupees: number) => Math.round(rupees * 100);

async function main() {
  const existingStore = await prisma.shop.findFirst({
    orderBy: [{ isOpen: "desc" }, { createdAt: "asc" }],
  });

  if (!existingStore) {
    await prisma.shop.create({
      data: {
        name: "Babai Kirana",
        phone: "9999999999",
        addressLine: "Main Market, Babai (Makhannagar)",
        isOpen: true,
        products: {
          create: [
            {
              name: "Aashirvaad Atta",
              unit: "5 kg",
              category: "Atta",
              shopPricePaise: r(245),
              appPricePaise: r(255),
              inStock: true,
              showInTrending: true,
            },
            {
              name: "Fortune Oil",
              unit: "1 L",
              category: "Oil",
              shopPricePaise: r(140),
              appPricePaise: r(150),
              inStock: true,
              showInTrending: true,
            },
            {
              name: "Sugar",
              unit: "1 kg",
              category: "Grocery",
              shopPricePaise: r(45),
              appPricePaise: r(50),
              inStock: true,
              showInNewArrivals: true,
            },
            {
              name: "Milk",
              unit: "500 ml",
              category: "Dairy",
              shopPricePaise: r(28),
              appPricePaise: r(30),
              inStock: true,
              showInNewArrivals: true,
            },
          ],
        },
      },
    });

    console.log("Seed complete: created first store and starter products.");
    return;
  }

  const productCount = await prisma.product.count({
    where: { shopId: existingStore.id, isActive: true },
  });

  if (productCount === 0) {
    await prisma.product.createMany({
      data: [
        {
          shopId: existingStore.id,
          name: "Aashirvaad Atta",
          unit: "5 kg",
          category: "Atta",
          shopPricePaise: r(245),
          appPricePaise: r(255),
          inStock: true,
          showInTrending: true,
        },
        {
          shopId: existingStore.id,
          name: "Fortune Oil",
          unit: "1 L",
          category: "Oil",
          shopPricePaise: r(140),
          appPricePaise: r(150),
          inStock: true,
          showInTrending: true,
        },
        {
          shopId: existingStore.id,
          name: "Sugar",
          unit: "1 kg",
          category: "Grocery",
          shopPricePaise: r(45),
          appPricePaise: r(50),
          inStock: true,
          showInNewArrivals: true,
        },
        {
          shopId: existingStore.id,
          name: "Milk",
          unit: "500 ml",
          category: "Dairy",
          shopPricePaise: r(28),
          appPricePaise: r(30),
          inStock: true,
          showInNewArrivals: true,
        },
      ],
    });
    console.log("Seed complete: store existed, added starter products.");
    return;
  }

  console.log("Seed skipped: store and products already exist.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
