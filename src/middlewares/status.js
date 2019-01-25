const {
  AuthorizationError,
} = require('../utils/errors');

const isActive = (req, res, next) => {
  if (req.user && !req.user.isActive) {
    return new AuthorizationError('Inactive user');
  }
  return next();
};

module.exports = {
  isActive,
};
