import { Request, Response, NextFunction } from "express";
import { verifyToken } from "./verify";

export async function authMiddleware(
  req: Request & { user?: any },
  res: Response,
  next: NextFunction
) {
  try {
    const token =
      req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        error: "Missing token",
      });
    }

    const user = await verifyToken(token);

    if (!user) {
      return res.status(401).json({
        error: "Invalid token",
      });
    }

    req.user = user;

    next();
  } catch {
    return res.status(500).json({
      error: "Internal server error",
    });
  }
}