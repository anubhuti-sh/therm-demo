const express = require('express');
const orgs = require('../controllers/orgs');
const jwt = require('../middlewares/jwt');
const { errorHandler } = require('../middlewares/errors');

const router = express.Router();

// Verify token middleware
router.use(jwt.verifyToken);

// CRUD for organizations
router.get('/', orgs.getOrgs);
router.post('/addorg', orgs.addOrg);
router.put('/editorg/:slug', orgs.editOrg);
router.put('/deleteorg/:slug', orgs.deleteOrg);

router.use(errorHandler);

module.exports = router;
