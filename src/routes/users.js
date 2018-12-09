const express = require('express');
const user = require('../controllers/users');
const validate = require('../controllers/validator');
const jwt = require('../middlewares/jwt');
const { errorHandler } = require('../middlewares/errors');

const router = express.Router();

router.get('/', user.hello);

router.post('/login', validate.login, user.login, jwt.sendToken);

router.get('/allareas', jwt.verifyToken, user.getAreas);

router.get('/segments/:uid', jwt.verifyToken, user.getSegments);

router.use(errorHandler);

module.exports = router;
