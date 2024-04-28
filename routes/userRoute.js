const express = require('express')
const router = express.Router()
const userController = require('../controllers/userController')
const AuthenController = require('../controllers/authenController')
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });


router.post('/register', upload.single("picture") , userController.register)
router.post('/refresh', userController.refreshToken)
router.put('/updateProfile', AuthenController.verifyToken ,upload.single("picture"), userController.updateProfile)
router.put('/changePassword', AuthenController.verifyToken, userController.changePassword)
router.post('/districtSubscribe', userController.getDistrictSubsribeByEmail)
router.post('/userMerge', userController.userMerge)
router.post('/checkEmail', userController.checkEmailExist)

module.exports = router





