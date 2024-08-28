import Joi from "joi";

const signInUserSchema = Joi.object()
  .keys({
    username: Joi.string(),
    email: Joi.string().email(),
    password: Joi.string().min(6).max(200).required(),
  })
  .xor("username", "email");

const signUpUserSchema = Joi.object({
  email: Joi.string().required(),
  username: Joi.string().required(),
  password: Joi.string().required(),
});

export { signInUserSchema, signUpUserSchema };
