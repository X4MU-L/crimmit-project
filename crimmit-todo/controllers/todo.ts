import { Request, Response } from "express";
import {
  getTodos,
  createTodo,
  deleteTodo,
  updateTodo,
  getTodosByUserId,
} from "../utils";
import { ITodoCreate, IUpdateTodo } from "../types";
import { createTodoSchema, updateTodoSchema } from "../validators";

type UIDObject = { userId: string };
export interface CustomRequest<T = {}> extends Request {
  user?: UIDObject;
  body: T;
}
// Create a new todo
async function handleCreateTodo(
  req: CustomRequest<ITodoCreate>,
  res: Response
) {
  const { user } = req;
  const schema = await createTodoSchema.validateAsync(req.body);
  const todo = await createTodo({ ...schema, userId: user?.userId });
  res.status(201).json({
    success: true,
    message: "Todo successfully created",
    todo,
  });
}

// Get User todos
async function handleGetUserTodos(req: CustomRequest, res: Response) {
  const { user } = req;
  const todos = await getTodosByUserId(user?.userId ?? null);
  res.status(200).json({
    success: true,
    message: "Todos successfully fetched",
    todos,
  });
}

// Get all todos
async function handleGetTodos(req: CustomRequest, res: Response) {
  const todos = await getTodos();
  res.status(200).json({
    success: true,
    message: "Todos successfully fetched",
    todos,
  });
}

// Update a todo by ID
async function handleUpdateTodo(
  req: CustomRequest<IUpdateTodo>,
  res: Response
) {
  const { id } = req.params;
  const schema = await updateTodoSchema.validateAsync(req.body);
  const updatedTodo = await updateTodo(id, schema);

  res.status(200).json({
    success: true,
    message: "Todo successfully updated",
    todo: updatedTodo,
  });
}

// Delete a todo by ID
async function handleDeleteTodo(req: Request, res: Response) {
  const { id } = req.params;
  await deleteTodo(id);
  res.status(200).json({ success: true, message: "Todo deleted" });
}

export {
  handleCreateTodo,
  handleDeleteTodo,
  handleGetTodos,
  handleUpdateTodo,
  handleGetUserTodos,
};
