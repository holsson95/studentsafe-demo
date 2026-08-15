const caseModel = require('../models/caseModel');

// Dashboard-stats endpoints accept a client-supplied school_id for drilling into a
// specific school. District admins (access_level 3) may request any school (or the
// "all schools" sentinel, id 1); every other access level is always pinned to their
// own school_id regardless of what the client sends.
const resolveScopedSchoolId = (user, requestedSchoolId) => {
    if (user.access_level === 3) return requestedSchoolId;
    return user.school_id;
};
const studentModel = require('../models/studentModel');
const userModel = require('../models/userModel');
const notificationsController = require('../controllers/notificationsController');
const logModel = require('../models/logModel');


const getCases = async (req, res) => {
    const { access_level, school_id, building_id, id: user_id} = req.user;
    
    try{
        let cases = [];
        if (access_level === 1){
            const buildingCases = await caseModel.getCasesByBuilding(building_id);
            const sharedCases = await caseModel.getSharedCases(user_id);
    
            // Filter building cases to only include those created by this user
            const userCreatedCases = buildingCases.filter(c => c.created_by === user_id);
            cases = [...userCreatedCases, ...sharedCases];

        } else if (access_level === 2){
            cases = await caseModel.getCasesBySchool(school_id);
            const sharedCases = await caseModel.getSharedCases(user_id);
            
            // Using a Map to avoid duplicates
            const caseMap = new Map();
            [...cases, ...sharedCases].forEach(c => caseMap.set(c.id, c));
            cases = Array.from(caseMap.values());

        } else if (access_level === 3){
            cases = await caseModel.getAllCases();
        }else if (access_level === 4){
            cases = await caseModel.getCasesByUserId(user_id);
        } else if (access_level === 0){
            return res.status(403).json({message: 'App admin cannot access case data'});
        } else {
            return res.status(403).json({ message: 'Access level not recognized'});
        }

        const sharedCases = await caseModel.getSharedCases(user_id);
        const caseMap = new Map();
        [...cases, ...sharedCases].forEach(c => caseMap.set(c.id, c));
        const combinedCases = Array.from(caseMap.values());
        
        res.json(combinedCases);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch cases', message: err.message });
    }
};

const getCasesById = async(req, res) => {
    const { access_level, school_id, building_id, id: user_id} = req.user;
    const { id: case_id} = req.params;
    
    try{
        let caseData = null;
        if (access_level === 1){
            caseData = await caseModel.getCaseByBuilding(case_id, building_id);
        } else if (access_level === 2){
            caseData = await caseModel.getCaseBySchool(case_id, school_id);
        } else if (access_level === 3){
            caseData = await caseModel.getCasesById(case_id);
        }else if (access_level === 4){
            caseData = await caseModel.getCaseByUserId(case_id, user_id);
        } else if (access_level === 0){
            return res.status(403).json({message: 'App admin cannot access case data'});
        } else {
            return res.status(403).json({ message: 'Access level not recognized'});
        }
        
        if (!caseData) {
            const sharedCases = await caseModel.getSharedCases(user_id);
            caseData = sharedCases.find(c => c.id === parseInt(case_id));
        }

        if(!caseData) {
          caseData = await caseModel.getCaseByIdForNotification(case_id, user_id);
        }

        if (!caseData){
            return res.status(404).json({ message: 'Case not found or not accessible'});
        }
        // await logModel.createLog({
        //     log_type: 'case',
        //     action_code: 'CASE_VIEWED',
        //     user_id: req.user.id,
        //     case_id: case_id,
        // });
        const studentStatus = getStudentStatus(caseData.entry_date);
        const subcategories = await caseModel.getSubcategoriesByCaseId(case_id);
        const shares = await caseModel.getSharesByCaseId(case_id);
        const sharedUsers = await Promise.all(shares.map(async (share) => {
            const user = await userModel.getUserById(share.shared_with_user_id);
            return { id: user.id, name: user.name, shared_at: share.shared_at };
        }));
        const uploadedFiles = await caseModel.getCaseMediaByCaseId(case_id);
        res.json({ ...caseData, studentStatus, sharedUsers, subcategories, uploadedFiles });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch cases' });
    }
};

