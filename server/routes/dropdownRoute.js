const express = require('express');
const router = express.Router();
const dropdownController = require('../controllers/dropdownController');
const { authenticate, authorizeAdmin } = require('../middleware/authMiddleware');

router.get('/', authenticate, dropdownController.getDropdownData);
router.get('/buildings', authenticate, dropdownController.getUserSchoolBuildings);
router.get('/cohorts', authenticate, dropdownController.getCohorts);
router.get('/categories', authenticate, dropdownController.getCategories);
router.get('/subcategories', authenticate, dropdownController.getSpecByCategory);
router.get('/users', authenticate, dropdownController.getUsersBySchool);
router.get('/admin/schools', authenticate, dropdownController.getSchoolsForAdmin);
router.get('/admin/buildings/:schoolId', authenticate, dropdownController.getBuildingsForAdmin);
router.get('/alma-students', authenticate, dropdownController.getAlmaStudents);

// Admin-only Alma student management
// sync-logs before generic list so Express routes correctly
router.get('/admin/students/sync-logs', authenticate, authorizeAdmin, dropdownController.getAlmaSyncLogs);
router.post('/admin/students/sync', authenticate, authorizeAdmin, dropdownController.syncAlmaStudents);
router.get('/admin/students', authenticate, authorizeAdmin, dropdownController.getAlmaStudentsList);

// Admin category management
router.get('/admin/categories', authenticate, authorizeAdmin, dropdownController.getAdminCategories);
router.get('/admin/categories/:id', authenticate, authorizeAdmin, dropdownController.getAdminCategoryById);
router.post('/admin/categories', authenticate, authorizeAdmin, dropdownController.createCategories);
router.put('/admin/categories/:id', authenticate, authorizeAdmin, dropdownController.updateCategory);
router.delete('/admin/categories/:id', authenticate, authorizeAdmin, dropdownController.deleteCategory);

// Admin subcategory management
router.post('/admin/subcategories', authenticate, authorizeAdmin, dropdownController.addSubcategory);
router.delete('/admin/subcategories/:id', authenticate, authorizeAdmin, dropdownController.deleteSubcategory);

module.exports = router;