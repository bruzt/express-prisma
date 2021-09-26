import { PrismaClient } from "@prisma/client";

import encryptUserPassword from "./middlewares/encryptUserPassword";

const prisma = new PrismaClient();

prisma.$use(encryptUserPassword);

export default prisma;