const fetchCaseStatsWithTimeSeries = async (req, res) => {
    const { access_level, school_id, building_id, id: user_id } = req.user;
    const { period = 'day', case_type_id, schoolIdQuery  } = req.query; // Get period from query params
    
    const filter = {
      school_id: access_level == 2 ? school_id : null,
      building_id: access_level >= 1 ? building_id : null,
      case_type_id: case_type_id || null ,
      schoolIdQuery: schoolIdQuery
    };
    
    try {
        const stats = await caseModel.getCaseStatisticsWithTimeSeries(
            period, 
            filter, 
            user_id, 
            access_level
        );
        
        res.json(stats);
    } catch (err) {
        console.error('Error in getCaseStatsWithTimeSeries:', err);
        res.status(500).json({ error: 'Failed to fetch case statistics', message: err.message });
    }
};

const getCategories = async (req, res) => {
    try{
        const categories = await caseModel.getCategories();
        res.json(categories);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch categories'});
    }
};

const getStudentStatus = (entry_date) => {
    if (!entry_date) return 'unknown';

    const entry = new Date(entry_date);
    const now = new Date();
    const duration = now - entry;
    const durationOfStay = Math.floor(duration / (1000 * 60 * 60 * 24));
    const years = Math.floor(durationOfStay / 365);
    const months = Math.floor((durationOfStay % 365) / 30);

    if (durationOfStay < 182) {
        return `NEW - ${durationOfStay} days`;
    } else if (years >= 1) {
        let label = `OLD - ${years} year${years > 1 ? 's' : ''}`;
        if (months > 0) {
            label += ` and ${months} months${months > 1 ? 's' : ''}`;
        }
        return label;
    } else {
        return `OLD - ${months} months${months > 1 ? 's' : ''}`;
    }
};

const createCase = async(req, res) => {
    const shared_by_user_id = req.user.id;
    const { access_level } = req.user;

    if (![1, 2, 4].includes(access_level)){
        return res.status(403).json({ message: 'Access denied' });
    }

    try{
      const uploadedFiles = req.files || [];
        // const {first_name, last_name, nickname, cohort, nationality_id , reason, status, category_id, entry_date, shared_with_user_ids, sex_id, case_type_id, severity_id, subcategory} = req.body;
        const {first_name, last_name, nickname, cohort, nationality_id, reason, status, category_id, entry_date, case_type_id, severity_id, privacy_policy_acknowledged} = req.body;
        let shared_with_user_ids, subcategory;
        try {
            shared_with_user_ids = JSON.parse(req.body.shared_with_user_ids || '[]');
            subcategory = JSON.parse(req.body.subcategory || '[]');
        } catch {
            return res.status(400).json({ error: 'Invalid JSON in shared_with_user_ids or subcategory' });
        }
        const parseNullableInt = (values) => {
          return values === '' || values === undefined || values === null ? null : parseInt(values, 10);
        };
        const parseCohort = parseNullableInt(cohort);
        const parseNationalityId = parseNullableInt(nationality_id);
        const parseCategoryId = parseNullableInt(category_id);
        const parseCaseTypeId = parseNullableInt(case_type_id);
        const parseSeverityId = parseNullableInt(severity_id);

        const student = await studentModel.addStudentIfNotExists({
            first_name,
            last_name,
            nickname,
            cohort: parseCohort,
            nationality_id: parseNationalityId,
            entry_date:entry_date || null,
            school_id: req.user.school_id,
            building_id: req.user.building_id
        });
        if(!student.id) {
            return res.status(400).json({ error: 'Failed to assign student ID'});
        } 

        const newCase = await caseModel.createCase({ 
            first_name, 
            last_name, 
            nickname, 
            cohort: parseCohort, 
            nationality_id: parseNationalityId, 
            reason, 
            status, 
            category_id: parseCategoryId,
            entry_date: entry_date || null,
            created_by: req.user.id,
            building_id: req.user.building_id,
            school_id: req.user.school_id,
            // sex_id,
            case_type_id: parseCaseTypeId,
            severity_id: parseSeverityId,
            student_id: student.id,
            privacy_policy_acknowledged: privacy_policy_acknowledged === 'true' || privacy_policy_acknowledged === true,
            privacy_policy_acknowledged_at: privacy_policy_acknowledged === 'true' || privacy_policy_acknowledged === true ? new Date() : null,
        });
        
        await logModel.createLog({
          log_type: 'case',
          action_code: 'CASE_CREATED',
          user_id: req.user.id,
          case_id: newCase.id,
      });

        if(Array.isArray(subcategory) && subcategory.length > 0) {
            for(const subcategory_id of subcategory){
                await caseModel.addCaseSubcategory(newCase.id, subcategory_id);
            }
        }

        let usersToShareWith = [];

        if (access_level === 4) {
          const { building_id } = req.body;

          if(!building_id) {
            return res.status(400).json({ message: 'Building is required for Level 4 users' });
          }
          const level1Users = await userModel.getLevel1UsersByBuilding(building_id);
          const level2Users = await userModel.getLevel2UsersBySchool(req.user.school_id);
          usersToShareWith = [...level1Users.map(u => u.id), ...level2Users.map(u => u.id)];
        }

        const finalSharedUserIds = [...new Set([...(shared_with_user_ids || []), ...(usersToShareWith || [])])];

        if (finalSharedUserIds.length > 0) {
            for (const shared_with_user_id of finalSharedUserIds){
                await caseModel.shareCase({
                    case_id: newCase.id,
                    shared_with_user_id,
                    shared_by_user_id
                });
            }
            const shareMessage = `A new case has been shared with you for ${first_name} ${last_name}`;

            await notificationsController.notifyCaseShared({
              shared_by: req.user,
              school_id: req.user.school_id,
              case_share_id: newCase.id,
              message: shareMessage,
              case_id: newCase.id,
              shared_with_user_ids: finalSharedUserIds
            });
          }
          if (uploadedFiles.length> 0){
            for (const file of uploadedFiles){
              await caseModel.addCaseMedia({
                case_id: newCase.id,
                filename: file.originalname,
                file_url: `${process.env.SERVER_URL || 'http://localhost:5000'}/uploads/${file.filename}`,
                file_type: file.mimetype
              });
            }
          }
          const submitMessage = `A new case has been submitted for ${first_name} ${last_name}`;
          await notificationsController.notifyCaseSubmitted({
            submitted_by: req.user,
            school_id: req.user.school_id,
            message: submitMessage,
            case_id: newCase.id
          });
          const student_status = getStudentStatus(entry_date);
          res.status(201).json({...newCase, student_status, message: 'Case created successfully', shared_with:finalSharedUserIds });
        
    } catch (err) {
        console.error('Failed to create case: ', err);
        res.status(500).json({ error: 'Failed to create case' });
    }
};

