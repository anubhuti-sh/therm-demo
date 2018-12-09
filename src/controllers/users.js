const bcrypt = require('bcryptjs');
const User = require('../models/users');
const {
  AuthorizationError,
  DatabaseError,
  NotFoundError,
} = require('../utils/errors');

const login = async (req, res, next) => {
  const { username, password } = req.body;
  let foundUser = null;
  let isMatch = null;
  try {
    foundUser = await User.findOne({ username });
  } catch (error) {
    return next(new DatabaseError('Error getting user info'));
  }

  try {
    isMatch = await bcrypt.compare(password, foundUser.password);
  } catch (error) {
    return next(new AuthorizationError('Username or password do not match'));
  }

  if (foundUser === null || !isMatch) {
    return next(new NotFoundError('Username or password do not match'));
  }
  return next();
};

module.exports = {
  login,
};
