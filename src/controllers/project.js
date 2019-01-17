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

module.exports = {
  getProj,
  deleteProj,
};