const shareCase = async(req, res) => {
    const shared_by_user_id = req.user.id;
    const { access_level, school_id, building_id } = req.user;
    const { case_id, shared_with_user_ids } = req.body;

    try{
        // Verify the requesting user can actually access this case before sharing it
        let caseData = null;
        if (access_level === 1) {
            caseData = await caseModel.getCaseByBuilding(case_id, building_id);
        } else if (access_level === 2) {
            caseData = await caseModel.getCaseBySchool(case_id, school_id);
        } else if (access_level === 3) {
            caseData = await caseModel.getCasesById(case_id);
        } else if (access_level === 4) {
            caseData = await caseModel.getCaseByUserId(case_id, shared_by_user_id);
        }
        if (!caseData) {
            const sharedCases = await caseModel.getSharedCases(shared_by_user_id);
            caseData = sharedCases.find(c => c.id === parseInt(case_id));
        }
        if (!caseData) {
            return res.status(403).json({ message: 'Access denied: case not found or not accessible' });
        }

        for (const shared_with_user_id of shared_with_user_ids) {
            await caseModel.shareCase({case_id, shared_with_user_id, shared_by_user_id});
        }
        await logModel.createLog({
            log_type: 'case',
            action_code: 'CASE_SHARED',
            user_id: req.user.id,
            case_id: case_id,
        });
        res.status(200).json({ message: 'Case shared successfully' });
    } catch (err) {
        console.error('Failed to share case:', err);
        res.status(500).json({ error: 'Failed to share case'});
    }
};

const deleteCase = async(req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    const access_level = req.user.access_level;

    try{
        const deleted = await caseModel.deleteCase(id);
        if(!deleted) {
            return res.status(404).json({ message: 'Access denied'});
        }
        await logModel.createLog({
            log_type: 'case',
            action_code: 'CASE_DELETED',
            user_id: req.user.id,
            case_id: id,
        });        res.json ({ message: 'Case deleted successfully'});
    } catch (err) {
        console.error('Error deleting case:', err);
        res.status(500).json({ error: 'Failed to delete case' });
    }
};

