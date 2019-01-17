const Group = require('../models/group');
const {
  DatabaseError,
} = require('../utils/errors');

const getGrp = async (req, res, next) => {
  try {
    const groups = await Group.find({ active: true }, {
      name: 1,
      uid: 1,
      description: 1,
      _id: 0,
    });

    return res.status(200).json({
      data: groups,
    });
  } catch (err) {
    return next(new DatabaseError('Error fetching Groups'));
  }
};

const deleteGrp = async (req, res, next) => {
  const { slug } = req.params;
  try {
    const group = await Group.findOne({ uid: slug });

    group.active = false;

    group.save();

    return res.status(204).json({
      msg: 'Group deleted successfully',
    });
  } catch (err) {
    return next(new DatabaseError('Error in deleting entry from database'));
  }
};

module.exports = {
  getGrp,
  deleteGrp,
};
