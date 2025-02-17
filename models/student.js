const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  _id: {
    type: Number,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String
  },
  phone: {
    type: String
  },
  total: {
    type: Number,
    default: 0
  },
  consecutiveCount: {
    type: Number,
    default: 0
  },
  streakOfFour: {
    type: Number,
    default: 0
  },
  dates: {
    type: [String],
    default: []
  },
  lastPaidDate: {
    type: String
  },
  selectedClass: {
    type: String
  }
});

module.exports = mongoose.model('Student', studentSchema);
