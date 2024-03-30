const express = require('express')
const router = express.Router()
const AuthenController = require('../controllers/authenController') 

router.post('/', AuthenController.login)
router.get('/profile', AuthenController.getProfile)
// router.put('/forgot-password', AuthenController.forgotPassword)
// router.put('/reset-password', AuthenController.resetPassword)


module.exports = router