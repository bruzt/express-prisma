import { PrismaClient } from "@prisma/client";

import encryptUserPassword from "./middlewares/encryptUserPassword";
import softDelete from "./middlewares/softDelete";
import redisCache from "./middlewares/redisCache";

const prisma = new PrismaClient();

prisma.$use(encryptUserPassword);
prisma.$use(softDelete);
prisma.$use(redisCache);

export default prisma;
