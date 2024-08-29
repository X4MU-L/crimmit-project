import bcrypt from "bcrypt";
import jwt, { TokenExpiredError } from "jsonwebtoken";
import { ServerError } from "./server-error";

type UIDObject = { userId: string };
const SALTROUNDS = 10;

async function hashPassword(password: string): Promise<string> {
  try {
    const salt = await bcrypt.genSalt(SALTROUNDS);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
  } catch (error) {
    console.log("Error hashing password", error);
    throw new ServerError("Error Hashing password", 500);
  }
}


export {
  hashPassword,
};
