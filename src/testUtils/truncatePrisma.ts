import { PrismaClient, Prisma } from "@prisma/client";

export const cleanupDatabase = async () => {
  if (process.env.NODE_ENV === "test") {
    const prisma = new PrismaClient();
    const tableNames = Prisma.dmmf.datamodel.models.map((model) => model.name);

    return Promise.all(
      tableNames.map((tableName) =>
        // @ts-ignore
        prisma[tableName.toLowerCase()].deleteMany()
      )
    );
  }
};
