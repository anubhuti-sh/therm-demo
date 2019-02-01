const Org = require('../../models/org');
const Project = require('../../models/project');
const Users = require('../../models/users');
// const { issueClasses } = require('../../constants');

const createOrUpdateView = async (data) => {
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
    proj = await Project.findOne({ uid: pUid });

    if (proj) {
      projectArray.push(proj);
    }
    // TODO: check permission
  }

  const readUsersArray = [];
  // TODO: check permission

  // eslint-disable-next-line no-restricted-syntax
  for (const { email } of read) {
    // eslint-disable-next-line no-await-in-loop
    const user = await Users.findOne({ email, status: 'ACTIVE' });

    if (user) {
      readUsersArray.push({
        uid: user.uid,
        email: user.email,
      });
    }
  }

  const writeUsersArray = [];
  // TODO: check permission

  // eslint-disable-next-line no-restricted-syntax
  for (const { email } of write) {
    // eslint-disable-next-line no-await-in-loop
    const user = await Users.findOne({ email, status: 'ACTIVE' });

    if (user) {
      writeUsersArray.push({
        uid: user.uid,
        email: user.email,
      });
    }
  }
  // TODO: check for duplicate entry in readUserArray and writeUserArray
  // TODO: intersection for issue types
  // TODO: temerature intersection

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
