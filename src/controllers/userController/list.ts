import { Request, Response } from "express";

import prisma from "../../databases/prisma/connection";
import { userSelect } from "./utils/select";

export default async function list(req: Request, res: Response) {
  try {
    const users = await prisma.user.findMany({
      select: userSelect,
    });

    return res.json(users);
  } catch (error) {
    console.log(error);
    return res.status(400).json({ error });
  }
}
