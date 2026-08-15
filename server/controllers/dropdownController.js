const dropdownModel = require('../models/dropdownModel');
const schoolModel = require('../models/schoolModel');
const almaService = require('../services/almaService');
const pool = require('../db');

const getUserSchoolBuildings = async(req, res) => {
    try{
        const { access_level, school_id, building_id } = req.user;

        if(!school_id) {
            return res.status(400).json({ message: "User does not have a school assigned"});
        }

        let buildings = [];
        const school = await schoolModel.getSchoolById(school_id);

        if(access_level === 3 || access_level === 2 || access_level === 4) {
            buildings = await schoolModel.getBuildingsBySchool(school_id);
        } else if (access_level === 1) {
            const building = await schoolModel.getBuildingById(building_id);
            if(building && building.school_id === school_id) buildings = [building];
        } else {
            return res.status(403).json({ message: "Access denied."});
        }
        res.json({
            school: school ? { id: school.id, name: school.name } : null,
            buildings: buildings
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to fetch buildings."});
    }
};
const getDropdownData = async (req, res) => {
    try{
        const data = await dropdownModel.getDropdownData();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch data', err});
    }
};

const getCohorts = async (req, res) => {
    try{
        const { access_level, building_id:userBuildingId, school_id } = req.user;
        let buildingId;
        if(access_level === 1) {
            buildingId = userBuildingId;
        } else if(access_level === 2 || access_level === 4) {
            buildingId = req.query.buildingId;
            if(!buildingId){
                return res.status(400).json({ message: "Access denied"});
            }
        } else {
            return res.json([]);
        }
        const cohorts = await dropdownModel.getCohortsByBuilding(buildingId);
        res.json(cohorts);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to fetch buildings."});
    }
};

const getCategories = async (req, res) => {
    try {
        const { caseTypeId } = req.query;
        const categories = await dropdownModel.getCategories(caseTypeId || null);
        res.json(categories);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to fetch categories.' });
    }
};

const getSpecByCategory = async (req, res) => {
    try{
        const { categoryId } = req.query;
        if(!categoryId)
            return res.status(400).json({ message: "No selected category." });

        const spec = await dropdownModel.getSpecByCategory(categoryId);
        res.json(spec);
    } catch (err){
        console.error(err);
        res.status(500).json({ message: "Failed to fetch subcategories"});
    }
};

const getUsersBySchool = async (req, res) => {
    try{
        const schoolId = req.user.school_id;
        const currentUserId = req.user.id;
        const users = await dropdownModel.getUsersBySchool(schoolId, currentUserId);
        res.json(users);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error'});
    }
};

const getSchoolsForAdmin = async (req, res) => {
    try{
        const schools = await dropdownModel.getSchoolsForAdmin();
        res.json(schools);
    } catch(err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const getBuildingsForAdmin = async (req, res) => {
    try{
        const { schoolId } = req.params;

        if(!schoolId) {
            return res.status(400).json({ message: "No school_id data found."});
        }
        if(parseInt(schoolId) === 0){
            return res.json([]);
        }

        const buildings = await dropdownModel.getBuildingsForAdmin(schoolId);
        res.json(buildings);
    }catch (err){
        console.error(err)
        res.status(500).json({ message: "Server error"});
    }
};
const getAlmaStudents = async (req, res) => {
  try {
    const { access_level, building_id: userBuildingId } = req.user;
    let buildingId;

    if (access_level === 1) {
      buildingId = userBuildingId;
    } else if ([2, 3, 4].includes(access_level)) {
      buildingId = req.query.buildingId || userBuildingId;
    } else {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (!buildingId) {
      return res.status(400).json({ message: 'No building specified' });
    }

    const students = await almaService.getStudentsByBuilding(buildingId);
    res.json(students);
  } catch (err) {
    console.error('[ALMA] Error:', err.message);
    res.json([]); // Return empty on error - allow manual entry fallback
  }
};

// ---------------------------------------------------------------------------
// Admin: Alma student sync, list, and sync-log endpoints
// All require authenticate + authorizeAdmin middleware (enforced in the route).
// ---------------------------------------------------------------------------

// POST /dropdown/admin/students/sync
// Triggers a full Alma sync. Only one sync runs at a time.
let syncInProgress = false;

const syncAlmaStudents = async (req, res) => {
  const schoolId = req.body.school_id;
  if (!schoolId) {
    return res.status(400).json({ message: 'school_id is required.' });
  }
  if (syncInProgress) {
    return res.status(409).json({ message: 'A sync is already in progress. Please wait.' });
  }
  syncInProgress = true;
  try {
    const triggeredBy = String(req.user.id || req.user.email || 'admin');
    const result = await almaService.syncAllStudents(triggeredBy, schoolId);
    res.json({
      message: 'Sync completed successfully.',
      added:       result.added,
      updated:     result.updated,
      deactivated: result.deactivated,
    });
  } catch (err) {
    // Never expose internal errors or stack traces to the frontend
    console.error('[Admin Sync] Error:', err.message);
    res.status(500).json({ message: 'Sync failed. Check sync logs for details.' });
  } finally {
    syncInProgress = false;
  }
};

// GET /dropdown/admin/students?page=1&limit=20
// Returns paginated list of alma_students with building name resolved.
const getAlmaStudentsList = async (req, res) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const offset = (page - 1) * limit;

    const [dataResult, countResult] = await Promise.all([
      pool.query(
        `SELECT
           als.id, als.alma_student_id, als.application_id,
           als.full_name, als.preferred_name, als.gender,
           als.cohort, als.nationality, als.enrollment_date,
           als.is_active, als.last_synced_at,
           COALESCE(als.building_name, als.application_id) AS building_name,
           s.abbreviation AS school_abbreviation
         FROM alma_students als
         LEFT JOIN schools s ON s.id = als.school_id
         ORDER BY als.last_name ASC, als.first_name ASC
         LIMIT $1 OFFSET $2`,
        [limit, offset]
      ),
      pool.query(`SELECT COUNT(*) FROM alma_students`),
    ]);

    res.json({
      students: dataResult.rows,
      total:    parseInt(countResult.rows[0].count),
      page,
      limit,
    });
  } catch (err) {
    console.error('[Admin Students] Error:', err.message);
    res.status(500).json({ message: 'Failed to fetch students.' });
  }
};

// GET /dropdown/admin/students/sync-logs
// Returns last 10 sync log entries.
const getAlmaSyncLogs = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, started_at, completed_at, status,
              error_message, records_added, records_updated,
              records_deactivated, triggered_by
       FROM sync_logs
       ORDER BY started_at DESC
       LIMIT 10`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('[Sync Logs] Error:', err.message);
    res.status(500).json({ message: 'Failed to fetch sync logs.' });
  }
};

const getAdminCategories = async (req, res) => {
    try {
        const categories = await dropdownModel.getAdminCategories();
        res.json(categories);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to fetch categories.' });
    }
};

const getAdminCategoryById = async (req, res) => {
    try {
        const category = await dropdownModel.getAdminCategoryById(req.params.id);
        if (!category) return res.status(404).json({ message: 'Category not found.' });
        res.json(category);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to fetch category.' });
    }
};

const createCategories = async (req, res) => {
    try {
        const { entries } = req.body;
        if (!entries || !entries.length) {
            return res.status(400).json({ message: 'entries array is required.' });
        }
        await dropdownModel.createCategories(entries);
        res.status(201).json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to create categories.' });
    }
};

const updateCategory = async (req, res) => {
    try {
        const { name, case_type_id, subcategories } = req.body;
        if (!name || !case_type_id) {
            return res.status(400).json({ message: 'name and case_type_id are required.' });
        }
        await dropdownModel.updateCategory(req.params.id, { name, case_type_id, subcategories });
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to update category.' });
    }
};

const deleteCategory = async (req, res) => {
    try {
        await dropdownModel.deleteCategory(req.params.id);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to delete category.' });
    }
};

const addSubcategory = async (req, res) => {
    try {
        const { name, category_id } = req.body;
        if (!name || !category_id) {
            return res.status(400).json({ message: 'name and category_id are required.' });
        }
        const sub = await dropdownModel.addSubcategory({ name, category_id });
        res.status(201).json(sub);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to add subcategory.' });
    }
};

const deleteSubcategory = async (req, res) => {
    try {
        await dropdownModel.deleteSubcategory(req.params.id);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to delete subcategory.' });
    }
};

module.exports = {
    getDropdownData,
    getUserSchoolBuildings,
    getCohorts,
    getCategories,
    getSpecByCategory,
    getUsersBySchool,
    getSchoolsForAdmin,
    getBuildingsForAdmin,
    getAlmaStudents,
    syncAlmaStudents,
    getAlmaStudentsList,
    getAlmaSyncLogs,
    getAdminCategories,
    getAdminCategoryById,
    createCategories,
    updateCategory,
    deleteCategory,
    addSubcategory,
    deleteSubcategory,
};