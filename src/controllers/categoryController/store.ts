import { Request, Response } from "express";

import prisma from "../../databases/prisma/connection";

interface IBody {
  name: string;
  parent_id?: number;
}

export default async function (req: Request, res: Response) {
  const bodyData = req.body as IBody;

  try {
    if (bodyData.parent_id) {
      const parent = await prisma.category.findUnique({
        where: {
          id: bodyData.parent_id,
        },
      });

      if (parent == null)
        return res
          .status(404)
          .json({ message: "parent category id not found" });
    }

    const category = await prisma.category.create({
      data: bodyData,
    });

    return res.status(201).json(category);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "internal error" });
  }
}
