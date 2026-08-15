const express = require('express');
const router = express.Router();
const notificationsController = require('../controllers/notificationsController');
const { authenticate} = require('../middleware/authMiddleware');

router.post('/', notificationsController.notifyCaseSubmitted);
router.get('/', authenticate, notificationsController.getUserNotif);
router.delete('/:id', authenticate, notificationsController.deleteNotif);
router.delete('/delete-all-read', authenticate, notificationsController.deleteAllReadNotif);
router.patch('/mark-all-read', authenticate, notificationsController.markAllAsRead);
router.patch('/:id', authenticate, notificationsController.markAsRead);
router.get('/:id', authenticate,notificationsController.getNotifById);
module.exports = router;