const mongoose = require('mongoose')

const districtSchema = new mongoose.Schema(
  {
    _id: { type: Number, required: true, primary: true },
    districtName: { type: String, required: true, unique: true },
    coords: { type: Array, required: true },
  },
  { versionKey: false }
)

const District = mongoose.model('District', districtSchema)

module.exports = District // Export District model
