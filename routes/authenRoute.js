const express = require('express')
const router = express.Router()
const AuthenController = require('../controllers/authenController') 

router.post('/', AuthenController.login)
router.get('/profile', AuthenController.getProfile)
router.post('/forgot-password', AuthenController.forgotPassword)
router.put('/reset-password', AuthenController.resetPassword)
router.post('/request-email-verification', AuthenController.requestEmailVerification)
// router.post('/verify-email', AuthenController.verifyEmail)


module.exports = router