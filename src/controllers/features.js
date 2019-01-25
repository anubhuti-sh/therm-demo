const Project = require('../models/project');
const { getProjectFeatures } = require('./features/getProjectFeatures');

const getProjectFeatureView = async (req, res) => {
  const { projectUID } = req.params;

  const project = await Project.findOne({
    uid: projectUID,
    active: true,
  });

  const projectFeatures = await getProjectFeatures(project, req.params);

  res.status(200).json({
    data: projectFeatures,
  });
};

module.exports = {
  getProjectFeatureView,
};
