const mongoose = require('mongoose')

const districtUserSubscribeSchema = new mongoose.Schema(
  {
    _id: mongoose.Schema.Types.ObjectId,
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    districtSubscribe: {
      type: [String],
      required: true,
    },
  },
  { versionKey: false }
)

const DistrictUserSubscribe = mongoose.model('DistrictUserSubscribe', districtUserSubscribeSchema)

module.exports = DistrictUserSubscribe 
