const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const sessionNotesController = require('../controllers/sessionNotesController');
const treatmentPlanController = require('../controllers/treatmentPlanController');
const { authenticate} = require('../middleware/authMiddleware');


// router.post('/', studentController.createStudent);

// Alma student search for case filing dropdown (authenticated, rate-limited server-side)
// Must be declared before /:id so Express doesn't treat "search" as an ID param
router.get('/search', authenticate, studentController.searchAlmaStudents);

router.get('/session-notes/roles', authenticate, sessionNotesController.getAllRoles);
router.get('/:studentId/session-notes', authenticate, sessionNotesController.getAllSessionNotesById);
router.get('/session-notes/:noteId', authenticate, sessionNotesController.getSessionNoteById);
router.post('/:studentId/session-notes', authenticate, sessionNotesController.createSessionNote);
router.get('/:studentId/treatment-plan', authenticate, treatmentPlanController.getAllTreatmentPlanById);
router.get('/treatment-plans/:planId', authenticate, treatmentPlanController.getTreatmentPlanById);
router.post('/:studentId/treatment-plan', authenticate, treatmentPlanController.createTreatmentPlan);
router.delete('/treatment-plan/:id', authenticate, treatmentPlanController.deleteTreatmentPlan);
router.get('/', authenticate, studentController.getStudents);
router.get('/:id', authenticate, studentController.getStudentById);


module.exports = router;