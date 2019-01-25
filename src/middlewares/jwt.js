const jwt = require('jsonwebtoken');
const {
  AuthorizationError,
  OperationalError,
} = require('../utils/errors');

const sendToken = (req, res, next) => {
  jwt.sign({
    uid: req.body.uid,
    status: req.body.status,
    email: req.body.email,
    organization: req.body.organization,
    isOwner: req.body.isOwner,
    isManager: req.body.isManager,
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
