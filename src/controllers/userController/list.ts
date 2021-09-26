import { Request, Response } from "express";
import prisma from "../../databases/prisma/connection";

export default async function list(req: Request, res: Response) {
  try {
    const users = await prisma.user.findMany();

    return res.json(users);
  } catch (error) {
    console.log(error);
    return res.status(400).json({ error });
  }
}
