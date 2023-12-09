const District = require('../models/district'); 

const addDistricts = async (districtData) => {
  try {
    const districts = districtData.map((data) => ({
      _id: data._id,
      districtName: data.districtName,
      coords: data.coords,
    }));
    const result = await District.insertMany(districts);
    return result;
  } catch (error) {
    console.error(error.message);
    throw error;
  }
};

const getDistricts = async () => {  // Get all districts
  try {
    const result = await District.find();
    return result;
  } catch (error) {
    console.error(error.message);
    throw error;
  }
}

module.exports = { addDistricts , getDistricts };