const updateStatus = async(req, res) => {
    const { id } = req.params;
    const { status, changed_date, comment } = req.body;
    const { access_level, building_id, school_id, id: user_id } = req.user;

    if (![1, 2, 3].includes(access_level)) {
        return res.status(403).json({ message: 'Access denied' });
    }

    const normalizedStatus = status.toLowerCase();

    if (normalizedStatus === 'on hold' && (!comment || !comment.trim())) {
        return res.status(400).json({ message: 'A reason is required when setting status to On Hold' });
    }

    if (!changed_date) {
        return res.status(400).json({ message: 'A date is required' });
    }

    try {
        let caseData = null;
        if (access_level === 1) {
            caseData = await caseModel.getCaseByBuilding(id, building_id);
        } else if (access_level === 2) {
            caseData = await caseModel.getCaseBySchool(id, school_id);
        } else if (access_level === 3) {
            caseData = await caseModel.getCasesById(id);
        }

        if (!caseData) {
            const sharedCases = await caseModel.getSharedCases(user_id);
            caseData = sharedCases.find(c => c.id === parseInt(id));
        }

        if (!caseData) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const old_status = caseData.status;

        if (old_status && old_status.toLowerCase() === normalizedStatus) {
            return res.status(400).json({ message: 'New status must be different from the current status' });
        }

        const updated = await caseModel.updateStatus(id, normalizedStatus, user_id, old_status, changed_date, comment || null);

        if (!updated) {
            return res.status(404).json({ message: 'Case not found' });
        }

        await logModel.createLog({
            log_type: 'case',
            action_code: 'CASE_STATUS_UPDATED',
            user_id: user_id,
            case_id: id,
        });

        res.json({ message: 'Case status updated successfully', case: updated });
    } catch (err) {
        console.error('Failed to update case status', err);
        res.status(500).json({ error: 'Failed to update case status' });
    }
};

const getStatusHistory = async(req, res) => {
    const { id } = req.params;
    const { access_level, building_id, school_id, id: user_id } = req.user;

    try {
        let caseData = null;
        if (access_level === 1) {
            caseData = await caseModel.getCaseByBuilding(id, building_id);
        } else if (access_level === 2) {
            caseData = await caseModel.getCaseBySchool(id, school_id);
        } else if (access_level === 3) {
            caseData = await caseModel.getCasesById(id);
        } else if (access_level === 4) {
            caseData = await caseModel.getCaseByUserId(id, user_id);
        } else {
            return res.status(403).json({ message: 'Access denied' });
        }

        if (!caseData) {
            const sharedCases = await caseModel.getSharedCases(user_id);
            caseData = sharedCases.find(c => c.id === parseInt(id));
        }

        if (!caseData) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const history = await caseModel.getStatusHistory(id);
        res.json(history);
    } catch (err) {
        console.error('Failed to fetch status history', err);
        res.status(500).json({ error: 'Failed to fetch status history' });
    }
};

const fetchCaseCountsBySchool = async (req, res) => {
  try {
    const { case_type_id, school_id } = req.query;
    const filters = {
      case_type_id: case_type_id ? parseInt(case_type_id) : undefined,
      school_id: resolveScopedSchoolId(req.user, school_id ? parseInt(school_id) : undefined),
    };
    const counts = await caseModel.getCaseCountsBySchool(filters);
    res.json(counts);
  } catch (err) {
    console.error('Error in fetchCaseCountsBySchool:', err); 
    res.status(500).json({ 
      message: 'Error fetching case counts by school', 
      error: err.message || err 
    });
  }
};

const fetchCaseCountsByBuilding = async (req, res) => {
  try {
    const { case_type_id, school_id } = req.query;
    const filters = {
      case_type_id: case_type_id ? parseInt(case_type_id) : undefined,
      school_id: resolveScopedSchoolId(req.user, school_id ? parseInt(school_id) : undefined),
    };
    const counts = await caseModel.getCaseCountsByBuilding(filters);
    res.json(counts);
  } catch (err) {
    console.error('Error in fetchCaseCountsBySchool:', err); 
    res.status(500).json({ 
      message: 'Error fetching case counts by school', 
      error: err.message || err 
    });
  }
};

