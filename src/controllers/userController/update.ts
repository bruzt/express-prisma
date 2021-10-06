import { Request, Response } from "express";
import bcrypt from "bcrypt";

import prisma from "../../databases/prisma/connection";
import validateCPF from "../../utils/validateCPF";

export default async function update(req: Request, res: Response) {
  const userId = req.tokenPayload?.id;

  try {
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
        deleted_at: null,
      },
    });

    if (!user) return res.status(400).json({ message: "User not found" });

    if (req.body.cpf) {
      const isValidCPF = validateCPF(req.body.cpf);
      if (!isValidCPF) return res.status(400).json({ message: "invalid cpf" });
    }

    let password = undefined;

    if (req.body.currentPassword && req.body.newPassword) {
      if (await bcrypt.compare(req.body.currentPassword, user.password)) {
        password = req.body.newPassword;
      } else {
        return res.status(400).json({ message: "wrong current password" });
      }
    }

    delete req.body.currentPassword;
    delete req.body.newPassword;

    const updatedUser = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        ...req.body,
        password,
      },
    });

    const updatedUserWithoutPassword = { ...updatedUser, password: undefined };

    return res.json(updatedUserWithoutPassword);
  } catch (error) {
    console.log(error);
    return res.status(400).json({ error });
  }
}
