const mongoose = require('mongoose');

const seatSchema = new mongoose.Schema({
  number: {
    type: Number,
    required: true
  },
  isOccupied: {
    type: Boolean,
    default: false
  },
  occupiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  occupiedAt: {
    type: Date,
    default: null
  }
});

const librarySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  floor: {
    type: String,
    required: true
  },
  totalSeats: {
    type: Number,
    required: true
  },
  // Enhanced layout configuration for PVR-style display
  layout: {
    rows: {
      type: Number,
      default: 8
    },
    seatsPerRow: {
      type: Number,
      default: 15
    }
  },
  // Library features and amenities
  features: [{
    type: String,
    enum: ['Wi-Fi', 'Silent Zone', 'AC', 'Study Pods', 'Group Study', 'Printing', 'Research Area', 'Computers', 'Whiteboard', 'Projector']
  }],
  seats: [seatSchema]
}, {
  timestamps: true
});

module.exports = mongoose.model('Library', librarySchema);