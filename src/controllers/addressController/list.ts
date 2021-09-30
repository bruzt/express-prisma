import { Request, Response } from "express";

import prisma from "../../databases/prisma/connection";

export default async function list(req: Request, res: Response) {
  const id = req.tokenPayload?.id;

  try {
    const user = await prisma.user.findFirst({
      where: {
        id,
        deleted_at: null,
      },
      include: {
        addresses: {
          where: {
            deleted_at: null,
          },
        },
      },
    });

    if (!user) return res.status(404).json({ message: "user not found" });

    return res.json(user.addresses);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "error listing address" });
  }
}
