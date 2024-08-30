import { Response, Request, NextFunction } from "express";
import { ServerError, verifyJWTToken } from "../utils";
import { verifyResetToken } from "../utils/helper";
import { REFRESH_TOKEN_NAME } from "../utils/constant";

type UIDObject = { userId: string };
export interface CustomRequest<T = {}> extends Request {
  user?: UIDObject;
  body: T;
}

const PUBLIC_OR_PRIVATE = [
  "/reset-password",
  /^\/reset-password\/[\w-]+\.[\w-]+\.[\w-]+$/,
];
export async function authHandler<T = {}>(
  req: CustomRequest<T>,
  res: Response,
  next: NextFunction
) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    if ((PUBLIC_OR_PRIVATE[1] as RegExp).test(req.url || req.path)) {
      const resetToken = req.params?.token;
      const userObject = verifyResetToken(resetToken);
      req.user = userObject;
      console.log(userObject);
      return next();
    } else if (
      ["/refresh-token"].includes(req.url || req.path) &&
      req.cookies[REFRESH_TOKEN_NAME]
    ) {
      const refreshToken = req.cookies[REFRESH_TOKEN_NAME];
      const decoded = verifyJWTToken(refreshToken, true);
      req.user = decoded;
      return next();
    } else if (PUBLIC_OR_PRIVATE.includes(req.url || req.path)) {
      return next();
    }
    throw new ServerError("Unauthorized", 401);
  }
  const decoded = verifyJWTToken(token);
  req.user = decoded;
  return next();
}
