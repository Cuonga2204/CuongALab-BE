const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();
const generalAccessToken = async (payload) => {
  const access_token = jwt.sign(
    {
      payload,
    },
    process.env.ACCESS_TOKEN,
    { expiresIn: "365d" }
  );
  return access_token;
};

const generalRefreshToken = async (payload) => {
  const refresh_token = jwt.sign(
    {
      payload,
    },
    process.env.REFRESH_TOKEN,
    { expiresIn: "365d" }
  );
  return refresh_token;
};
const refreshTokenService = (token) => {
  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async (resolve, reject) => {
    try {
      jwt.verify(token, process.env.REFRESH_TOKEN, async (err, user) => {
        if (err) {
          resolve({
            status: "ERR",
            message: "The authentication refreshTokenService",
          });
        }
        const { payload } = user;

        const access_token = await generalAccessToken({
          id: payload.id,
          role: payload.role,
        });
        resolve({
          status: "OK",
          message: "SUCCESS REFRESH_TOKEN",
          access_token,
        });
      });
    } catch (error) {
      reject(error);
    }
  });
};
module.exports = {
  generalAccessToken,
  generalRefreshToken,
  refreshTokenService,
};
