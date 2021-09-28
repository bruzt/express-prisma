import { Prisma } from "@prisma/client";

export const userPrismaSelect: Prisma.UserSelect = {
  id: true,
  name: true,
  email: true,
  password: false,
  createdAt: false,
  updatedAt: false,
};
