import { Request, Response } from "express";
import prisma from "../../databases/prisma/connection";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const sessionErrorMessage = "e-mail or password incorrect";

export default async function list(req: Request, res: Response) {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findFirst({
      where: {
        email,
        deleted_at: null,
      },
    });

    if (!user) return res.status(400).json({ message: sessionErrorMessage });

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(401).json({ message: sessionErrorMessage });
    }

    const token = jwt.sign(
      {
        id: user.id,
        admin: user.admin,
      },
      String(process.env.APP_SECRET),
      { expiresIn: "12h" }
    );

    const userWithoutPassword = { ...user, password: undefined };

    return res.json({ user: userWithoutPassword, token });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ error });
  }
}
