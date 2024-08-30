export interface ITodoCreate {
  title: string;
  description?: string;
  priority?: string;
  category?: string;
  userId: string;
  completed?: boolean;
}

export interface IUpdateTodo {
  title?: string;
  description?: string;
  completed?: boolean;
}
