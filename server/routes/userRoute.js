const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { route } = require('./authRoute');
const { authenticate, authorizeAdmin} = require('../middleware/authMiddleware');

router.post('/', authenticate, authorizeAdmin, userController.createUser);
router.get('/', authenticate, authorizeAdmin, userController.getAllUsers);
router.get('/me', authenticate, userController.getLoggedUser);
router.delete('/:id', authenticate, authorizeAdmin, userController.deleteUser);
router.get('/:id', authenticate, authorizeAdmin, userController.getUserById);
router.patch('/:id', authenticate, authorizeAdmin, userController.updateUser);

module.exports = router;