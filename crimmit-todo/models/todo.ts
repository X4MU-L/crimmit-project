import {
  Schema,
  Document,
  createConnection,
  Types,
  Connection,
} from "mongoose";

// Ensure dotenv config is called before any other imports
import dotenv from "dotenv";
dotenv.config();
// Connect to the 'todo' database
const todoConnection = createConnection(process.env.MONGODB_URL!, {
  dbName: "todo",
});
// Define a TypeScript interface for the Todo model
interface ITodo extends Document {
  title: string;
  completed: boolean;
  userId: Types.ObjectId;
  description: string;
  category: string;
  priority: string;
  createdAt: Date;
  updatedAt: Date;
}

const todoSchema = new Schema<ITodo>(
  {
    title: { type: String, required: true },
    completed: { type: Boolean, default: false },
    description: { type: String },
    priority: { type: String, default: "LOW" },
    category: { type: String },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Todo = todoConnection.model<ITodo>("Todo", todoSchema);

export const connectTodoDB = (): Promise<Connection> => {
  return new Promise((resolve, reject) => {
    todoConnection.once("open", () => resolve(todoConnection));
    todoConnection.on("error", (err) => reject(err));
  });
};
export default Todo;
