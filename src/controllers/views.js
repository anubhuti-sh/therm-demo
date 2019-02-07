/* eslint-disable no-underscore-dangle */
/* eslint-disable no-continue */
/* eslint-disable no-restricted-syntax */
const View = require('../models/view');
const {
  getViews, parsedView, parseViewGroups, parseViewProjects,
} = require('./views/baseViewController');
const createOrUpdateView = require('./views/createUpdateViewController');
const { DatabaseError, PermissionError, NotFoundError } = require('../utils/errors');
const { getAllProjects } = require('./project');

// get all views
const getAllViews = async (req, res, next) => {
  let views;

  try {
    views = await getViews(req.decoded, req.params, req.query);
  } catch (err) {
    return next(new DatabaseError('erron in query'));
  }

  return res.status(200).json(await parsedView(views, req.query));
};

// get specific view
const getViewDetails = async (req, res, next) => {
  let view;

  try {
    view = await getViews(req.decoded, req.params, req.query);
  } catch (err) {
    return next(new DatabaseError('erron in query'));
  }

  if (!view.length) {
    return next(new NotFoundError('now view found'));
  }

  const parsedViews = await parsedView(view, req.query);

  return res.status(200).json({
    data: parsedViews[0],
  });
};

// get groups of a particular view
const getViewGroupsView = async (req, res, next) => {
  let view;

  try {
    view = await getViews(req.decoded, req.params, req.query);
  } catch (err) {
    return next(new DatabaseError('erron in query'));
  }

  if (!view.length) {
    return next(new NotFoundError('now view found'));
  }

  const parsedGroups = parseViewGroups(view[0], req.query);

  return res.status(200).json({
    data: parsedGroups,
  });
};

const getViewGroupProjectsView = async (req, res, next) => {
  let view; let group;

  try {
    view = await getViews(req.decoded, req.params, req.query);
  } catch (err) {
    return next(new DatabaseError('erron in query'));
  }

  if (!view.length) {
    return next(new NotFoundError('now view found'));
  }

  try {
    group = await group.findOne({ uid: req.params.groupUID });
  } catch (err) {
    return next(new DatabaseError('erron in query'));
  }

  if (!group.length) {
    return next(new NotFoundError('now group found'));
  }

  const parsedProjects = parseViewProjects(view, req.query, group);

  return res.status(200).json(parsedProjects);
};

// creation and deletion of views
const createOrUpdate = async (req, res, next) => {
  let newView;
  const { uid } = req.body;

  // TODO: better checking with regex
  if (req.url === '/update' || req.url === '/update/') {
    try {
      newView = await View.findOne({
        $add: [
          { uid },
          {
            $or: [
              { owner: { uid: req.user.uid } },
              { write: { $elemMatch: { uid: req.user.uid } } },
            ],
          },
        ],
      });
    } catch (err) {
      return next(new DatabaseError('error in query'));
    }

    if (!newView) {
      return next(new NotFoundError('no view found'));
    }
  } else newView = new View();

  if (!createOrUpdateView(req.user, req.body)) {
    return next(new PermissionError('Can not filter temperatures while giving full access to the view'));
  }

  if (req.url === '/update' || req.url === '/update/') {
    return res.status(201).json({
      message: 'View update successful',
    });
  }
  return res.status(201).json({
    msg: 'view created successfully',
  });
};

const getUserProjectsView = async (req, res) => {
  const userProjects = [];
  const userFinalProjects = [];
  let project = {};

  userProjects.push(...await getAllProjects(req.user));

  const userViews = await getAllViews();

  // eslint-disable-next-line array-callback-return
  let viewProjects = userViews.map((view) => {
    viewProjects = view.projects.filter((v, i, a) => a.indexOf(v) === i);
    viewProjects.filter(proj => proj.active);
  });

  userProjects.filter((v, i, a) => a.indexOf(v) === i);
  userProjects.uniqBy(prj => prj.uid);

  for (project of userProjects) {
    userFinalProjects.push({ uid: project.uid, name: project.name });
  }
  return res.status(200).json(userFinalProjects);
};

module.exports = {
  getAllViews,
  createOrUpdate,
  getUserProjectsView,
  getViewDetails,
  getViewGroupsView,
  getViewGroupProjectsView,
};
