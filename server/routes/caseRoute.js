const express = require('express');
const router = express.Router();
const caseController = require('../controllers/caseController');
const logController = require('../controllers/logsController');
const { authenticate } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');



router.post('/', authenticate, upload.array('media', 10), caseController.createCase);
router.get('/', authenticate, caseController.getCases);router.get('/case-types', authenticate, caseController.getAllCaseTypes);
router.get('/categories', authenticate, caseController.getCategories);
router.get('/counts', authenticate, caseController.fetchCaseCountsBySchool);
router.get('/case-counts', authenticate, caseController.fetchCaseStatsWithTimeSeries);
router.get('/counts-by-building', authenticate, caseController.fetchCaseCountsByBuilding);
router.get('/counts-by-gender', authenticate, caseController.fetchCaseCountsByGender);
router.get('/counts-by-status', authenticate, caseController.fetchCaseCountsByStatus);
router.get('/counts-by-severity', authenticate, caseController.fetchCaseCountsBySeverity);
router.get('/top-categories', authenticate, caseController.fetchTopCategories);
router.get('/top-sub-categories', authenticate, caseController.fetchTopSubcategories);
router.get('/reporters', authenticate, caseController.fetchReportersByCaseType);
router.get('/:id/status-history', authenticate, caseController.getStatusHistory);
router.get('/:id', authenticate, caseController.getCasesById);
router.get('/student/:studentId', authenticate, caseController.getCasesByStudentId);
router.post('/share', authenticate, caseController.shareCase);
router.delete('/:id', authenticate, caseController.deleteCase);
router.patch('/:id', authenticate, caseController.updateStatus);

module.exports = router;