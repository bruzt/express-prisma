import { Prisma, User } from "@prisma/client";
import bcrypt from "bcrypt";

export default async function encryptUserPassword(
  params: Prisma.MiddlewareParams,
  next: (params: Prisma.MiddlewareParams) => Promise<any>
) {
  const data: User = params.args?.data;

  if (params.model == "User") {
    if (params.action == "create" || params.action == "update") {
      if (data.password) {
        const salt = await bcrypt.genSalt();
        const hashPassword = await bcrypt.hash(data.password, salt);

        data.password = hashPassword;
      }
    }
  }

  const newParams = { ...params, args: { ...params.args, data } };
  return next(newParams);
}
