const {
  AuthorizationError,
} = require('../utils/errors');

const isActive = (req, res, next) => {
  if (req.decoded && !req.decoded.status) {
    return next(new AuthorizationError('Inactive user'));
  }
  return next();
};

module.exports = {
  isActive,
};
