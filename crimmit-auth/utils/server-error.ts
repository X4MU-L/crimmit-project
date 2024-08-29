import { MongoError } from "mongodb";
import { CastError } from "mongoose";
import { Request, Response, NextFunction } from "express";

export class ServerError extends Error {
  public statusCode: number;
  public status: string;
  public isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message.replace(/"/g, ""));
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;

    if (typeof Error.captureStackTrace === "function") {
      Error.captureStackTrace(this, this.constructor);
    } else {
      this.stack = new Error(message).stack;
    }
  }
}

// Cast Error Handler
export const castErrorHandler = (err: CastError) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new ServerError(message, 400);
};

// Error Handler For Development Environment
const developmentError = (err: ServerError, res: Response) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

//Error Handler For Production Environment
const productionError = (err: ServerError, res: Response) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    res.status(500).json({
      status: "error",
      message: "something went very wrong!",
    });
  }
};
export const globalErrorHandler = (
  err: ServerError | CastError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (process.env.NODE_ENV === "development" && err instanceof ServerError) {
    developmentError(err, res);
  } else if (process.env.NODE_ENV === "production") {
    if (err.name === "CastError")
      err = castErrorHandler(err as CastError) as ServerError;
    productionError(err as ServerError, res);
  } else {
    developmentError(err as ServerError, res);
  }
};
