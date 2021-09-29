import { Request, Response } from "express";

import prisma from "../../databases/prisma/connection";

export default async function store(req: Request, res: Response) {
  try {
    const userEmail = await prisma.user.findUnique({
      where: {
        email: req.body.email,
      },
    });

    if (userEmail) {
      return res.status(400).json({ message: "email already registered" });
    }

    const userCpf = await prisma.user.findUnique({
      where: {
        cpf: req.body.cpf,
      },
    });

    if (userCpf) {
      return res.status(400).json({ message: "cpf already registered" });
    }

    const newUser = await prisma.user.create({
      data: req.body,
    });

    const newUserWithoutPassword = { ...newUser, password: undefined };

    return res.status(201).json(newUserWithoutPassword);
  } catch (error) {
    console.log(error);
    return res.status(400).json({ error });
  }
}
