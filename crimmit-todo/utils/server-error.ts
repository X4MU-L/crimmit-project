import { MongoServerError } from "mongodb";
import { CastError } from "mongoose";
import { Request, Response, NextFunction } from "express";
import { ValidationError } from "joi";
import { AxiosError } from "axios";

type UIDObject = { userId: string };
export interface CustomRequest<T = {}> extends Request {
  user?: UIDObject;
  body: T;
}
type AuthAxiosError = {
  status: string;
  error?: string;
  message: string;
  success: boolean;
  stack?: string;
  isOperational?: boolean;
  name?: string;
};
const dev = process.env.NODE_ENV === "development";
const prod = process.env.NODE_ENV === "production";
export class ServerError extends Error {
  public statusCode: number;
  public status: string;
  public isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message.replace(/"/g, ""));
    this.name = this.constructor.name;
    this.statusCode = statusCode ?? 500;
    this.status = `${statusCode}`.startsWith("4") ? "error" : "fail";
    this.isOperational = true;

    if (typeof Error.captureStackTrace === "function") {
      Error.captureStackTrace(this, this.constructor);
    } else {
      this.stack = new Error(message).stack;
    }
  }
}

export const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

export const customAsyncHandler =
  <T = {}>(
    fn: (
      req: CustomRequest<T>,
      res: Response,
      next: NextFunction
    ) => Promise<void>
  ) =>
  (req: CustomRequest<T>, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

const axiosErrorHandler = (err: AxiosError<AuthAxiosError>) => {
  let message = `AUTHSERVER: ${err?.response?.data.message} ${err?.response?.data.success} - name:${err?.response?.data?.name} - status:${err?.response?.data?.status} - error:${err?.response?.data?.error} - stack:${err?.response?.data?.stack}`;
  if (prod) message = err?.response?.data.message ?? "";
  return new ServerError(message, err.status ?? 500);
};
// Cast Error Handler
export const castErrorHandler = (err: CastError) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new ServerError(message, 400);
};

const validationErrorHandler = (err: ValidationError) => {
  return new ServerError(`${dev ? `${err.name}: ` : ""}${err.message}`, 400);
};

const mongooseErrorHandler = (err: MongoServerError) => {
  return new ServerError(`${dev ? `${err.name}: ` : ""}${err.message}`, 400);
};
// Error Handler For Development Environment
const developmentError = (
  err:
    | ServerError
    | ValidationError
    | MongoServerError
    | CastError
    | AxiosError<AuthAxiosError>,
  res: Response
) => {
  if (err instanceof ValidationError) {
    err = validationErrorHandler(err) as ServerError;
  } else if (err instanceof MongoServerError) {
    err = mongooseErrorHandler(err) as ServerError;
  } else if (err instanceof AxiosError) {
    err = axiosErrorHandler(err) as ServerError;
  } else if (err.name === "CastError") {
    err = castErrorHandler(err as CastError) as ServerError;
  } else if (!(err instanceof ServerError)) {
    err = new ServerError(err.message, 500);
    console.log(err);
    throw err;
  }

  res.status(err?.statusCode).json({
    status: err?.status,
    error: err,
    message: err?.message,
    success: false,
    stack: err.stack,
  });
};

//Error Handler For Production Environment
const productionError = (
  err: ServerError | ValidationError | MongoServerError | CastError,
  res: Response
) => {
  if (err instanceof ValidationError) {
    err = validationErrorHandler(err) as ServerError;
  } else if (err instanceof MongoServerError) {
    err = mongooseErrorHandler(err) as ServerError;
  } else if (err instanceof AxiosError) {
    err = axiosErrorHandler(err) as ServerError;
  } else if (err.name === "CastError") {
    err = castErrorHandler(err as CastError) as ServerError;
  } else if (!(err instanceof ServerError)) {
    err = new ServerError(err.message, 500);
  }

  if (err.isOperational) {
    res.status(err.statusCode).json({
      success: false,
      status: err.status,
      message: err.message,
    });
  } else {
    res.status(500).json({
      status: "error",
      message: err.message,
      name: err?.name,
    });
  }
};

const otherErrors = (
  err: ServerError | ValidationError | MongoServerError | CastError,
  res: Response
) => {
  if (err instanceof ValidationError) {
    developmentError(new ServerError(err.message, 400), res);
  }
};
export const globalErrorHandler = (
  err: ServerError | ValidationError | MongoServerError | CastError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (dev) {
    developmentError(err, res);
  } else if (prod) {
    productionError(err, res);
  } else {
    otherErrors(err, res);
  }
};
