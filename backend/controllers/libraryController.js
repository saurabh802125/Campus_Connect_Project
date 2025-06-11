const Library = require('../models/Library');
const Booking = require('../models/Booking');

const getLibraries = async (req, res) => {
  try {
    const libraries = await Library.find();
    res.json(libraries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const bookSeat = async (req, res) => {
  try {
    const { libraryId, seatNumber } = req.body;
    
    const library = await Library.findById(libraryId);
    if (!library) {
      return res.status(404).json({ message: 'Library not found' });
    }

    const seat = library.seats.find(s => s.number === parseInt(seatNumber));
    if (!seat) {
      return res.status(404).json({ message: 'Seat not found' });
    }

    if (seat.isOccupied) {
      return res.status(400).json({ message: 'Seat already occupied' });
    }

    // Check if user already has a library booking
    const existingBooking = await Booking.findOne({
      user: req.user._id,
      type: 'library',
      status: 'active'
    });

    if (existingBooking) {
      return res.status(400).json({ message: 'You already have an active library booking' });
    }

    // Update seat with real-time data
    seat.isOccupied = true;
    seat.occupiedBy = req.user._id;
    seat.occupiedAt = new Date();
    
    await library.save();

    // Create booking record
    const booking = await Booking.create({
      user: req.user._id,
      type: 'library',
      library: libraryId,
      seatNumber: seatNumber.toString(),
      status: 'active'
    });

    // Emit real-time update to all connected clients
    const io = req.app.get('io');
    if (io) {
      io.emit('seat-update', {
        type: 'booked',
        libraryId: libraryId,
        seatNumber: parseInt(seatNumber),
        userId: req.user._id.toString(),
        userName: req.user.name,
        timestamp: new Date()
      });
    }

    res.json({ 
      message: 'Seat booked successfully', 
      booking,
      seatInfo: {
        libraryName: library.name,
        seatNumber: seatNumber,
        bookedAt: seat.occupiedAt
      }
    });
  } catch (error) {
    console.error('Booking error:', error);
    res.status(500).json({ message: error.message });
  }
};

const leaveSeat = async (req, res) => {
  try {
    const { bookingId } = req.params;
    
    const booking = await Booking.findOne({
      _id: bookingId,
      user: req.user._id,
      type: 'library',
      status: 'active'
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const library = await Library.findById(booking.library);
    const seat = library.seats.find(s => s.number === parseInt(booking.seatNumber));
    
    if (seat) {
      // Release the seat
      seat.isOccupied = false;
      seat.occupiedBy = null;
      seat.occupiedAt = null;
      await library.save();
    }

    // Update booking status
    booking.status = 'completed';
    booking.leftAt = new Date();
    await booking.save();

    // Emit real-time update to all connected clients
    const io = req.app.get('io');
    if (io) {
      io.emit('seat-update', {
        type: 'released',
        libraryId: booking.library.toString(),
        seatNumber: parseInt(booking.seatNumber),
        userId: req.user._id.toString(),
        userName: req.user.name,
        timestamp: new Date()
      });
    }

    res.json({ 
      message: 'Seat released successfully',
      seatInfo: {
        libraryName: library.name,
        seatNumber: booking.seatNumber,
        leftAt: booking.leftAt
      }
    });
  } catch (error) {
    console.error('Leave seat error:', error);
    res.status(500).json({ message: error.message });
  }
};

const getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({
      user: req.user._id,
      status: 'active'
    }).populate('library event');
    
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// New endpoint to get real-time library status
const getLibraryStatus = async (req, res) => {
  try {
    const { libraryId } = req.params;
    const library = await Library.findById(libraryId).populate('seats.occupiedBy', 'name studentId');
    
    if (!library) {
      return res.status(404).json({ message: 'Library not found' });
    }

    const availableSeats = library.seats.filter(seat => !seat.isOccupied).length;
    const occupancyRate = ((library.totalSeats - availableSeats) / library.totalSeats * 100);
    
    res.json({
      library: library,
      stats: {
        totalSeats: library.totalSeats,
        availableSeats,
        occupiedSeats: library.totalSeats - availableSeats,
        occupancyRate: occupancyRate.toFixed(1)
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getLibraries,
  bookSeat,
  leaveSeat,
  getUserBookings,
  getLibraryStatus
};