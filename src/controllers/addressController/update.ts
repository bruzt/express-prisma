import { Request, Response } from "express";

import prisma from "../../databases/prisma/connection";

export default async function update(req: Request, res: Response) {
  const userId = req.tokenPayload?.id;
  const addressId = Number(req.params.id);

  try {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        addresses: {
          where: {
            id: addressId,
          },
        },
      },
    });

    if (!user) return res.status(400).json({ message: "User not found" });
    if (user.addresses.length == 0)
      return res.status(400).json({ message: "Address not found" });

    const updatedAddress = await prisma.addresses.update({
      where: {
        id: addressId,
      },
      data: {
        ...req.body,
      },
    });

    return res.json(updatedAddress);
  } catch (error) {
    console.log(error);
    return res.status(400).json({ message: "Error updating address" });
  }
}
