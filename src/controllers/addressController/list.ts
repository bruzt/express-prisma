import { Request, Response } from "express";

import prisma from "../../databases/prisma/connection";

export default async function list(req: Request, res: Response) {
  const id = req.tokenPayload?.id;

  try {
    const addresses = await prisma.addresses.findMany({
      where: {
        user_id: id,
        deleted_at: null,
      },
    });

    return res.json(addresses);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "error listing address" });
  }
}
