const express = require('express')
const router = express.Router()
const userController = require('../controllers/userController')
const AuthenController = require('../controllers/authenController')
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });


router.post('/register', upload.single("picture") , userController.register)
// router.get('/verify/:userId/:token', userController.verifyEmail);
router.post('/refresh', userController.refreshToken)
router.put('/updateProfile', AuthenController.verifyToken ,upload.single("picture"), userController.updateProfile)

module.exports = router





// const upload = require('../utils/firebaseUtils').upload;


// router.post('/register', upload.single("picture") , userController.register)
// // router.get('/verify/:userId/:token', userController.verifyEmail);
// // router.post('/register', upload.single("picture"), userController.register);
// router.post('/refresh', userController.refreshToken)

// module.exports = router