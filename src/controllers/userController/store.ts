import { Request, Response } from "express";
import prisma from "../../databases/prisma/connection";

export default async function store(req: Request, res: Response) {
  try {
    const user = await prisma.user.create({
      data: {
        ...req.body,
      },
    });

    return res.status(201).json(user);
  } catch (error) {
    console.log(error);
    return res.status(400).json({ error });
  }
}
