const Project = require('../models/project');
const {
  DatabaseError,
} = require('../utils/errors');

const getProj = async (req, res, next) => {
  try {
    const projects = await Project.find({ active: true }, {
      name: 1,
      uid: 1,
      date: 1,
      data: 1,
      _id: 0,
    });

    return res.status(200).json({
      data: projects,
    });
  } catch (err) {
    return next(new DatabaseError('Error fetching projects'));
  }
};

const deleteProj = async (req, res, next) => {
  const { slug } = req.params;
  try {
    const project = await Project.findOne({ uid: slug });

    project.active = false;

    project.save();

    return res.status(204).json({
      msg: 'Project deleted successfully',
    });
  } catch (err) {
    return next(new DatabaseError('Error in deleting entry from database'));
  }
};

const getAllProjects = async (user) => {
  const organizationFilter = [];

  if (user.organization) {
    organizationFilter.push({ 'organization.uid': user.organization });
  }

  const baseQuery = [{
    $match: {
      $and: [
        { active: true },
        ...organizationFilter,
      ],
    },
  }];

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
        group: {
          $ifNull: ['$group', {
            owner: {},
            active: true,
            read: [],
            write: [],
            labelsRead: [],
            labelsWrite: [],
          }],
        },
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
        organization: {
          $ifNull: ['$organization', {
            owner: {},
            active: true,
            read: [],
            write: [],
            labelsRead: [],
            labelsWrite: [],
          }],
        },
      },
    },
    {
      $match: { 'organization.active': true },
    },
  ];

  const combineUsersandLabels = [
    {
      $addFields: {
        read: {
          $setUnion: [
            { $ifNull: ['$read', []] },
            { $ifNull: ['$group.read', []] },
            { $ifNull: ['$organization.read', []] },
          ],
        },

        write: {
          $setUnion: [
            { $ifNull: ['$write', []] },
            { $ifNull: ['$group.write', []] },
            { $ifNull: ['$organization.write', []] },
          ],
        },
      },
    },
  ];

  const aggregatedProjects = await Project.aggregate([
    ...extractGroup,
    ...extractOrganization,
    ...baseQuery,
    ...combineUsersandLabels,
  ]);

  const projectUids = aggregatedProjects.map(aggrProject => aggrProject.uid);

  const proj = await Project.find({ uid: { $in: projectUids } });

  return proj;
};

module.exports = {
  getProj,
  deleteProj,
  getAllProjects,
};
