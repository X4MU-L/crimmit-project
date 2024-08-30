import { Router } from "express";
import {
  handleCreateTodo,
  handleDeleteTodo,
  handleGetTodos,
  handleUpdateTodo,
  handleGetUserTodos,
} from "../controllers";
import { asyncHandler, customAsyncHandler } from "../utils";
import { authHandler } from "../middleware";
const router = Router();

router
  .route("/")
  .post(customAsyncHandler(authHandler), customAsyncHandler(handleCreateTodo))
  .get(customAsyncHandler(handleGetTodos));

router.get(
  "/user",
  customAsyncHandler(authHandler),
  customAsyncHandler(handleGetUserTodos)
);
router.put(
  "/:id",
  customAsyncHandler(authHandler),
  customAsyncHandler(handleUpdateTodo)
);
router.delete(
  "/:id",
  customAsyncHandler(authHandler),
  asyncHandler(handleDeleteTodo)
);

export default router;
