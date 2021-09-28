import { Request, Response } from "express";

import prisma from "../../databases/prisma/connection";
import { userPrismaSelect } from "./utils/prismaSelect";

export default async function list(req: Request, res: Response) {
  const take = req.query.take ? Number(req.query.take) : undefined;
  const skip = req.query.skip ? Number(req.query.skip) : undefined;

  try {
    const countPromise = prisma.user.count();

    const usersPromise = prisma.user.findMany({
      select: userPrismaSelect,
      take,
      skip,
    });

    const [count, users] = await prisma.$transaction([
      countPromise,
      usersPromise,
    ]);

    return res.json({ count, users });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ error });
  }
}
