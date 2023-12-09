const mongoose = require('mongoose')

const reportSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  reportTime: { type: Date, required: true },
  reportDistrict: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'District',
    required: true,
  },
  rainStatus: {
    type: String,
    enum: ['no rain', 'light rain', 'moderate rain', 'heavy rain'],
    required: true,
  },
})

//   // Add indexes for efficient querying
// reportSchema.index({ reportTime: 1 }) // Index for querying by reportTime
// reportSchema.index({ reportDistrict: 1 }) // Index for querying by reportDistrict

const Report = mongoose.model('Report', reportSchema)

module.exports = Report 