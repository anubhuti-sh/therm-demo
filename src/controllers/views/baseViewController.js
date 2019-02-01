/* eslint-disable no-restricted-syntax */
const config = require('config');
const View = require('../../models/view');

// getting all views based on queryparams constraints
const getAllViews = async (params, query) => {
  const {
    q = '',
    pageLength = 10,
    pageNumber = 1,
    important = false,
  } = query;

  // Query for important
  const queryImportant = important ? [{ important: Boolean(important) }] : [];

  // contains query and important condition
  const baseQuery = [{
    $match: {
      $and: [
        { active: true },
        ...queryImportant,
        {
          $or: [
            { uid: { $regex: new RegExp(q) } },
            { name: { $regex: new RegExp(q), $options: '1' } },
            { description: { $regex: new RegExp(q), $options: '1' } },
            { 'owner.email': { $regex: new RegExp(q) } },
          ],
        },
      ],
    },
  }];

  // contains pagesize and pagelength condition
  const skipLimit = [
    { $skip: (pageLength * (pageNumber - 1)) },
    { $limit: pageLength },
  ];

  // contains extraction of rganization
  const extractOrganization = [
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

  // actual query
  let allViews = await View.aggregate([
    ...extractOrganization,
    ...baseQuery,
    ...skipLimit,
  ]);

  allViews = allViews.map(singleView => singleView.uid);

  // eslint-disable-next-line no-return-await
  return await View.find({ uid: { $in: allViews } }, { _id: 0 });
};

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
    // let viewGroups = view.projects.map(proj => proj.group);
    // viewGroups = viewGroups.filter(grp => grp.active);

    // const finalGroups = []; let group;

    // for (group of viewGroups) {
    //   const groupObj = {
    //     uid: group.uid,
    //     name: group.name,
    //     description: group.description,
    //   };
    //   if (project) {
    //     groupObj.projects = parseViewProjects(view, queryParams, groupObj);
    //   } else groupObj.projects = `${config.get('server.url')}/views/${view.uid}/groups/${group.uid}/projects`;
    //   finalGroups.push(groupObj);
    // }

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
      // ...((groups || project) && { groups: finalGroups }),
      ...(!(groups || project) && { groups: `${config.get('server.url')}/views/${view.uid}/groups` }),
      ...(metrics && { metrics: view.metrics }),
      ...(!metrics && { metrics: `${config.get('server.url')}/metrics/view/${view.uid}` }),
    };
    outputViewArray.push(baseViewObj);
  });
  return outputViewArray;
};

module.exports = {
  getAllViews,
  parsedView,
};
