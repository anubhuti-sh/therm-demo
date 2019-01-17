const express = require('express');
const orgs = require('../controllers/orgs');
const group = require('../controllers/group');
const project = require('../controllers/project');
const populate = require('../controllers/populate');
const user = require('../controllers/user');
const { errorHandler } = require('../middlewares/errors');
const jwt = require('../middlewares/jwt');
const roleSetup = require('../middlewares/loadDb');
const getPermission = require('../middlewares/permission');

const router = express.Router();

// Authentication
router.post('/login', user.login, jwt.sendToken);

// Verify token middleware
router.use(jwt.verifyToken);

// Data population
router.post('/populatedb', populate.insert);

// CRUD for organizations
router.get('/orgs', orgs.getOrgs);
router.post('/addorg', orgs.addOrg);
router.put('/editorg/:slug', orgs.editOrg);
router.put('/deleteorg/:slug', orgs.deleteOrg);

// load roles
router.use(roleSetup.loadDb('group'));

// CRUD for groups
router.get('/group', getPermission.permit('owner', 'readUser'), group.getGrp);
router.put('/deletegrp/:slug', getPermission.permit('owner', 'writeUser'), group.deleteGrp);

// load roles
router.use(roleSetup.loadDb('project'));

// // CRUD for projects
router.get('/projects', getPermission.permit('owner', 'readUser'), project.getProj);
router.put('/deleteprj/:slug', getPermission.permit('owner', 'writeUser'), project.deleteProj);

router.use(errorHandler);

module.exports = router;
