import { Request, Response } from "express";

import prisma from "../../databases/prisma/connection";
import { userSelect } from "./utils/select";

export default async function update(req: Request, res: Response) {
  const userId = Number(req.params.id);

  if (userId != req.tokenPayload?.id) {
    return res.status(403).json({ message: "Not authorized" });
  }

  try {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) return res.status(400).json({ message: "User not found" });

    const updatedUser = await prisma.user.update({
      where: {
        id: userId,
      },
      data: req.body,
      select: userSelect,
    });

    return res.json(updatedUser);
  } catch (error) {
    console.log(error);
    return res.status(400).json({ error });
  }
}
