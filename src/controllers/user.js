const bcrypt = require('bcryptjs');
const User = require('../models/users');
const {
  PermissionError,
  DatabaseError,
  NotFoundError,
} = require('../utils/errors');

// Login controller
const login = async (req, res, next) => {
  const { uid, password } = req.body;
  let foundUser = null;
  let isMatch = null;
  try {
    foundUser = await User.findOne({ uid });
  } catch (error) {
    return next(new DatabaseError('Error getting user info'));
  }

  try {
    isMatch = await bcrypt.compare(password, foundUser.password);
  } catch (error) {
    return next(new PermissionError('Wrong password'));
  }

  if (foundUser === null || !isMatch) {
    return next(new NotFoundError('Username or password do not match'));
  }
  return next();
};

module.exports = {
  login,
};
