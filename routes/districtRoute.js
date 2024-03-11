const express = require('express')
const router = express.Router()
const districtController = require('../controllers/districtController') //

router.get('/', districtController.getDistricts)
router.post('/', districtController.addDistricts)

module.exports = router
