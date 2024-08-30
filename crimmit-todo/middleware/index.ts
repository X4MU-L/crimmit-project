import { Response, Request, NextFunction } from "express";
import { ServerError, verifyToken } from "../utils";

type UIDObject = { userId: string };
export interface CustomRequest<T = {}> extends Request {
  user?: UIDObject;
  body: T;
}

const PRIVATE = ["/todos"];
const PUBLIC_OR_PRIVATE = [
  "/signin",
  "/signup",
  "/reset-password",
  /^\/reset-password\/[\w-]+\.[\w-]+\.[\w-]+$/,
];
export async function authHandler<T = {}>(
  req: CustomRequest<T>,
  res: Response,
  next: NextFunction
) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token || PUBLIC_OR_PRIVATE.includes(req.url || req.path)) {
    if (PUBLIC_OR_PRIVATE.includes(req.url || req.path)) {
      return next();
    }
    throw new ServerError("Unauthorized", 401);
  }
  req.user = await verifyToken(token);
  return next();
}
