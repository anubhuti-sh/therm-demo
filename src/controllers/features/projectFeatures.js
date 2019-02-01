/* eslint-disable no-restricted-syntax */
const Table = require('../../models/table');
const Issue = require('../../models/issue');
const View = require('../../models/view');
const constants = require('../../utils/constants');

// getting a project feature
const getProjectFeatures = async (project, query = {}) => {
  const filterClassNames = query.class_names || [];
  const temperatureMinimum = query.temperature_min || -1e+6;
  const temperatureMaximum = query.temperature_max || 1e+6;


  const classNameFilter = filterClassNames.length ? [{ className: { $in: filterClassNames } }] : [];

  const temperatureFilter = [{ temperatureDifference: { $gte: temperatureMinimum } },
    { temperatureDifference: { $lte: temperatureMaximum } }];

  const tableObjs = await Table.find({ project });
  const issueObjs = await Issue.find({
    $and: [
      { project },
      ...classNameFilter,
      ...temperatureFilter,
    ],
  });

  return [...tableObjs, ...issueObjs];
};

// adding a new project feature
const addProjectFeatures = async (project, data) => {
  const features = data.features || [];
  const tableObjs = [];
  const issueObjs = [];

  // eslint-disable-next-line no-restricted-syntax
  for (const feature of features) {
    const featureObj = {};
    featureObj.uid = feature.properties.uid;
    featureObj.polygon = feature;
    featureObj.classId = feature.properties.class_id;
    featureObj.className = feature.properties.class_name;
    featureObj.project = project;
    featureObj.rawImages = feature.properties.raw_images || [];
    featureObj.temperatureDifference = feature.properties.temperature_difference;

    if (constants.TABLE_CLASSES.indexOf(featureObj.className)) {
      featureObj.numModulesHorizontal = feature.properties.num_modules_horizontal;
      featureObj.numModulesVertical = feature.properties.num_modules_vertical;
      tableObjs.push(featureObj);
    } else if (constants.ISSUE_CLASSES.indexOf(featureObj.className)) {
      featureObj.location = feature.properties.location;
      issueObjs.push(featureObj);
    }
  }

  await Table.remove({ project });
  await Table.insertMany(tableObjs);

  for (const issueObj of issueObjs) {
    console.log(issueObj.polygon.properties.parent_uid);
    // eslint-disable-next-line no-await-in-loop
    const issueTable = await Table.findOne({ uid: issueObj.polygon.properties.parent_uid });
    if (issueTable) issueObj.table = issueTable;
  }

  await Issue.remove({ project });
  await Issue.insertMany(issueObjs);

  const aggregatedViews = await View.aggregate([
    {
      $lookup: {
        from: 'projects',
        localField: 'projects',
        foreignField: '_id',
        as: 'projects',
      },
    },
    {
      $match: { projects: { $elemMatch: { uid: project.uid } } },
    },
  ]);

  const viewUids = aggregatedViews.map(aggrView => aggrView.uid);

  const views = await View.find({ uid: { $in: viewUids } });

  for (const view of views) view.save();
  return true;
};

module.exports = {
  getProjectFeatures,
  addProjectFeatures,
};
