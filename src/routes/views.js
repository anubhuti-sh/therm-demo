const express = require('express');
const { errorHandler } = require('../middlewares/errors');
const jwt = require('../middlewares/jwt');
const { isActive } = require('../middlewares/status');
const viewController = require('../controllers/views');
const getPermission = require('../middlewares/permission');
const roleSetup = require('../middlewares/loadDb');

const router = express.Router();

// Verify token middleware
router.use(jwt.verifyToken);

// Check for active status
router.use(isActive);

// To set a role on user
router.use(roleSetup.loadView);

router.get('/', getPermission.permit('owner', 'readUser', 'writeUser'), viewController.getViews);

router.post('/create', getPermission.permit('owner', 'writeUser'), viewController.createOrUpdate);
router.put('/update', getPermission.permit('owner', 'writeUser'), viewController.createOrUpdate);

router.get('/:viewUID', getPermission.permit('owner', 'readUser'), viewController.getViewDetails);
router.get('/:viewUID/groups', getPermission.permit('owner', 'readUser'), viewController.getViewGroupsView);

router.get('/projects',
  getPermission.permit('owner', 'writeUser'),
  viewController.getUserProjectsView);

router.get('/:viewUID/groups/:groupUID/projects',
  getPermission.permit('owner', 'readUser'),
  viewController.getViewGroupProjectsView);

router.use(errorHandler);

module.exports = router;
