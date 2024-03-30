const mongoose = require('mongoose');

const bugReportSchema = new mongoose.Schema({
  note: {
    type: String,
    required: true,
  },
  userReport: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', 
    required: true,
  },
  picture: {
    type: String,
    required: false,
  }
});

const BugReport = mongoose.model('BugReport', bugReportSchema);

module.exports = BugReport;