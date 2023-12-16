const express = require('express')
const router = express.Router()
const reportController = require('../controller/reportController')

router.get('/', reportController.getReports)
router.get('/time', reportController.getUniqueTimeReports)

module.exports = router
