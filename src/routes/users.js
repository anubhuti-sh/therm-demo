const express = require('express');
const user = require('../controllers/users');
const validate = require('../controllers/validator');
const jwt = require('../middlewares/jwt');
const { errorHandler } = require('../middlewares/errors');

const router = express.Router();

router.post('/login', validate.login, user.login, jwt.sendToken);

// router.post('/addlc', jwt.verifyToken, user.addlc);

router.get('/allareas', jwt.verifyToken, user.getAreas);

router.get('/segments/:uid', jwt.verifyToken, user.getSegments);

router.use(errorHandler);

module.exports = router;
