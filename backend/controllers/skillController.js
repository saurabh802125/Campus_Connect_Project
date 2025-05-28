const User = require('../models/User');

const searchUsersBySkill = async (req, res) => {
  try {
    const { skill } = req.query;
    
    if (!skill) {
      return res.status(400).json({ message: 'Skill parameter is required' });
    }

    const users = await User.find({
      skills: { $regex: skill, $options: 'i' },
      _id: { $ne: req.user._id } // Exclude current user
    }).select('-password');

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({
      _id: { $ne: req.user._id }
    }).select('-password');
    
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  searchUsersBySkill,
  getAllUsers
};

