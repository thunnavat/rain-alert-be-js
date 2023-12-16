const District = require('../models/district')

const addDistricts = async (req, res) => {
  try {
    const districtData = req.body
    const districts = districtData.map((data) => ({
      _id: data._id,
      districtName: data.districtName,
      coords: data.coords,
    }))
    const result = await District.insertMany(districts)
    res.status(201).json(result)
  } catch (error) {
    res.status(500).json({ message: error.message })
    throw error
  }
}

const getDistricts = async (req, res) => {
  try {
    const result = await District.find()
    res.status(200).json(result)
  } catch (error) {
    res.status(500).json({ message: error.message })
    throw error
  }
}

module.exports = { addDistricts, getDistricts }
