const { shallowEqual } = require(".");
const { ERRORS } = require("../errors/index");
const errorCodeDefine = [];
for (const key in ERRORS) {
  errorCodeDefine.push(ERRORS[key].code);
}
module.exports.errorHandler = (res, error, data = null) => {
  let _error;
  _error = Object.values(ERRORS).find((x) => shallowEqual(x, error));
  if (!_error) {
    _error = error;
  }

  if (errorCodeDefine.includes(_error.code)) {
    return res.status(_error.status).json({
      success: _error.success,
      data: data || _error.data,
      message: _error.message,
      code: _error.code,
    });
  }
  return res.status(ERRORS.UNKNOWN_ERROR.status).json({
    success: ERRORS.UNKNOWN_ERROR.success,
    data: _error?.message || _error,
    message: ERRORS.UNKNOWN_ERROR.message,
    code: ERRORS.UNKNOWN_ERROR.code,
  });
};
module.exports.successHandler = (
  res,
  data = null,
  status = 200,
  message = "success"
) => {
  let payload = {
    success: true,
    data: data,
    message,
    code: 1000,
  };
  return res.status(status).json(payload);
};
