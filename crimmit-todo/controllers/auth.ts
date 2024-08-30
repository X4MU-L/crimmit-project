import { API, ROOT_API } from "../api";
import { Request, Response, NextFunction } from "express";
import { signUpUserSchema, signInUserSchema } from "../validators";
async function handleSignUp(req: Request, res: Response) {
  const schema = await signUpUserSchema.validateAsync(req.body);
  const response = await ROOT_API.post("/auth/signup", schema);
  res.status(201).json({
    ...response.data,
  });
}

async function handleSignIn(req: Request, res: Response) {
  const schema = await signInUserSchema.validateAsync(req.body);
  const response = await ROOT_API.post("/auth/signin", schema);
  res.status(200).json({
    ...response.data,
  });
}
async function refreshToken(req: Request, res: Response) {
  const schema = await signInUserSchema.validateAsync(req.body);
  const response = await ROOT_API.post("/auth/signin", schema);
  return response.data;
}
export { handleSignUp, handleSignIn, refreshToken };
