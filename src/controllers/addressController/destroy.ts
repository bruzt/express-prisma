import { Request, Response } from "express";

import prisma from "../../databases/prisma/connection";

export default async function destroy(req: Request, res: Response) {
  const paramsId = Number(req.params.id);
  const id = req.tokenPayload?.id;

  try {
    const address = await prisma.addresses.findFirst({
      where: {
        id: paramsId,
        user_id: id,
        deleted_at: null,
      },
    });

    if (!address) return res.status(404).json({ message: "address not found" });

    await prisma.addresses.delete({
      where: {
        id: paramsId,
      },
    });

    return res.sendStatus(204);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "internal error" });
  }
}
