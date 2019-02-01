/* eslint-disable no-underscore-dangle */
/* eslint-disable no-continue */
/* eslint-disable no-restricted-syntax */
const config = require('config');
const View = require('../models/view');
const { getAllViews, parsedView } = require('./views/baseViewController');
const createOrUpdateView = require('./views/createUpdateViewController');
const { DatabaseError } = require('../utils/errors');

// getting views
const getViews = async (req, res) => {
  const views = await getAllViews(req.params, req.query);
  return res.status(200).json(await parsedView(views, req.query));
};

// creation and deletion of views
const createOrUpdate = async (req, res, next) => {
  let newView;
  const { uid } = req.body;

  // TODO: better checking with regex
  if (req.url === '/update' || req.url === '/update/') {
    try {
      newView = await View.findOne({ uid });
    } catch (err) {
      return next(new DatabaseError('error in query'));
    }

    if (!newView) {
      return res.status(404).json({
        msg: 'view not found',
      });
    }
  } else newView = new View();

  createOrUpdateView(req.body);

  if (req.url === '/update' || req.url === '/update/') {
    return res.status(201).json({
      message: 'View update successful',
    });
  }
  return res.status(201).json({
    msg: 'view created successfully',
  });
};

const getViewDetails = async (req, res) => {
  const view = await View.findOne({ uid: String(req.params.viewUID), active: true });
  if (!view) {
    res.status(404).json({
      msg: 'view not found',
    });
  }
  const parsedViews = await parsedView([view], req.query);
  return res.status(200).json({
    data: parsedViews[0],
  });
};

const getViewGroupsView = async (req, res, next) => {
  const { viewUID = false, projects = false } = req.query;
  let view = {};

  try {
    view = await View.findOne({ uid: viewUID, active: true });
  } catch (err) {
    return next(new DatabaseError('error in query'));
  }

  if (!view) {
    res.status(404).json({
      msg: 'view not found',
    });
  }

  const complete = req.query.complete || 'false';

  req.view = req.view.map(obj => [obj._id, obj.count]);

  const viewGroup = function (viewData = req.view) {
    return viewData.reduce((accumulator, value) => {
      // eslint-disable-next-line prefer-destructuring
      accumulator[value[0]] = value[1];
      return accumulator;
    }, {});
  };

  const finalGroups = [];
  let group; let project;

  // TODO: abstract these loop into different functions
  for (group of viewGroup) {
    if (!group.active === true) continue;
    const groupObj = {
      uid: group.uid,
      name: group.name,
      description: group.description,
    };

    if (projects) {
      const viewProjects = req.view;
      const finalProjects = [];

      for (project of viewProjects) {
        if (!project.active === true) continue;
        if (group && project.group.uid !== group.uid) continue;
        const projectObj = {
          uid: project.uid,
          name: project.name,
          description: project.description,
          date: project.date,
        };
        projectObj.date = project.date ? project.date.toDateString() : undefined;

        if (complete) {
          projectObj.orthoTiles = (project.data || {}).orthoTiles;
          projectObj.data = `${config.get('server.url')}/projects/${project.uid}/data`;
          projectObj.vectors = `${config.get('server.url')}/tables/view/${view.uid}/project/${project.uid}`;
          projectObj.report = (project.data || {}).report;
        }

        finalProjects.push(projectObj);
      }
      groupObj.projects = finalProjects;
    } else groupObj.projects = `${config.get('server.url')}/views/${view.uid}/groups/${group.uid}/projects`;

    finalGroups.push(groupObj);
  }

  return res.status(200).json({
    data: finalGroups,
  });
};

module.exports = {
  getViews,
  createOrUpdate,
  // getUserProjectsView,
  getViewDetails,
  getViewGroupsView,
};
