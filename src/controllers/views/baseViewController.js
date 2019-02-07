/* eslint-disable no-unused-vars */
/* eslint-disable no-fallthrough */
/* eslint-disable no-restricted-syntax */
const config = require('config');
const View = require('../../models/view');

// getting all views based on queryparams constraints
const getViews = async (user, param, query) => {
  const {
    q = '',
    pageLength = 10,
    pageNumber = 1,
    important = false,
  } = query;

  // logged in users organization filter
  const organizationFilter = user.organization ? [{ 'organization.uid': user.organization }] : [];

  // important view filter
  const queryImportantFilter = important ? [{ important: Boolean(important) }] : [];

  // view filter by view uid
  const viewIdFilter = param ? [{ uid: param.viewUID }] : {};

  // pagination
  const pagination = (pageLength && pageNumber) ? [
    { $skip: (pageLength * (pageNumber - 1)) },
    { $limit: pageLength },
  ] : {};

  // populate organization
  const poplateOrganization = [
    {
      $lookup: {
        from: 'organizations',
        localField: 'organization',
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
            active: true,
            owner: {},
            read: [],
            write: [],
          }],
        },
      },
    },
    {
      $match: { 'organization.active': true },
    },
  ];

  // base query
  const baseQuery = [{
    $match: {
      $and: [
        { active: true },
        ...viewIdFilter,
        // ...organizationFilter,
        ...queryImportantFilter,
        {
          $or: [
            { uid: { $regex: new RegExp(q) } },
            { name: { $regex: new RegExp(q), $options: '1' } },
            { description: { $regex: new RegExp(q), $options: '1' } },
            { 'owner.email': { $regex: new RegExp(q) } },
          ],
        },
        {
          $or: [
            { owner: { uid: user.uid } },
            { read: { $elemMatch: { uid: user.uid } } },
            { write: { $elemMatch: { uid: user.uid } } },
          ],
        },
      ],
    },
  }];

  // main query outputs array of view uid
  let allViews = await View.aggregate([
    // ...poplateOrganization,
    ...baseQuery,
    {
      $project: {
        _id: 0,
        uid: 1,
      },
    },
    ...pagination,
  ]);

  allViews = allViews.map(oneView => oneView.uid);

  // eslint-disable-next-line no-return-await
  return await View.find({ uid: { $in: allViews } }, { _id: 0 });
};

function parseViewProjects(view, query, group = null) {
  const {
    complete = 'false',
  } = query;

  const viewProjects = view.projects.filter(proj => proj.active);
  const finalProjects = []; let project = {}; const projectObj = {};

  for (project of viewProjects) {
    projectObj.date = project.date ? project.date.toDateString() : undefined;

    if (complete) {
      projectObj.orthoTiles = (project.data || {}).orthoTiles;
      projectObj.data = `${config.get('server.url')}/projects/${project.uid}/data`;
      projectObj.vectors = `${config.get('server.url')}/tables/view/${view.uid}/project/${project.uid}`;
      projectObj.report = (project.data || {}).report;
    }

    finalProjects.push(projectObj);
  }

  return finalProjects;
}

function parseViewGroups(view, query) {
  const projects = query.projects ? query.projects : 'false';

  const viewGroups = view.projects.map(proj => proj.group);
  viewGroups.filter(grp => grp.active);

  const finalGroups = [];
  let group = {}; const groupObj = {};

  for (group of viewGroups) {
    if (projects) {
      groupObj.projects = parseViewProjects(view, query);
    } else groupObj.projects = `${config.get('server.url')}/views/${view.uid}/groups/${group.uid}/projects`;
    finalGroups.push(groupObj);
  }

  return finalGroups;
}

// filtering view based of active status
const parsedView = (views, query) => {
  const {
    project = null,
    groups = null,
    metrics = null,
    complete = null,
  } = query;

  const outputViewArray = [];

  views.forEach((view) => {
    const baseViewObj = {
      uid: view.uid,
      name: view.name,
      description: view.description,
      ...(complete && { users: {} }),
      ...(complete && { owner: view.owner }),
      ...(complete && { readOnly: view.read }),
      ...(complete && { readWrite: view.write }),
      ...(complete && { issueTypes: view.issueTypes }),
      ...(complete && { temperatureMin: view.temperatures ? view.temperatures.min : {} }),
      ...(complete && { temperatureMax: view.temperatures ? view.temperatures.max : {} }),
      ...(complete && {
        organization: {
          uid: view.organization ? view.organization.uid : null,
          name: view.organization ? view.organization.name : null,
        },
      }),
      ...((groups || project) && { groups: parseViewGroups(view, query) }),
      ...(!(groups || project) && { groups: `${config.get('server.url')}/views/${view.uid}/groups` }),
      ...(metrics && { metrics: view.metrics }),
      ...(!metrics && { metrics: `${config.get('server.url')}/metrics/view/${view.uid}` }),
    };
    outputViewArray.push(baseViewObj);
  });
  return outputViewArray;
};

module.exports = {
  getViews,
  parsedView,
  parseViewProjects,
  parseViewGroups,
};
