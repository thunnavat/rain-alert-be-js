const express = require('express')
const router = express.Router()
const reportController = require('../controllers/reportController')

router.get('/', reportController.getReports)
router.get('/time', reportController.getUniqueTimeFromReports)
router.get('/reports', reportController.getReportsBySpecificTime)

module.exports = router
