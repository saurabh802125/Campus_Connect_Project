const express = require('express');
const { searchUsersBySkill, getAllUsers } = require('../controllers/skillController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/search', protect, searchUsersBySkill);
router.get('/users', protect, getAllUsers);
module.exports = router;
