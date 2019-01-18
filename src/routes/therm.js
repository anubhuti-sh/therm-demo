const express = require('express');
const populate = require('../controllers/populate');
const user = require('../controllers/user');
const { errorHandler } = require('../middlewares/errors');
const jwt = require('../middlewares/jwt');

const router = express.Router();

// Authentication
router.post('/login', user.login, jwt.sendToken);

// Verify token middleware
router.use(jwt.verifyToken);

// Data population
router.post('/populatedb', populate.insert);

router.use(errorHandler);

module.exports = router;
