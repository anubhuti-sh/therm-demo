const constants = require('../utils/constants');
const { PermissionError } = require('../utils/errors');

const permit = (...allowed) => {
  const isAllowed = role => allowed.indexOf(role) > -1;

  return (req, res, next) => {
    if (req.user && isAllowed(req.user.role)) {
      next();
    } else {
      next(new PermissionError('not allowed'));
    }
  };
};

const checkRole = (req, res, next) => {
  if (constants.ALLOWED_ROLES.indexOf(req.decoded.role) !== -1) {
    return next();
  }
  return next(new PermissionError('You do not have permission'));
};

module.exports = {
  permit,
  checkRole,
};
