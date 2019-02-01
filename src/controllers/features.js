const { gzip } = require('node-gzip');
const Project = require('../models/project');
const { getProjectFeatures, addProjectFeatures } = require('./features/projectFeatures');
const { NotFoundError, DatabaseError } = require('../utils/errors');

// getting features
const getProjectFeatureView = async (req, res, next) => {
  const { projectUID } = req.params;

  const project = await Project.findOne({
    uid: projectUID,
    active: true,
  });

  if (!project) {
    next(new NotFoundError('project not found'));
  }

  const projectFeatures = await getProjectFeatures(project, req.params);
  projectFeatures.map(obj => obj.polygon);

  const geoJson = { type: 'FeatureCollection', features: projectFeatures };
  const compressedGeojson = await gzip(JSON.stringify(geoJson));
  res.setHeader('Content-Encoding', 'gzip');
  return res.send(compressedGeojson);
};

// adding a new feature
const addProjectFeaturesView = async (req, res, next) => {
  const { projectUID } = req.params;

  const project = await Project.findOne({
    uid: projectUID,
    active: true,
  });

  if (!project) {
    next(new NotFoundError('project not found'));
  }

  const ret = await addProjectFeatures(project, req.body);
  if (!ret) return next(new DatabaseError('error adding features in db'));
  return res.status(201).json({
    msg: 'Successfully added tables to the project',
  });
};

module.exports = {
  getProjectFeatureView,
  addProjectFeaturesView,
};
