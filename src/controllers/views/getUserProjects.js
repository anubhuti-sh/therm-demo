const Project = require('../../models/project');

const getUserProjects = async (user) => {
  const organizationFilter = (user.organization) ? [{ 'organization.uid': user.organization }] : [];

  const baseQuery = [{
    $match: {
      $and: [
        { active: true },
        ...organizationFilter,
      ],
    },
  }];

  const dummyResource = {
    owner: {},
    active: true,
    read: [],
    write: [],
    labelsRead: [],
    labelsWrite: [],
  };

  const extractGroup = [
    {
      $lookup: {
        from: 'groups',
        localField: 'group',
        foreignField: '_id',
        as: 'group',
      },
    },
    {
      $unwind: {
        path: '$group',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $addFields: {
        group: { $ifNull: ['$group', dummyResource] },
      },
    },
    {
      $match: { 'group.active': true },
    },
  ];

  const extractOrganization = [
    {
      $lookup: {
        from: 'organizations',
        localField: 'group.organization',
        foreignField: '_id',
        as: 'organization',
      },
    },
    {
      $unwind: {
        path: '$organization',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $addFields: {
        organization: { $ifNull: ['$organization', dummyResource] },
      },
    },
    {
      $match: { 'organization.active': true },
    },
  ];

  const aggregatedProjects = await Project.aggregate([
    ...extractGroup,
    ...extractOrganization,
    ...baseQuery,
  ]);

  const projectUids = [];
  // eslint-disable-next-line array-callback-return
  aggregatedProjects.map((aggrProject) => {
    projectUids.push(aggrProject.uid);
  });

  await Project.find({ uid: { $in: projectUids } });
};

module.exports = {
  getUserProjects,
};
