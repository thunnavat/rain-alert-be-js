const mongoose = require('mongoose')

const rainreportSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  reportTime: { type: Date, required: true },
  reportDistrict: {
    type: Number,
    ref: 'District',
    required: true,
  },
  rainStatus: {
    type: String,
    enum: ['NO RAIN', 'LIGHT RAIN', 'MODERATE RAIN', 'HEAVY RAIN'],
    required: true,
  },
})

  // // Add indexes for efficient querying
  // RainReportSchema.index({ reportTime: 1 }) // Index for querying by reportTime
  // RainReportSchema.index({ reportDistrict: 1 }) // Index for querying by reportDistrict

 const RainReport = mongoose.model('RainReport', rainreportSchema)

  module.exports = RainReport // Export RainReport model