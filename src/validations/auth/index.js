const { z } = require("zod");
const { ERRORS } = require("../../errors/index");
const { EmailSchema, PasswordSchema } = require("../../schemas/auth.schemas");

const SignupSchema = z
  .object({
    email: EmailSchema,
    name: z.string().max(25),
    password: PasswordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: ERRORS.PASSWORD_NOT_MATCH?.message,
    path: ["confirmPassword"],
  });

const LoginSchema = z.object({
  email: EmailSchema,
  password: PasswordSchema,
});

module.exports = { SignupSchema, LoginSchema };
