const express = require('express')
const router = express.Router()
const districtUserSubscribeController = require('../controllers/districtUserSubscribeController')
const AuthenController = require('../controllers/authenController') 

router.get('/:userId', AuthenController.verifyToken, districtUserSubscribeController.getDistrictSubscribeByUserId)
router.post('/', AuthenController.verifyToken, districtUserSubscribeController.addDistrictUserSubscribe)
router.put('/:userId', AuthenController.verifyToken, districtUserSubscribeController.updateDistrictUserSubscribe)

module.exports = router