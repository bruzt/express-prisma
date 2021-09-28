import { Request, Response } from "express";

import prisma from "../../databases/prisma/connection";
import { userPrismaSelect } from "./utils/prismaSelect";

export default async function show(req: Request, res: Response) {
  const userId = Number(req.params.id);

  if (userId != req.tokenPayload?.id) {
    return res.status(403).json({ message: "Not authorized" });
  }

  try {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: userPrismaSelect,
    });

    return res.json(user);
  } catch (error) {
    console.log(error);
    return res.status(400).json({ error });
  }
}
