const express = require('express');
const { errorHandler } = require('../middlewares/errors');
const jwt = require('../middlewares/jwt');
const { isActive } = require('../middlewares/status');
const { getProjectFeatureView, addProjectFeaturesView } = require('../controllers/features');
const getPermission = require('../middlewares/permission');
const roleSetup = require('../middlewares/loadDb');

const router = express.Router();

// Verify token middleware
router.use(jwt.verifyToken);

// Check for active status
router.use(isActive);

router.get('/project/:projectUID', getPermission.checkRole, getProjectFeatureView);
router.post('/project/:projectUID', getPermission.checkRole, addProjectFeaturesView);
router.get('/view/:viewUID/project/:projectUID',
  roleSetup.loadView,
  getPermission.permit('owner', 'readUser'),
  roleSetup.loadProject,
  getPermission.permit('owner', 'readUser'),
  getProjectFeatureView);

router.use(errorHandler);

module.exports = router;
