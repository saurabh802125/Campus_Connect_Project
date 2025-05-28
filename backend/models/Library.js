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
  seats: [seatSchema]
}, {
  timestamps: true
});

module.exports = mongoose.model('Library', librarySchema);
