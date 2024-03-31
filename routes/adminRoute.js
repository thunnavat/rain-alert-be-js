const expresss = require('express');
const router = expresss.Router();
const adminController = require('../controllers/adminController.js');
const AuthenController = require('../controllers/authenController.js');

router.put('/updateRainStatus',AuthenController.verifyToken, adminController.updateRainStatus);
router.get('/getBugReport', AuthenController.verifyToken, adminController.getBugReports);


module.exports = router;