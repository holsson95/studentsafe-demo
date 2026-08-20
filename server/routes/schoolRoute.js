const express = require('express');
const router = express.Router();
const schoolController = require('../controllers/schoolController');
const { authenticate} = require('../middleware/authMiddleware');


router.get('/', authenticate, schoolController.getAllSchools);
router.get('/:id', authenticate, schoolController.fetchSchoolByID);
router.get('/:schoolId/buildings', authenticate, schoolController.getBuildingsBySchool);

module.exports = router;