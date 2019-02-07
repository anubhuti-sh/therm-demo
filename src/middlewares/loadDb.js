const Project = require('../models/project');
const Group = require('../models/group');
const View = require('../models/view');

// Role setup for group level privilage
const loadGroup = async (req, res, next) => {
  const { uid } = req.decoded;

  const owner = await Group.findOne({ uid: req.params.groupUID, 'owner.uid': uid });
  if (owner) {
    req.user = { role: 'owner', uid };
  }

  const readUser = await Group.find({ readUser: { $elemMatch: { uid } } });
  if (readUser.length) {
    req.user = { role: 'readUser', uid };
  }

  const writeUser = await Group.find({ writeUser: { $elemMatch: { uid } } });
  if (writeUser.length) {
    req.user = { role: 'writeUser', uid };
  }

  next();
};

// Role setup for project level privilage
const loadProject = async (req, res, next) => {
  const { uid } = req.decoded;
  let grpOwnPrvlg; let grpRdPrvlg; let grpWrtPrvlg;

  // Owner
  const owner = await Project.findOne({ 'owner.uid': uid });
  grpWrtPrvlg = await Group.find({ writeUser: { $elemMatch: { uid } } });
  grpOwnPrvlg = await Group.findOne({ 'owner.uid': uid });
  if (owner && (grpWrtPrvlg.length || grpOwnPrvlg)) {
    req.user = { role: 'owner', uid };
  }

  // Read
  const readUser = await Project.find({ readUser: { $elemMatch: { uid } } });
  // eslint-disable-next-line prefer-const
  grpRdPrvlg = await Group.find({ readUser: { $elemMatch: { uid } } });
  if (readUser.length && grpRdPrvlg) {
    req.user = { role: 'readUser', uid };
  }

  // Write
  const writeUser = await Project.find({ writeUser: { $elemMatch: { uid } } });
  grpWrtPrvlg = await Group.find({ writeUser: { $elemMatch: { uid } } });
  grpOwnPrvlg = await Group.findOne({ 'owner.uid': uid });
  if (writeUser.length && (grpWrtPrvlg.length || grpOwnPrvlg)) {
    req.user = { role: 'writeUser', uid };
  }

  next();
};

const loadView = async (req, res, next) => {
  const { uid } = req.decoded;

  const owner = await View.findOne({
    $and: [
      { uid: req.params.viewUID },
      { 'owner.uid': uid },
    ],
  });
  if (owner) {
    req.user = { role: 'owner', uid };
  }

  const readUser = await View.findOne({
    uid: req.params.viewUID,
    readUser: { $elemMatch: { uid } },
  });
  if (readUser && readUser.length) {
    req.user = { role: 'readUser', uid };
  }

  const writeUser = await View.findOne({
    uid: req.params.viewUID,
    writeUser: { $elemMatch: { uid } },
  });
  if (writeUser && writeUser.length) {
    req.user = { role: 'writeUser', uid };
  }

  next();
};

module.exports = {
  loadGroup,
  loadProject,
  loadView,
};
