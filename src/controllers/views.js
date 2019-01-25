const View = require('../models/view');
const { getAllViews, parsedView } = require('./views/baseViewController');
// const { issueClasses } = require('../../constants');

// getting views
const getViews = async (req, res) => {
  const views = await getAllViews(req.params, req.query);
  return res.status(200).json(await parsedView(views, req.query));
};

// creation and deletion of views
const createOrUpdate = async (req, res) => {
  let newView;
  const { uid } = req.body;

  // TODO: better checking with regex
  if (req.url === '/update' || req.url === '/update/') {
    newView = await View.findOne({ uid });

    if (!newView) {
      res.status(404).json({
        msg: 'view not found',
      });
    }

    if (newView) {
      // TODO: check permission
    }
  } else newView = new View();

  if (req.url === '/update' || req.url === '/update/') {
    return res.status(201).json({
      message: 'View update successful',
    });
  }
  return res.status(201).json({
    msg: 'view created successfully',
  });
};

// get users projects view
const getUserProjectsView = async (req, res) => {

};

module.exports = {
  getViews,
  createOrUpdate,
  getUserProjectsView,
};
