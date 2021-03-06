import { Request, Response } from "express";

import prisma from "../../databases/prisma/connection";

export default async function show(req: Request, res: Response) {
  const userId = Number(req.params.id);

  if (userId != req.tokenPayload?.id) {
    return res.status(403).json({ message: "Not authorized" });
  }

  try {
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
        deleted_at: null,
      },
    });

    if (!user) return res.status(400).json({ message: "User not found" });

    const userWithoutPassword = { ...user, password: undefined };

    return res.json(userWithoutPassword);
  } catch (error) {
    console.log(error);
    return res.status(400).json({ error });
  }
}
