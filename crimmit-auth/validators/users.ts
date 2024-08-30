import Joi from "joi";

const signInUserSchema = Joi.object()
  .keys({
    username: Joi.string(),
    email: Joi.string().email(),
    password: Joi.string().min(6).max(200).required(),
  })
  .xor("username", "email");

const resetPasswordSchema = Joi.object()
  .keys({
    username: Joi.string(),
    email: Joi.string().email(),
  })
  .xor("username", "email")
  .required();

const signUpUserSchema = Joi.object({
  email: Joi.string().email().required(),
  username: Joi.string().required(),
  password: Joi.string().required(),
});

const resetPassWordWithPassword = Joi.object({
  password: Joi.string().min(6).max(200).required(),
  _csrf: Joi.string().strip(),
});
export {
  signInUserSchema,
  signUpUserSchema,
  resetPasswordSchema,
  resetPassWordWithPassword,
};
