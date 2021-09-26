import { Request, Response } from "express";
import prisma from "../../databases/prisma/connection";

export default async function destroy(req: Request, res: Response) {
  const userId = Number(req.params.id);

  if (userId != req.tokenPayload?.id) {
    return res.status(403).json({ message: "Not authorized" });
  }

  try {
    await prisma.user.delete({
      where: {
        id: userId,
      },
    });

    return res.sendStatus(204);
  } catch (error) {
    console.log(error);
    return res.status(400).json({ error });
  }
}
