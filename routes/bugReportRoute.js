const express = require('express');
const router = express.Router();
const bugReportController = require('../controllers/bugReportController.js');
const AuthenController = require('../controllers/authenController') 
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });


router.post('/', AuthenController.verifyToken, upload.single("picture"), bugReportController.createBugReport);

module.exports = router;