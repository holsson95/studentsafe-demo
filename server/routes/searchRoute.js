const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController');
const { authenticate } = require('../middleware/authMiddleware');
const { route } = require('./schoolRoute');

router.get('/', authenticate, searchController.searchQuery);

module.exports = router;