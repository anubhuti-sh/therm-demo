const Org = require('../../models/org');
const Project = require('../../models/project');
const Users = require('../../models/users');
const { ISSUE_CLASSES } = require('../../../constants');
const getPermission = require('../../middlewares/permission');

const createOrUpdateView = async (user, data) => {
  let newView;
  const {
    name, owner, issueType, projects, read, write, temperatures,
  } = data;

  const organization = (data.organization)
    ? await Org.findOne({ uid: data.organization }) : {};

  const projectArray = [];
  let proj;

  // eslint-disable-next-line no-restricted-syntax
  for (const pUid of projects) {
    // eslint-disable-next-line no-await-in-loop
    proj = await Project.findOne({
      $add: [
        { uid: pUid },
        {
          $or: [
            { owner: { uid: user.uid } },
            { write: { $elemMatch: { uid: user.uid } } },
          ],
        },
      ],
    });

    if (proj) {
      projectArray.push(proj);
    }
  }

  newView.projects = projectArray;

  const readUsersArray = [];
  // eslint-disable-next-line no-restricted-syntax
  for (proj of projects) {
    getPermission.permit('writeUser');
  }

  // eslint-disable-next-line no-restricted-syntax
  for (const { email } of read) {
    // eslint-disable-next-line no-await-in-loop
    const readUser = await Users.findOne({ email, status: 'ACTIVE' });

    if (readUser) {
      readUsersArray.push({
        uid: readUser.uid,
        email: readUser.email,
      });
    }
  }

  const writeUsersArray = [];
  // eslint-disable-next-line no-restricted-syntax
  for (proj of projects) {
    getPermission.permit('writeUser');
  }

  // eslint-disable-next-line no-restricted-syntax
  for (const { email } of write) {
    // eslint-disable-next-line no-await-in-loop
    const writeUser = await Users.findOne({ email, status: 'ACTIVE' });

    if (writeUser) {
      writeUsersArray.push({
        uid: writeUser.uid,
        email: writeUser.email,
      });
    }
  }

  if (newView.read.filter(value => newView.write.indexOf(value) !== -1)) return 0;
  if (newView.write.filter(item => (item.email !== newView.owner.email && item.uid !== newView.owner.uid)).length < newView.write) return 0;

  if (newView.issueTypes.length) {
    const filteredMatched = ISSUE_CLASSES.filter(item => item !== newView.issueTypes);
    if (filteredMatched.length < newView.issueTypes) {
      return 0;
    }
  }

  newView.temperatures.min = data.temperatureMin
    ? parseFloat(data.temperatureMin) : newView.temperatures.min;
  newView.temperatures.max = data.temperatureMax
    ? parseFloat(data.temperatureMax) : newView.temperatures.max;

  if (newView.temperatures.min || newView.temperatures.max) {
    const filteredWrite = newView.write.filter(item => (item.email !== newView.owner.email && item.uid !== newView.owner.uid));
    if (filteredWrite.length < newView.write) {
      return 0;
    }
  }

  // eslint-disable-next-line prefer-const
  newView = {
    temperature: {},
    ...(name && { name }),
    ...(owner && { owner }),
    ...(issueType && { issueType }),
    ...(projects && { projects }),
    ...(read && { read }),
    ...(write && { write }),
    important: true,
    organization,
    ...(projects && { projectArray }),
    ...(read && { readUsersArray }),
    ...(write && { writeUsersArray }),
    temperatures: {
      ...(temperatures.min && { min: data.temperatureMin }),
      ...(temperatures.max && { max: data.temperatureMax }),
    },
  };

  return newView.save();
};

module.exports = {
  createOrUpdateView,
};
