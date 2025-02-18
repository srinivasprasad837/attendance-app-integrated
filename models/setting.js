const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
  dropdownOptions: {
    type: [String], // Array of strings
    default: [],
  },
});

const Setting = mongoose.model('Setting', settingSchema);

module.exports = Setting;
