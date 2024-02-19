const express = require('express')
const router = express.Router()
const userController = require('../controllers/userController')

router.post('/register', userController.register)
// router.get('/verify/:userId/:token', userController.verifyEmail);
router.post('/refresh', userController.refreshToken)

module.exports = router
