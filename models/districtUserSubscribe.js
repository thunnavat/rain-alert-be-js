const mongoose = require('mongoose')

const districtUserSubscribeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    districtSubscribe: {
      type: [],
      required: true,
    },
  },
  { versionKey: false }
)

const DistrictUserSubscribe = mongoose.model('DistrictUserSubscribe', districtUserSubscribeSchema)

module.exports = DistrictUserSubscribe 
