import { Prisma } from "@prisma/client";

import redisConnection from "../../redis/connection";

export default async function redisCache(
  params: Prisma.MiddlewareParams,
  next: (params: Prisma.MiddlewareParams) => Promise<any>
) {
  if (
    (params.action == "findFirst" ||
      params.action == "findUnique" ||
      params.action == "findMany") &&
    params.args["where"] != undefined
  ) {
    const key = `${params.model}-${JSON.stringify(params.args["where"])}`;

    const data = await redisConnection.getRedis(key);

    if (data) {
      return data;
    } else {
      const result = await next(params);

      await redisConnection.setRedis(key, JSON.stringify(result));

      return result;
    }
  }

  return next(params);
}
