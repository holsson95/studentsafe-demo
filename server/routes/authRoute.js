const express = require('express');
const router = express.Router();
const { rateLimit } = require('express-rate-limit');
const authController = require('../controllers/authTemp');

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many login attempts. Please try again in 15 minutes.' },
});

router.post('/login', loginLimiter, authController.login);
router.post('/google', authController.googleLogin);

module.exports = router;
