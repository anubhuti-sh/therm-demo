/* eslint-disable no-undef */
/* eslint-disable no-underscore-dangle */
const Issue = require('../models/issue');
const Table = require('../models/table');
const { DatabaseError } = require('../utils/errors');

const metricBaseController = (req, res, next) => {
  let projectUids = [];
  let queryParams = {};

  if (req.view) {
    projectUids = res.view.projects.map(proj => proj.uid);

    queryParams = {
      classNames: res.view.issueTypes || [],
      temperatureMin: (res.view.temperatures || {}).min || null,
      temperatureMax: (res.view.temperatures || {}).max || null,
    };
  }

  const filterClassNames = queryParams.classNames || [];
  const temperatureMinimum = queryParams.temperatureMin || -1e+6;
  const temperatureMaximum = queryParams.temperatureMax || 1e+6;

  const classNameFilter = filterClassNames.length ? [{ className: { $in: filterClassNames } }] : [];

  const temperatureFilter = [{ temperatureDifference: { $gte: temperatureMinimum } },
    { temperatureDifference: { $lte: temperatureMaximum } }];

  req.baseMetricQuery = [
    {
      $lookup: {
        from: 'projects',
        localField: 'project',
        foreignField: '_id',
        as: 'project',
      },
    },
    {
      $lookup: {
        from: 'groups',
        localField: 'project.group',
        foreignField: '_id',
        as: 'group',
      },
    },
    {
      $match: {
        $and: [
          { 'project.uid': { $in: projectUids } },
          { 'project.active': true },
          { 'group.active': true },
          ...classNameFilter,
          ...temperatureFilter,
        ],
      },

    },
  ];

  next();
};

const getProjectIssueCountsView = async (req, res, next) => {
  try {
    const metrics = await Issue.aggregate([
      ...req.baseMetricQuery,
      {
        $group: { _id: '$className', count: { $sum: 1 } },
      },
    ]);

    return res.status(200).json({
      data: metrics,
    });
  } catch (err) {
    return next(new DatabaseError('error in query'));
  }
};

const getProjectModuleCountsView = async (req, res, next) => {
  try {
    const moduleCount = await Table.aggregate([
      ...req.baseMetricQuery,
      {
        $group: { _id: null, modules: { $sum: { $multiply: ['$numModulesHorizontal', '$numModulesVertical'] } } },
      },
    ]);
    return res.status(200).json({
      data: moduleCount,
    });
  } catch (err) {
    return next(new DatabaseError('error in query'));
  }
};

const getProjectTemperaturesView = async (req, res, next) => {
  try {
    let temperatures = await Issue.aggregate([
      ...req.baseMetricQuery,
      {
        $project: { temperatureDifference: 1, _id: 0 },
      },
    ]);
    temperatures = temperatures.map(temp => temp.temperatureDifference);

    return res.status(200).json({
      data: temperatures,
    });
  } catch (err) {
    return next(new DatabaseError('error in query'));
  }
};

const getViewIssueCountsView = async (req, res, next) => {
  try {
    let issueCounts = await Issue.aggregate([
      ...req.baseMetricQuery,
      {
        $group: { _id: '$class_name', count: { $sum: 1 } },
      },
    ]);

    // eslint-disable-next-line no-underscore-dangle
    issueCounts = issueCounts.map(obj => [obj._id, obj.count]);

    // eslint-disable-next-line func-names
    const metrics = function (iss = issueCounts) {
      return iss.reduce((accumulator, value) => {
        // eslint-disable-next-line prefer-destructuring
        accumulator[value[0]] = value[1];
        return accumulator;
      }, {});
    };

    return res.status(200).json({
      data: metrics,
    });
  } catch (err) {
    return next(new DatabaseError('error in query'));
  }
};

const getViewModuleCountsView = async (req, res, next) => {
  try {
    const metrics = await Table.aggregate([
      ...req.baseMetricQuery,
      {
        $group: { _id: null, modules: { $sum: { $multiply: ['$numModulesHorizontal', '$numModulesVertical'] } } },
      },
    ]);
    return res.status(200).json({
      data: metrics,
    });
  } catch (err) {
    return next(new DatabaseError('error in query'));
  }
};

const getViewIssueCountsByProjectView = async (req, res, next) => {
  try {
    const metrics = await Issue.aggregate([
      ...req.baseMetricQuery,
      {
        $group: { _id: { class_name: '$className', project: '$project' }, count: { $sum: 1 } },
      },
      {
        $group: { _id: '$_id.project', issues: { $push: { type: '$_id.className', count: '$count' } } },
      },
      {
        $project: {
          _id: 0,
          uid: '$_id.uid',
          name: '$_id.name',
          issues: 1,
        },
      },
      {
        $unwind: '$uid',
      },
      {
        $unwind: '$name',
      },
    ]);
    return res.status(200).json({
      data: metrics,
    });
  } catch (err) {
    return next(new DatabaseError('error in query'));
  }
};

const getViewTemperaturesView = async (req, res, next) => {
  try {
    let temperatures = await Issue.aggregate([
      ...req.baseMetricQuery,
      {
        $project: { temperature_difference: 1, _id: 0 },
      },
    ]);

    temperatures = temperatures.map(t => t.temperatureDifference);

    return res.status(200).json({
      data: temperatures,
    });
  } catch (err) {
    return next(new DatabaseError('error in query'));
  }
};

const getViewMetricsView = async (req, res, next) => {
  if (req.query.update || 'false') { req.view.save(); }

  const metrics = {};
  let temperatures = {}; let moduleCounts = {}; let issueCounts = {};

  metrics.modules = {};
  metrics.temperatureDifference = {};

  try {
    issueCounts = await Issue.aggregate([
      ...req.baseMetricQuery,
      {
        $group: { _id: '$className', count: { $sum: 1 } },
      },
    ]);
  } catch (err) {
    return next(new DatabaseError('error in query'));
  }

  try {
    moduleCounts = await Table.aggregate([
      ...req.baseMetricQuery,
      {
        $group: { _id: null, modules: { $sum: { $multiply: ['$numModulesHorizontal', '$numModulesVertical'] } } },
      },
    ]);
  } catch (err) {
    return next(new DatabaseError('error in query'));
  }

  try {
    temperatures = await Issue.aggregate([
      ...req.baseMetricQuery,
      {
        $group: {
          _id: 0,
          mean: { $avg: '$temperature_difference' },
          min: { $min: '$temperature_difference' },
          max: { $max: '$temperature_difference' },
          std: { $stdDevPop: '$temperature_difference' },
        },
      },
      {
        $project: { _id: 0 },
      },
    ]);
  } catch (err) {
    return next(new DatabaseError('error in query'));
  }

  issueCounts = issueCounts.map(obj => [obj._id, obj.count]);

  metrics.issues = function (iss = issueCounts) {
    return iss.reduce((accumulator, value) => {
      // eslint-disable-next-line prefer-destructuring
      accumulator[value[0]] = value[1];
      return accumulator;
    }, {});
  };

  metrics.modules.total = moduleCounts.length ? moduleCounts[0].modules : undefined;

  metrics.modules.affected = _.sum(_.values(metrics.issues));
  // eslint-disable-next-line prefer-destructuring
  metrics.temperaturedifference = temperatures[0];

  return res.json({
    data: metrics,
  });
};

module.exports = {
  metricBaseController,
  getProjectIssueCountsView,
  getProjectModuleCountsView,
  getProjectTemperaturesView,
  getViewIssueCountsView,
  getViewModuleCountsView,
  getViewIssueCountsByProjectView,
  getViewTemperaturesView,
  getViewMetricsView,
};
