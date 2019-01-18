const express = require('express');
const { errorHandler } = require('../middlewares/errors');
const jwt = require('../middlewares/jwt');
const roleSetup = require('../middlewares/loadDb');
const getPermission = require('../middlewares/permission');
const group = require('../controllers/group');

const router = express.Router();

// Verify token middleware
router.use(jwt.verifyToken);

// load roles
router.use(roleSetup.loadGroup);

// RD for groups
router.get('/', getPermission.permit('owner', 'readUser'), group.getGrp);
router.put('/deletegrp/:slug', getPermission.permit('owner', 'writeUser'), group.deleteGrp);

router.use(errorHandler);

module.exports = router;
