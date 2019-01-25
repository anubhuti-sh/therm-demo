const express = require('express');
const { errorHandler } = require('../middlewares/errors');
const jwt = require('../middlewares/jwt');
const { isActive } = require('../middlewares/status');
const { getProjectFeatureView } = require('../controllers/features');
const getPermission = require('../middlewares/permission');

const router = express.Router();

// Verify token middleware
router.use(jwt.verifyToken);

// Check for active status
router.use(isActive);

router.get('/:projectUID', getPermission.permit(), getProjectFeatureView);

router.use(errorHandler);

module.exports = router;
