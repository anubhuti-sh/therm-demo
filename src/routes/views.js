const express = require('express');
const { errorHandler } = require('../middlewares/errors');
const jwt = require('../middlewares/jwt');
const { isActive } = require('../middlewares/status');
const viewController = require('../controllers/views');
const getPermission = require('../middlewares/permission');

const router = express.Router();

// Verify token middleware
router.use(jwt.verifyToken);

// Check for active status
router.use(isActive);

// TODO: joi vlidations
router.get('/', getPermission.permit('owner', 'readUser', 'writeUser'), viewController.getViews);
router.post('/create', getPermission.permit('owner', 'writeUser'), viewController.createOrUpdate);
router.post('/update', viewController.createOrUpdate);
router.post('/projects', viewController.getUserProjectsView);
router.post('/:viewUID', viewController.getViewDetails);

router.use(errorHandler);

module.exports = router;
