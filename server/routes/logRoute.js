const express = require('express');
const router = express.Router();
const logController = require('../controllers/logsController');
const { authenticate, authorizeAdmin } = require('../middleware/authMiddleware');

router.get('/cases', authenticate, authorizeAdmin, logController.getCaseLogs);
router.get('/users', authenticate, authorizeAdmin, logController.getUserLogs);

module.exports = router;