import { Request, Response } from "express";

import prisma from "../../databases/prisma/connection";

export default async function list(req: Request, res: Response) {
  const take = req.query.take ? Number(req.query.take) : undefined;
  const skip = req.query.skip ? Number(req.query.skip) : undefined;

  const where = {
    deleted_at: null,
  };

  try {
    const countPromise = prisma.user.count({ where });

    const usersPromise = prisma.user.findMany({
      take,
      skip,
      where,
    });

    const [count, users] = await prisma.$transaction([
      countPromise,
      usersPromise,
    ]);

    const usersWithoutPassword = users.map((user) => ({
      ...user,
      password: undefined,
    }));

    return res.json({ count, users: usersWithoutPassword });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ error });
  }
}
