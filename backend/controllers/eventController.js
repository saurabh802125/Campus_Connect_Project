const Event = require('../models/Event');
const Booking = require('../models/Booking');

const getEvents = async (req, res) => {
  try {
    const events = await Event.find({ date: { $gte: new Date() } });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const bookEventSeat = async (req, res) => {
  try {
    const { eventId, seatId } = req.body;
    
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const seat = event.seats.id(seatId);
    if (!seat) {
      return res.status(404).json({ message: 'Seat not found' });
    }

    if (seat.isOccupied) {
      return res.status(400).json({ message: 'Seat already booked' });
    }

    // Update seat
    seat.isOccupied = true;
    seat.occupiedBy = req.user._id;
    
    await event.save();

    // Create booking
    const booking = await Booking.create({
      user: req.user._id,
      type: 'event',
      event: eventId,
      seatNumber: `${seat.row}${seat.number}`,
      price: seat.price,
      status: 'active'
    });

    res.json({ message: 'Ticket booked successfully', booking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getEvents,
  bookEventSeat
};
