import { Request, Response, NextFunction } from "express";

import jwtAuthentication from "./jwtAuthentication";

export default async function adminJwtAuthentication(
  req: Request,
  res: Response,
  next: NextFunction
) {
  jwtAuthentication(req, res, async () => {
    const admin = req.tokenPayload?.admin;

    try {
      if (!admin) return res.status(403).json({ message: "not an admin" });

      return next();
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "internal error" });
    }
  });
}
