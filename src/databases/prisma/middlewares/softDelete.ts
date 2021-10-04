import { Prisma } from "@prisma/client";

export default async function softDelete(
  params: Prisma.MiddlewareParams,
  next: (params: Prisma.MiddlewareParams) => Promise<any>
) {
  if (
    (params.model == "User" && params.action == "delete") ||
    (params.model == "Addresses" && params.action == "delete")
  ) {
    params.action = "update";
    params.args["data"] = { deleted_at: new Date() };
  }

  return next(params);
}
