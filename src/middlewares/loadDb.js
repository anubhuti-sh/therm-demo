const Project = require('../models/project');
const Group = require('../models/group');

function loadDb(level) {
  // eslint-disable-next-line func-names
  return async function (req, res, next) {
    const { uid } = req.decoded;

    const qdb = (level === 'project') ? Project : Group;

    const owner = await qdb.findOne({ 'owner.uid': uid });
    if (owner) {
      req.user = { role: 'owner', uid };
    }

    const readUser = await qdb.find({ readUser: { $elemMatch: { uid } } });
    if (readUser.length) {
      req.user = { role: 'readUser', uid };
    }

    const writeUser = await qdb.find({ writeUser: { $elemMatch: { uid } } });
    if (writeUser.length) {
      req.user = { role: 'writeUser', uid };
    }

    next();
  };
}

module.exports = {
  loadDb,
};
