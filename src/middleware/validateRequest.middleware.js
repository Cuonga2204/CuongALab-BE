const { ERRORS } = require("../errors/index");
const { errorHandler } = require("../utils/ResponseHandle");

const validateRequest = (schema, property) => {
  return (req, res, next) => {
    const result = schema.safeParse(req[property]);

    if (result.success) {
      req[property] = result.data;
      next();
    } else {
      const message = result.error.issues
        ?.map((issue) => `${issue.path.join(".")}: ${issue.message}`)
        .join(", ");

      return errorHandler(res, ERRORS.INVALID_PARAMETER, message);
    }
  };
};

module.exports = { validateRequest };
