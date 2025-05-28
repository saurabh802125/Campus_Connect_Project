const express = require('express');
const { getLibraries, bookSeat, leaveSeat, getUserBookings } = require('../controllers/libraryController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/', getLibraries);
router.post('/book', protect, bookSeat);
router.delete('/leave/:bookingId', protect, leaveSeat);
router.get('/bookings', protect, getUserBookings);

module.exports = router;