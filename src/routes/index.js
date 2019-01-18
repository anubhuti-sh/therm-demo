const express = require('express');
const { errorHandler } = require('../middlewares/errors');
const therm = require('./therm');
const groups = require('./groups');
const projects = require('./projects');
const orgs = require('./organization');

const router = express.Router();

router.use('/therm', therm);
router.use('/groups', groups);
router.use('/projects', projects);
router.use('/orgs', orgs);

router.use(errorHandler);

module.exports = router;


// TODO partial update
// Permission flow top-> bottom (org -> proj)
