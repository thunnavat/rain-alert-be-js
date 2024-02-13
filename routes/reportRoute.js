const express = require('express')
const router = express.Router()
const reportController = require('../controllers/reportController')

router.get('/', reportController.getReports)
router.get('/time', reportController.getUniqueTimeFromReports)

module.exports = router
