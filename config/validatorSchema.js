const Joi = require('joi');

const ValidateLogin = Joi.object().keys({
  username: Joi.string().alphanum().min(3).max(30),
  password: Joi.string().regex(/^[a-zA-Z0-9]{3,30}$/).required(),
}).with('username', 'password');

module.exports = {
  ValidateLogin,
};
