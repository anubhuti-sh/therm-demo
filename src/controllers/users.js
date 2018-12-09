const bcrypt = require('bcryptjs');
const User = require('../models/users');
const Area = require('../models/area');
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

const getAreas = async (req, res, next) => {
  let areas = null;
  try {
    areas = await Area.aggregate([
      {
        $group: {
          _id: {
            uid: '$uid',
            name: '$name',
          },
        },
      },
    ]);
  } catch (error) {
    return next(new DatabaseError('Error getting areas'));
  }

  if (!areas) {
    return next(new NotFoundError('No record found'));
  }
  return res.status(200).json({
    data: areas,
  });
};

const getSegments = async (req, res, next) => {
  const { uid } = req.params;
  let segments = null;
  try {
    segments = await Area.aggregate([
      {
        $match: {
          uid,
        },
      },
    ]);
  } catch (error) {
    return next(new DatabaseError('Error getting segments'));
  }

  if (!segments) {
    return next(new NotFoundError('No record found'));
  }
  return res.status(200).json({
    data: segments,
  });
};

// const addlc = async (req, res, next) => {
//     try {
//         await Area.create({
//             name: req.body.name,
//             uid: req.body.uid,
//             geometry: req.body.geometry,
//         });
//         return res.status(200).json({
//             msg: 'created',
//         });
//     } catch (error) {
//         console.log(error);
//         return next(new NotFoundError('error in creating doc'));
//     }
// };

module.exports = {
  login,
  getAreas,
  getSegments,
//   addlc,
};
