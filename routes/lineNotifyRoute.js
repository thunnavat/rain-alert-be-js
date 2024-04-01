const express = require('express')
const router = express.Router()
const lineNotifyController = require('../controllers/lineNotifyController')

router.get('/', lineNotifyController.getCode)

module.exports = router