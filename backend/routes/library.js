const express = require('express');
const { 
  getLibraries, 
  bookSeat, 
  leaveSeat, 
  getUserBookings, 
  getLibraryStatus 
} = require('../controllers/libraryController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Get all libraries with their current seat status
router.get('/', getLibraries);

// Get specific library status with real-time data
router.get('/:libraryId/status', getLibraryStatus);

// Book a seat in a library
router.post('/book', protect, bookSeat);

// Leave a seat (release booking)
router.delete('/leave/:bookingId', protect, leaveSeat);

// Get user's current bookings
router.get('/bookings', protect, getUserBookings);

module.exports = router;