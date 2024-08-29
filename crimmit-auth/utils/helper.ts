import fs from "fs/promises";
import path from "path";
import ejs from "ejs";
import dayjs from "dayjs";
import bcrypt from "bcrypt";
import jwt, { TokenExpiredError } from "jsonwebtoken";
import { ServerError } from "./server-error";
import { UserType } from "../models";
import {
  JWT_REFRESH_TOKEN_EXPIRATION,
  JWT_TOKEN_EXPIRATION,
  PASSWORD_RESET_EXPIRATION,
} from "./constant";

//import type { EmailAttachmentsArrayType, VerifyEmailFormatType } from "./type";

const SALTROUNDS = 10;

type UIDObject = { userId: string };

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

function createResetToken(userId: string) {
  const token = jwt.sign({ userId }, process.env.PASSWORD_RESET_SECRET!, {
    expiresIn: PASSWORD_RESET_EXPIRATION,
  });
  return { token };
}

function verifyResetToken(token: string) {
  try {
    const decoded = jwt.verify(token, process.env.PASSWORD_RESET_SECRET!);
    return decoded as UIDObject;
  } catch (error: unknown) {
    if (error instanceof TokenExpiredError) {
      throw new ServerError(`${error.name}: token expried`, 401);
    }
    throw new ServerError("Forbidden", 403);
  }
}

function createSignedToken(data: string | object): string {
  try {
    const token = jwt.sign(data, process.env.APP_SECRET!, {
      expiresIn: JWT_TOKEN_EXPIRATION,
    });
    return token;
  } catch (error) {
    console.log("Error creating JWT token", error);
    throw new ServerError("Error signing JWT Token", 500);
  }
}
function createRefreshToken(data: string | object): string {
  try {
    const token = jwt.sign(data, process.env.APP_REFRESH_TOKEN_SECRET!, {
      expiresIn: JWT_REFRESH_TOKEN_EXPIRATION,
    });
    return token;
  } catch (error) {
    console.log("Error creating Refresh token", error);
    throw new ServerError("Error creating Refresh token", 500);
  }
}

function createTokens(data: string | object): {
  token: string;
  refreshToken: string;
} {
  const token = createSignedToken(data);
  const refreshToken = createRefreshToken(data);
  return { token, refreshToken };
}
async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  try {
    const match = await bcrypt.compare(password, hashedPassword);
    return match;
  } catch (error) {
    console.log("Error verifying password: verifyPassword", error);
    throw new ServerError("Failed to verify password", 500);
  }
}

function verifyJWTToken(token: string, refresh = false) {
  try {
    const secret = refresh
      ? process.env.APP_REFRESH_TOKEN_SECRET!
      : process.env.APP_TOKEN_SECRET!;
    const decoded = jwt.verify(token, secret);
    return decoded as UIDObject;
  } catch (error: unknown) {
    if (error instanceof TokenExpiredError) {
      throw new ServerError(`${error.name}: token expried`, 401);
    }
    throw new ServerError("Forbidden", 403);
  }
}

function expirationTime(window: number = 6) {
  if (window < 1) {
    throw new Error("Invalid window time for expiration Time");
  }
  return `${window} ${window > 1 ? "minutes" : "minute"}`;
}

async function getMailTemplateContent(path: string) {
  return await fs.readFile(path, "utf-8");
}

async function getEjsContent<T extends ejs.Data = any>(path: string, data: T) {
  try {
    const fileContent = await getMailTemplateContent(path);
    return ejs.render(fileContent, data);
  } catch (error) {
    console.log("Error occoured: getEjsContent", error);
    return null;
  }
}

function generateMailData(data: { userName: string; link: string }) {
  const expires = Number(PASSWORD_RESET_EXPIRATION[0]);
  const expiration = expirationTime(expires);
  const date = dayjs().format("MMM DD YYYY");
  const year = date.split(" ")[2];
  const mailData = {
    ...data,
    date,
    year,
    validity: expiration,
  };
  return mailData;
}

export {
  hashPassword,
  verifyPassword,
  createSignedToken,
  createRefreshToken,
  createTokens,
  verifyJWTToken,
  createResetToken,
  verifyResetToken,
  expirationTime,
  getEjsContent,
  generateMailData,
};
