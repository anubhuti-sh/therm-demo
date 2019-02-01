const express = require('express');
const { errorHandler } = require('../middlewares/errors');
const jwt = require('../middlewares/jwt');
const { isActive } = require('../middlewares/status');
const {
  getProjectIssueCountsView,
  metricBaseController,
  getProjectModuleCountsView,
  getProjectTemperaturesView,
  getViewIssueCountsView,
  getViewModuleCountsView,
  getViewIssueCountsByProjectView,
  getViewTemperaturesView,
  getViewMetricsView,
} = require('../controllers/metrics');
const getPermission = require('../middlewares/permission');
const roleSetup = require('../middlewares/loadDb');
const { validateProject, validateView } = require('../middlewares/populateById');

const router = express.Router();

// Verify token middleware
router.use(jwt.verifyToken);

// Check for active status
router.use(isActive);

// To set a role on user
router.use(roleSetup.loadView);

router.get('/project/:projectUID/counts/issues', validateProject, getPermission.checkRole, metricBaseController, getProjectIssueCountsView);
router.get('/project/:projectUID/counts/modules', validateProject, getPermission.checkRole, metricBaseController, getProjectModuleCountsView);
router.get('/project/:projectUID/issues/temperatures', validateProject, getPermission.checkRole, metricBaseController, getProjectTemperaturesView);

router.get('/view/:viewUID', validateView, getPermission.permit('owner', 'readUser'), metricBaseController, getViewMetricsView);
router.get('/view/:viewUID/counts/issues', validateView, getPermission.permit('owner', 'readUser'), metricBaseController, getViewIssueCountsView);
router.get('/view/:viewUID/counts/modules', validateView, getPermission.permit('owner', 'readUser'), metricBaseController, getViewModuleCountsView);
router.get('/view/:viewUID/counts/issues/project', validateView, getPermission.permit('owner', 'readUser'), metricBaseController, getViewIssueCountsByProjectView);
router.get('/view/:viewUID/issues/temperatures', validateView, getPermission.permit('owner', 'readUser'), metricBaseController, getViewTemperaturesView);

router.get('/view/:viewUID/project/:projectUID/counts/issues',
  validateView, getPermission.permit('owner', 'readUser'), validateProject, roleSetup.loadProject,
  getPermission.permit('owner', 'readUser'), metricBaseController, getProjectIssueCountsView);

router.get('/view/:viewUID/project/:projectUID/counts/modules',
  validateView, getPermission.permit('owner', 'readUser'), validateProject, roleSetup.loadProject,
  getPermission.permit('owner', 'readUser'), metricBaseController, getProjectModuleCountsView);

router.get('/view/:viewUID/project/:projectUID/issues/temperatures',
  validateView, getPermission.permit('owner', 'readUser'), validateProject, roleSetup.loadProject,
  getPermission.permit('owner', 'readUser'), metricBaseController, getProjectTemperaturesView);

router.use(errorHandler);

module.exports = router;
