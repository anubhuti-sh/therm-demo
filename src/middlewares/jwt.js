const jwt = require('jsonwebtoken');
const {
  AuthorizationError,
  OperationalError,
} = require('../utils/errors');

const sendToken = (req, res, next) => {
  jwt.sign({
    uid: req.local.uid,
    status: req.local.status,
    email: req.local.email,
    organization: req.local.organization,
    isOwner: req.local.isOwner,
    isManager: req.local.isManager,
    role: req.local.role,
  }, process.env.SECRET, { expiresIn: '3000s' }, (err, token) => {
    if (err) {
      return next(new OperationalError('Could not generate Token'));
    }
    return res.status(200).json({ token });
  });
};

// eslint-disable-next-line consistent-return
const verifyToken = (req, res, next) => {
  let token = null;
  const bearerHeader = req.headers.authorization;
  // check if bearer is undefined
  if (typeof bearerHeader !== 'undefined') {
    // Split at space
    const bearer = bearerHeader.split(' ');
    // get token from array
    const bearerToken = bearer[1];
    // set the token
    token = bearerToken;
  } else {
    return next(new AuthorizationError('Did not receive token'));
  }

  jwt.verify(token, process.env.SECRET, (err, decoded) => {
    if (err) {
      return next(new AuthorizationError('Token Invalid. Forbidden!'));
    }
    req.decoded = decoded;
    return next();
  });
};


module.exports = {
  sendToken,
  verifyToken,
};
