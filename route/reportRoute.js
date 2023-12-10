const express = require('express') // Import express
const router = express.Router() // Create a new router
const reportController = require('../controller/reportController') // Import reportController

router.get('/', async (req, res) => {
  try {
    const reports = await reportController.getReports()
    res.status(200).json(reports)
  } catch (error) {
    console.error(error.message)
    res.status(500).json({ message: error.message })
  }
})

router.get('/unique', async (req, res) => {
  try {
    const reports = await reportController.getUniqueReports()
    res.status(200).json(reports)
  } catch (error) {
    console.error(error.message)
    res.status(500).json({ message: error.message })
  }
})

module.exports = router
