const express = require('express');
const { getEvents, bookEventSeat } = require('../controllers/eventController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/', getEvents);
router.post('/book', protect, bookEventSeat);
module.exports = router;
