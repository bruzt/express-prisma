import { Request, Response } from "express";

import prisma from "../../databases/prisma/connection";

interface IAddressData {
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  zipcode: string;
}

export default async function (req: Request, res: Response) {
  const id = req.tokenPayload?.id;
  const bodyData = req.body as IAddressData;

  try {
    const user = await prisma.user.findFirst({
      where: {
        id,
        deleted_at: null,
      },
    });

    if (!user) return res.status(404).json({ message: "user not found" });

    const address = await prisma.addresses.create({
      data: {
        ...bodyData,
        user_id: user.id,
      },
    });

    return res.status(201).json(address);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "error creating address" });
  }
}
