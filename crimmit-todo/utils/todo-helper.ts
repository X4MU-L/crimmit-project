import { Todo, User } from "../models";
import { ServerError } from "./server-error";
import { ITodoCreate } from "../types";
import { ServerResponse } from "http";

async function getTodos() {
  return await Todo.find();
}

async function createTodo(data: ITodoCreate) {
  const todo = await Todo.create(data);
  return todo.toObject();
}

async function updateTodo(todoId: string, data: Record<string, any>) {
  const updatedTodo = await Todo.findByIdAndUpdate(todoId, data, {
    new: true,
  });
  if (!updatedTodo) {
    throw new ServerError("Todo not found", 404);
  }
  return updatedTodo.toObject();
}

async function deleteTodo(todoId: string) {
  const deletedTodo = await Todo.findByIdAndDelete(todoId);
  if (!deletedTodo) {
    throw new ServerError("Todo not found", 404);
  }
  return deletedTodo;
}

async function getTodosByUserId(userId: string | null) {
  const todos = await Todo.find({ userId });
  if (!todos) throw new ServerError("Todo not found", 404);
  return todos;
}

export { getTodos, createTodo, deleteTodo, updateTodo, getTodosByUserId };
