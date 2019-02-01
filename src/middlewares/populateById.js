const Project = require('../models/project');
const View = require('../models/view');
const { NotFoundError } = require('../utils/errors');


const validateProject = async (req, res, next) => {
  const project = await Project.findOne({ uid: String(req.params.projectUID), active: true });
  if (!project) {
    return next(new NotFoundError('project not found'));
  }
  req.project = project;
  return next();
};

const validateView = async (req, res, next) => {
  const view = await View.findOne({ uid: req.params.viewUID, active: true });
  if (!view) {
    return next(new NotFoundError('view not found'));
  }
  req.view = view;
  return next();
};

module.exports = {
  validateProject,
  validateView,
};
