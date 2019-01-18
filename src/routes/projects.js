const express = require('express');
const project = require('../controllers/project');
const roleSetup = require('../middlewares/loadDb');
const getPermission = require('../middlewares/permission');
const jwt = require('../middlewares/jwt');
const { errorHandler } = require('../middlewares/errors');

const router = express.Router();

// Verify token middleware
router.use(jwt.verifyToken);

// load roles
router.use(roleSetup.loadProject);

// RD for projects
router.get('/', getPermission.permit('owner', 'readUser'), project.getProj);
router.put('/deleteprj/:slug', getPermission.permit('owner', 'writeUser'), project.deleteProj);

router.use(errorHandler);

module.exports = router;
