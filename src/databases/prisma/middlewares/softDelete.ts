import { Prisma } from "@prisma/client";

export default async function softDelete(params: Prisma.MiddlewareParams) {
  if (params.model == "User" && params.action == "delete") {
    params.action = "update";
    params.args["data"] = { deleted_at: new Date() };
  }

  return params;
}
