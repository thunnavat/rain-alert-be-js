const express = require('express')
const router = express.Router()
const userController = require('../controllers/userController')

router.post('/register', userController.register)
//router.post('/register/line', userController.login)
router.post('/login', userController.login)
router.post('/refresh', userController.refreshToken)

module.exports = router
