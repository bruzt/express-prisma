import { PrismaClient } from "@prisma/client";

import encryptUserPassword from "./middlewares/encryptUserPassword";
import softDelete from "./middlewares/softDelete";

const prisma = new PrismaClient();

prisma.$use(async (params, next) => {
  params = await encryptUserPassword(params);
  params = await softDelete(params);

  return next(params);
});

export default prisma;
