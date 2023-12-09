const express = require('express')
const router = express.Router()
const districtController = require('../controller/districtController'); //

//routes

router.get('/', async (req, res) => { // Get all districts
  try {
    const result = await districtController.getDistricts();
    res.status(200).json(result);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const result = await districtController.addDistricts(req.body);
    res.status(201).json(result);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router
