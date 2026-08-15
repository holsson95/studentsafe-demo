const express = require('express');
const router = express.Router();
const logController = require('../controllers/logsController');
const { authenticate } = require('../middleware/authMiddleware');

router.get('/cases', authenticate, logController.getCaseLogs);
router.get('/users', authenticate, logController.getUserLogs);

module.exports = router;