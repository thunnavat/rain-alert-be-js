const express = require('express')
const router = express.Router()
const districtUserSubscribeController = require('../controllers/districtUserSubscribeController')

router.get('/:userId', districtUserSubscribeController.getDistrictSubscribeByUserId)
router.post('/', districtUserSubscribeController.addDistrictUserSubscribe)
router.put('/:userId', districtUserSubscribeController.updateDistrictUserSubscribe)

module.exports = router