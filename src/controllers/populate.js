/* eslint-disable no-underscore-dangle */
/* eslint-disable no-restricted-syntax */
const Orgs = require('../models/org');
const Groups = require('../models/group');
const Projects = require('../models/project');
const {
  DatabaseError,
  ValidationError,
} = require('../utils/errors');

const insert = async (req, res, next) => {
  const data = req.body;
  if (!data) {
    return next(new ValidationError('Enter valid data'));
  }

  // populates organization db
  let newEntry;
  const { uid, name, active } = data.organization;
  try {
    newEntry = await Orgs.findOneAndUpdate({
      uid,
    },
    {
      $set: {
        uid,
        name,
        active,
      },
    },
    {
      upsert: true,
      new: true,
    });
  } catch (err) {
    return next(new DatabaseError('Error in adding organizations'));
  }

  let groupObj; let projObj; let grp; let proj;

  // populates group collection
  for (grp of data.groups) {
    groupObj = {
      uid: grp.uid,
      ...(grp.name && { name: grp.name }),
      ...(grp.description && { description: grp.description }),
      ...(grp.active && { active: grp.active }),
      ...(grp.owner && { owner: grp.owner }),
      ...(grp.readUser && { readUser: grp.readUser }),
      ...(grp.writeUser && { writeUser: grp.writeUser }),
      ...(newEntry._id && { organization: newEntry._id }),
    };

    try {
      // eslint-disable-next-line no-await-in-loop
      await Groups.updateOne({ uid: grp.uid }, { $set: groupObj }, { upsert: true });
    } catch (err) {
      return next(new DatabaseError(`Error in adding groups with uid ${grp.uid}`));
    }

    // populates project collection
    for (proj of grp.projects) {
      projObj = {
        uid: proj.uid,
        ...(proj.name && { name: proj.name }),
        ...(proj.date && { date: proj.date }),
        ...(proj.owner && { owner: proj.owner }),
        ...(proj.active && { active: proj.active }),
        ...(proj.readUser && { readUser: proj.readUser }),
        ...(proj.writeUser && { writeUser: proj.writeUser }),
        ...(proj.data && { data: proj.data }),
        ...(newEntry._id && { group: newEntry._id }),
      };

      try {
        // eslint-disable-next-line no-await-in-loop
        await Projects.updateOne({ uid: proj.uid }, { $set: projObj }, { upsert: true });
      } catch (err) {
        return next(new DatabaseError(`Error in adding project with uid ${proj.uid}`));
      }
    }
  }

  // return response
  return res.status(200).json({
    msg: 'projects, groups, and organizations populated',
  });
};

module.exports = {
  insert,
};
