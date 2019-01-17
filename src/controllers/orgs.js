const Org = require('../models/org');
const {
  DatabaseError,
} = require('../utils/errors');

const getOrgs = async (req, res, next) => {
  try {
    const orgs = await Org.find({ active: true }, { name: 1, uid: 1, active: 1 });
    return res.status(200).json({
      data: orgs,
    });
  } catch (err) {
    return next(new DatabaseError('Error fetching organizations'));
  }
};

const addOrg = async (req, res, next) => {
  const { uid, name, active } = req.body;
  try {
    await Org.create({
      uid,
      name,
      active,
    });

    return res.status(201).json({
      msg: `${name} added to organization`,
    });
  } catch (err) {
    return next(new DatabaseError('Error adding entry to database'));
  }
};

// eslint-disable-next-line consistent-return
const editOrg = async (req, res, next) => {
  const { slug } = req.params;
  try {
    const org = await Org.findOne({ uid: slug });
    Object.keys(req.body).forEach((k) => {
      org[k] = req.body[k];
    });
    await org.save((err) => {
      if (!err) {
        return res.status(204).json({
          msg: 'successfully updated organization',
        });
      }
      return next(new DatabaseError('Error in modifying entry'));
    });
  } catch (err) {
    return next(new DatabaseError('Error in getting entry from database'));
  }
};

const deleteOrg = async (req, res, next) => {
  const { slug } = req.params;
  try {
    await Org.findByIdAndUpdate({ uid: slug }, { active: false });

    return res.status(204).json({
      msg: 'Organization deleted successfully',
    });
  } catch (err) {
    return next(new DatabaseError('Error in deleting entry from database'));
  }
};

module.exports = {
  getOrgs,
  addOrg,
  editOrg,
  deleteOrg,
};
