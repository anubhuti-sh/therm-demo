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

  // populates group db
  const groupArr = [];
  const groupIds = [];
  const allGroups = await Groups.find({}, { uid: 1, _id: 0 });

  allGroups.forEach((g) => {
    groupIds.push(g.uid);
  });

  data.groups.forEach((gp) => {
    // current grooup not found in db groupId array
    if (!(groupIds.indexOf(gp.uid.toString()) + 1)) {
      groupArr.push({
        uid: gp.uid,
        name: gp.name,
        description: gp.description,
        active: gp.active,
        owner: gp.owner,
        readUser: gp.readUser,
        writeUser: gp.writeUser,
        // eslint-disable-next-line no-underscore-dangle
        organization: newEntry._id,
      });
    }
  });

  try {
    await Groups.insertMany(groupArr);
  } catch (err) {
    return next(new DatabaseError('Error in adding groups'));
  }

  // populates project db
  const projArr = [];
  const projIds = [];
  const allProj = await Projects.find({}, { uid: 1, _id: 0 });

  allProj.forEach((p) => {
    projIds.push(p.uid);
  });

  data.groups.forEach((grp) => {
    grp.projects.forEach((proj) => {
      if (!(projIds.indexOf(proj.uid.toString()) + 1)) {
        projArr.push({
          uid: proj.uid,
          name: proj.name,
          date: proj.date,
          owner: proj.owner,
          active: proj.active,
          readUser: proj.readUser,
          writeUser: proj.writeUser,
          data: proj.data,
          // eslint-disable-next-line no-underscore-dangle
          group: newEntry._id,
        });
      }
    });
  });

  try {
    await Projects.insertMany(projArr);
  } catch (err) {
    return next(new DatabaseError('Error in adding projects'));
  }

  // return response
  return res.status(200).json({
    msg: 'projects, groups, and organizations populated',
  });
};

module.exports = {
  insert,
};
