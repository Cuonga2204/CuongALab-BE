const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const { errorHandler } = require("../utils/ResponseHandle");
const { ERRORS } = require("../errors/index");
dotenv.config();

const authUserMiddleware = (req, res, next) => {
  const token = req.headers.authorization.split(" ")[1];
  const userId = req.body.id || req.params.id;

  jwt.verify(token, process.env.ACCESS_TOKEN, function (err, user) {
    if (err) {
      return errorHandler(res, ERRORS.AUTHENTICATION_FAILED);
    }

    const { payload } = user;
    if (payload.id === userId) {
      next();
    } else {
      return errorHandler(res, ERRORS.NOT_USER);
    }
  });
};

const authAdminMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    jwt.verify(token, "access_token", function (err, user) {
      if (err instanceof jwt.JsonWebTokenError) {
        return errorHandler(res, ERRORS.TOKEN_IS_EXPIRED);
      }
      if (err) {
        return errorHandler(res, ERRORS.AUTHENTICATION_FAILED);
      }
      const { payload } = user;
      if (payload.role === "admin") {
        next();
      } else {
        return errorHandler(res, ERRORS.NOT_ADMIN);
      }
    });
  } catch (error) {
    console.log(`error`, error);
  }
};
module.exports = {
  authAdminMiddleware,
  authUserMiddleware,
};
