const express = require('express');
const { errorHandler } = require('../middlewares/errors');
const jwt = require('../middlewares/jwt');
const { isActive } = require('../middlewares/status');
const viewController = require('../controllers/views');
const getPermission = require('../middlewares/permission');
const roleSetup = require('../middlewares/loadDb');

const router = express.Router();

// To set a role on user
router.use([jwt.verifyToken, isActive, roleSetup.loadView]);

router.get('/', viewController.getAllViews);
router.get('/:viewUID', getPermission.permit('owner', 'writeUser', 'readUser'), viewController.getViewDetails);
router.get('/:viewUID/groups', getPermission.permit('owner', 'writeUser', 'readUser'), viewController.getViewGroupsView);
router.get('/:viewUID/groups/:groupUID/projects',
  getPermission.permit('owner', 'readUser', 'writeUser'),
  roleSetup.loadGroup,
  getPermission.permit('owner', 'readUser', 'writeUser'),
  viewController.getViewGroupProjectsView);

router.post('/create', viewController.createOrUpdate);
router.put('/update', viewController.createOrUpdate);

router.get('/projects',
  getPermission.permit('owner', 'writeUser'),
  viewController.getUserProjectsView);

router.use(errorHandler);

module.exports = router;
