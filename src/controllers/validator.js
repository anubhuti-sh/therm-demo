const {
  ValidateLogin,
} = require('../../config/validatorSchema');

const {
  ValidationError,
} = require('../utils/errors');

const login = (req, res, next) => {
  const { error, value } = ValidateLogin.validate(req.body);
  if (error) {
    return next(new ValidationError('Inputs do not meet criteria'));
  }
  req.parsed = value;
  return next();
};

module.exports = {
  login,
};
