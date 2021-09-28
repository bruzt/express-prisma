import { Request, Response } from "express";

import prisma from "../../databases/prisma/connection";
import { userPrismaSelect } from "./utils/select";

export default async function store(req: Request, res: Response) {
  try {
    const user = await prisma.user.findUnique({
      where: {
        email: req.body.email,
      },
    });

    if (user) {
      return res.status(400).json({ message: "e-mail already registered" });
    }

    const newUser = await prisma.user.create({
      data: req.body,
      select: userPrismaSelect,
    });

    return res.status(201).json(newUser);
  } catch (error) {
    console.log(error);
    return res.status(400).json({ error });
  }
}
