const express = require('express');
const { errorHandler } = require('../middlewares/errors');
const therm = require('./therm');
const groups = require('./groups');
const projects = require('./projects');
const orgs = require('./organization');
const views = require('./views');
const features = require('./features');
const metrics = require('./metrics');

const router = express.Router();

router.use('/therm', therm);
router.use('/groups', groups);
router.use('/projects', projects);
router.use('/orgs', orgs);
router.use('/views', views);
router.use('/features', features);
router.use('/metrics', metrics);

router.use(errorHandler);

module.exports = router;
