const express = require('express')
const router = express.Router()
const AuthenController = require('../controllers/AuthenController') //

router.post('/', AuthenController.login)

module.exports = router