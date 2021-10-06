import { Request, Response } from "express";
import jwt from "jsonwebtoken";

import prisma from "../../databases/prisma/connection";
import validateCPF from "../../utils/validateCPF";

export default async function store(req: Request, res: Response) {
  try {
    const userEmail = await prisma.user.findUnique({
      where: {
        email: req.body.email,
      },
    });

    if (userEmail) {
      return res.status(409).json({ message: "email already registered" });
    }

    const userCpf = await prisma.user.findUnique({
      where: {
        cpf: req.body.cpf,
      },
    });

    if (userCpf) {
      return res.status(409).json({ message: "cpf already registered" });
    }

    const isValidCPF = validateCPF(req.body.cpf);
    if (!isValidCPF) return res.status(400).json({ message: "invalid cpf" });

    const newUser = await prisma.user.create({
      data: req.body,
    });

    const newUserWithoutPassword = { ...newUser, password: undefined };

    const token = jwt.sign(
      { id: newUser.id, admin: newUser.admin },
      String(process.env.APP_SECRET),
      { expiresIn: "12h" }
    );

    return res.status(201).json({ user: newUserWithoutPassword, token });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ error });
  }
}
