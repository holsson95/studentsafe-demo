const express = require('express');
const router = express.Router();
const inviteController = require('../controllers/inviteController');
const { authenticate, authorizeAdmin } = require('../middleware/authMiddleware');

router.post('/bulk-import', authenticate, authorizeAdmin, inviteController.bulkImport);
router.post('/send-invites', authenticate, authorizeAdmin, inviteController.sendInvites);

module.exports = router;
