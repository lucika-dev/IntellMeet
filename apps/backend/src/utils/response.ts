import type { Response } from "express";

export const sendOk = <T>(res: Response, data: T, status = 200) => {
  return res.status(status).json({ data });
};

export const sendError = (res: Response, status: number, message: string, code?: string) => {
  return res.status(status).json({ error: message, code });
};
