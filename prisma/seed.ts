import prisma from "../src/databases/prisma/connection";

import { user as devUser } from "../src/databases/prisma/seeds/dev/user";
import { categories as devCategories } from "../src/databases/prisma/seeds/dev/categories";
import { products as devProducts } from "../src/databases/prisma/seeds/dev/products";

async function main() {
  if (process.env.NODE_ENV == "dev") {
    await prisma.user.create({
      data: devUser,
    });

    await prisma.category.createMany({
      data: devCategories,
    });

    await prisma.product.createMany({
      data: await devProducts(),
    });
  }
}

main()
  .catch((error) => {
    if (error instanceof Error) {
      console.log(error.message);
    }
    console.log(error);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