const fetchCaseCountsByStatus = async (req, res) => {
  try {
    const { case_type_id, school_id } = req.query;
    const filters = {
      case_type_id: case_type_id ? parseInt(case_type_id) : undefined,
      school_id: resolveScopedSchoolId(req.user, school_id ? parseInt(school_id) : undefined),
    };

    const counts = await caseModel.getCaseCountsByStatus(filters);
    res.json(counts);
  } catch (err) {
    console.error('Error in fetchCaseCountsByStatus:', err); 
    res.status(500).json({ 
      message: 'Error fetching case counts by status', 
      error: err.message || err 
      
    });
  }
};
const fetchCaseCountsBySeverity = async (req, res) => {
  try {
    const { case_type_id, school_id } = req.query;
    const filters = {
      case_type_id: case_type_id ? parseInt(case_type_id) : undefined,
      school_id: resolveScopedSchoolId(req.user, school_id ? parseInt(school_id) : undefined),
    };

    const counts = await caseModel.getCaseCountsBySeverity(filters);
    res.json(counts);
  } catch (err) {
    console.error('Error in fetchCaseCountsBySeverity:', err); 
    res.status(500).json({ 
      message: 'Error fetching case counts by severity', 
      error: err.message || err 
      
    });
  }
};
const fetchCaseCountsByGender = async (req, res) => {
  try {
    const { case_type_id, school_id } = req.query;
    const filters = {
      case_type_id: case_type_id ? parseInt(case_type_id) : undefined,
      school_id: resolveScopedSchoolId(req.user, school_id ? parseInt(school_id) : undefined),
    };

    const counts = await caseModel.getCaseCountsByGender(filters);

    res.json(counts);
  } catch (err) {
    console.error('Error in fetchCaseCountsByGender:', err); 
    res.status(500).json({ 
      message: 'Error fetching case counts by gender', 
      error: err.message || err 
      
    });
  }
};

const fetchTopCategories = async (req, res) => {
  try {
    const { case_type_id, school_id } = req.query;
    const filters = {
      case_type_id: case_type_id ? parseInt(case_type_id) : undefined,
      school_id: resolveScopedSchoolId(req.user, school_id ? parseInt(school_id) : undefined),
    };
    const categories = await caseModel.getTopCategories(filters);

    res.json(categories);
  } catch (err) {
    console.error('Error in fetchTopCategories:', err); 
    res.status(500).json({ 
      message: 'Error fetching top categories', 
      error: err.message || err 
      
    });
  }
};
const fetchTopSubcategories = async (req, res) => {
  try {
    const { case_type_id, school_id } = req.query;
    const filters = {
      case_type_id: case_type_id ? parseInt(case_type_id) : undefined,
      school_id: resolveScopedSchoolId(req.user, school_id ? parseInt(school_id) : undefined),
    };
    const subcategories = await caseModel.getTopSubCategories(filters);

    res.json(subcategories);
  } catch (err) {
    console.error('Error in fetchTopSubcategories:', err); 
    res.status(500).json({ 
      message: 'Error fetching top subcategories', 
      error: err.message || err 
      
    });
  }
};

const getCasesByStudentId = async (req, res) => {
    const { studentId } = req.params;

    try{
        const cases = await caseModel.getCasesByStudentId(studentId);
        if(cases.length === 0){
            return res.status(404).json({ message: 'No cases found.'});
        }
        res.json(cases);
    } catch (err) {
        console.error('Error fetching data:', err);
        res.status(500).json({ error: 'Failed to fetch case' });
    }
};

const getAllCaseTypes = async(req, res) => {
    try{
        const caseTypes = await caseModel.getAllCaseTypes();
        res.json(caseTypes);
    } catch (err) {
        console.error('Error fetching data:', err);
        res.status(500).json({ error: 'Failed to fetch data' });

    }
};

const fetchReportersByCaseType = async (req, res) => {
  try {
    const { case_type_id, school_id } = req.query;
    const filters = {
      case_type_id: case_type_id ? parseInt(case_type_id) : undefined,
      school_id: resolveScopedSchoolId(req.user, school_id ? parseInt(school_id) : undefined),
    };

    const counts = await caseModel.getReportersByCaseType(filters);

    res.json(counts);
  } catch (err) {
    console.error('Error in fetchCaseCountsByGender:', err); 
    res.status(500).json({ 
      message: 'Error fetching case counts by gender', 
      error: err.message || err 
      
    });
  }
};

module.exports = {
    getCases,
    getCasesById,
    createCase,
    fetchCaseStatsWithTimeSeries,
    getCategories,
    shareCase,
    deleteCase,
    updateStatus,
    fetchCaseCountsBySchool,
    fetchCaseCountsByBuilding,
    fetchCaseCountsByStatus,
    fetchCaseCountsBySeverity,
    fetchCaseCountsByGender,
    fetchTopCategories,
    fetchTopSubcategories,
    getCasesByStudentId,
    getAllCaseTypes,
    fetchReportersByCaseType,
    getStatusHistory
};