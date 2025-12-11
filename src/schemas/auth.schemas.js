const { z } = require("zod");
const { ERRORS } = require("../errors/index.js");
const { EMAIL_REGEX } = require("../helpers/regex.helpers.js");

const EmailSchema = z
  .string({ required_error: ERRORS.VALIDATION_REQUIRED.message })
  .trim()
  .min(1, { message: ERRORS.VALIDATION_REQUIRED.message })
  .regex(EMAIL_REGEX, { message: ERRORS.INVALID_EMAIL.message });

const PasswordSchema = z
  .string()
  .trim()
  .min(6, { message: ERRORS.INVALID_PASSWORD.message });

module.exports = {
  EmailSchema,
  PasswordSchema,
};
