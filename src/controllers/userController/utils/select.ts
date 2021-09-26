import { Prisma } from "@prisma/client";

export const userSelect: Prisma.UserSelect = {
  id: true,
  name: true,
  email: true,
  password: false,
  createdAt: false,
  updatedAt: false,
};
