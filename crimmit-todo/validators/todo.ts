import Joi from "joi";

const signUpUserSchema = Joi.object({
  email: Joi.string().email().required(),
  username: Joi.string().required(),
  password: Joi.string().required(),
});

const signInUserSchema = Joi.object()
  .keys({
    username: Joi.string(),
    email: Joi.string().email(),
    password: Joi.string().min(6).max(200).required(),
  })
  .xor("username", "email");

const createTodoSchema = Joi.object({
  description: Joi.string(),
  title: Joi.string().required(),
  completed: Joi.boolean().default(false),
  category: Joi.string()
    .valid("WORK", "PERSONAL")
    .insensitive()
    .custom((value) => value.toUpperCase()),
  priority: Joi.string()
    .valid("LOW", "MEDIUM", "HIGH")
    .insensitive()
    .custom((value) => value.toUpperCase())
    .default("LOW"),
});

const updateTodoSchema = Joi.object({
  description: Joi.string(),
  title: Joi.string(),
  completed: Joi.boolean(),
});

export {
  signInUserSchema,
  createTodoSchema,
  updateTodoSchema,
  signUpUserSchema,
};
