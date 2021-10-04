import { Prisma } from "@prisma/client";
import bcrypt from "bcrypt";

export default async function encryptUserPassword(
  params: Prisma.MiddlewareParams,
  next: (params: Prisma.MiddlewareParams) => Promise<any>
) {
  if (params.model == "User") {
    if (params.action == "create" || params.action == "update") {
      if (params.args.data.password) {
        const salt = await bcrypt.genSalt();
        const hashPassword = await bcrypt.hash(params.args.data.password, salt);

        params.args.data.password = hashPassword;
      }
    }
  }

  return next(params);
}
