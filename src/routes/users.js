const express = require('express');
const user = require('../controllers/users');
const validate = require('../controllers/validator');
const jwt = require('../middlewares/jwt');
const { errorHandler } = require('../middlewares/errors');

const router = express.Router();

router.post('/login', validate.login, user.login, jwt.sendToken);

router.use(errorHandler);

module.exports = router;
