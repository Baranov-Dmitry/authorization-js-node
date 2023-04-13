const ApiError = require("../exeptions/api-error");
const tokenService = require("../service/token-service");

module.exports = function (req, res, next) {
  try {
    const authorizationHader = req.headers.authorization;

    if (!authorizationHader) {
      throw ApiError.UnautarizationError();
    }

    const accessToken = authorizationHader.split(" ")[1];

    if (!accessToken) {
      throw ApiError.UnautarizationError();
    }

    const userData = tokenService.validateAccessToken(accessToken);

    if (!userData) {
      throw ApiError.UnautarizationError();
    }

    req.user = userData;
    next();
  } catch (error) {
    return next(ApiError.UnautarizationError());
  }
};
