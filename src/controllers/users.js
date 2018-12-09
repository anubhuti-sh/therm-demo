/* eslint-disable no-unused-expressions */
const bcrypt = require('bcryptjs');
const turfCalc = require('../utils/turfCalc');
const dataSort = require('../utils/dataSort');
const User = require('../models/users');
const Area = require('../models/area');
const {
  PermissionError,
  DatabaseError,
  NotFoundError,
} = require('../utils/errors');

// Login controller
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
    return next(new PermissionError('Wrong password'));
  }

  if (foundUser === null || !isMatch) {
    return next(new NotFoundError('Username or password do not match'));
  }
  return next();
};

// Area controller
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

// Segments controller
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

  switch (req.query.q) {
    case 'centerOfMass':
      segments = turfCalc.comCalc(segments);
      break;
    case 'centroid':
      segments = turfCalc.centroidCalc(segments);
      break;
    case 'area':
      segments = turfCalc.areaCalc(segments);
      break;
    default:
      segments;
  }

  if (req.query.q === 'area') {
    segments = dataSort.sortArea(segments, req.query.sort, req.query.q);
  } else {
    segments = dataSort.sortCoord(segments, req.query.sort, req.query.q);
  }

  if (!segments) {
    return next(new NotFoundError('No record found'));
  }
  return res.status(200).json({
    data: segments,
  });
};

module.exports = {
  login,
  getAreas,
  getSegments,
};
