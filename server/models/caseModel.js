// const { getCasesById } = require('../controllers/caseController');
const pool = require('../db');

const getCategories = async() => {
    const result = await pool.query('SELECT * FROM categories ORDER BY name ASC');
    return result.rows;
};

const createCase = async({ first_name, last_name, nickname, cohort, nationality_id , reason, status, category_id, entry_date, created_by, building_id, school_id, case_type_id, severity_id, subcategory, student_id, privacy_policy_acknowledged, privacy_policy_acknowledged_at}) => {
    const result = await pool.query(`INSERT INTO cases ( first_name, last_name, nickname, cohort, nationality_id, reason, status, category_id, entry_date, created_by, building_id, school_id, case_type_id, severity_id, student_id, privacy_policy_acknowledged, privacy_policy_acknowledged_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17) RETURNING *`, [ first_name, last_name, nickname, cohort, nationality_id, reason, status, category_id, entry_date, created_by, building_id, school_id, case_type_id, severity_id, student_id, privacy_policy_acknowledged, privacy_policy_acknowledged_at]);
    return result.rows[0];
};

const getSubCategoriesbyCategoryId = async(categoryId) => {
    const result = await pool.query('SELECT * FROM subcategories WHERE category_id = $1 ORDER BY name ASC', [categoryId]);
    return result.rows;
};

const getCasesById = async (caseId) => {
    const result = await pool.query(`SELECT cases.*, CONCAT(cases.first_name, ' ', cases.last_name) AS full_name, severity.name AS severity_name, categories.name AS category_name, nationalities.name AS nationality_name, users.name AS created_by_name, cohorts.name As cohort_name, schools.name AS school_name, cases.case_type_id FROM cases LEFT JOIN severity ON cases.severity_id = severity.id LEFT JOIN categories ON cases.category_id = categories.id LEFT JOIN nationalities ON cases.nationality_id = nationalities.id LEFT JOIN users ON cases.created_by = users.id LEFT JOIN cohorts ON cases.cohort = cohorts.id LEFT JOIN schools ON cases.school_id = schools.id LEFT JOIN case_case_type cct ON cct.case_id = cases.id WHERE cases.id = $1`, [caseId]);
    console.log(result.rows[0]);
    return result.rows[0];
};

const ON_HOLD_JOIN = `LEFT JOIN LATERAL (SELECT changed_date, comment FROM case_status_history WHERE case_id = cases.id AND new_status = 'on hold' ORDER BY changed_date DESC LIMIT 1) ohs ON true`;
const SCHOOL_COLS = `schools.name AS school_name, schools.abbreviation AS school_abbreviation`;
const ON_HOLD_COLS = `ohs.changed_date AS on_hold_since, ohs.comment AS on_hold_reason`;

const getCasesByUserId = async (user_id) => {
    const result = await pool.query(`SELECT cases.*, severity.name AS severity_name, categories.name AS category_name, nationalities.name AS nationality_name, users.name AS created_by_name, cohorts.name AS cohort_name, ct.name AS case_type_name, ${SCHOOL_COLS}, ${ON_HOLD_COLS} FROM cases LEFT JOIN severity ON cases.severity_id = severity.id LEFT JOIN categories ON cases.category_id = categories.id LEFT JOIN nationalities ON cases.nationality_id = nationalities.id LEFT JOIN users ON cases.created_by = users.id LEFT JOIN cohorts ON cases.cohort = cohorts.id LEFT JOIN case_type ct ON cases.case_type_id = ct.id LEFT JOIN schools ON cases.school_id = schools.id ${ON_HOLD_JOIN} WHERE cases.created_by = $1 ORDER BY cases.created_at DESC`, [user_id]);
    return result.rows;
};

const getCasesByBuilding = async (building_id) => {
    const result = await pool.query(`SELECT cases.*, severity.name AS severity_name, categories.name AS category_name, nationalities.name AS nationality_name, users.name AS created_by_name, cohorts.name AS cohort_name, ct.name AS case_type_name, ${SCHOOL_COLS}, ${ON_HOLD_COLS} FROM cases LEFT JOIN severity ON cases.severity_id = severity.id LEFT JOIN categories ON cases.category_id = categories.id LEFT JOIN nationalities ON cases.nationality_id = nationalities.id LEFT JOIN users ON cases.created_by = users.id LEFT JOIN cohorts ON cases.cohort = cohorts.id LEFT JOIN case_type ct ON cases.case_type_id = ct.id LEFT JOIN schools ON cases.school_id = schools.id ${ON_HOLD_JOIN} WHERE cases.building_id = $1 ORDER BY cases.created_at DESC`, [building_id]);
    return result.rows;
};

const getCasesBySchool = async (school_id) => {
    const result = await pool.query(`SELECT cases.*, severity.name AS severity_name, categories.name AS category_name, nationalities.name AS nationality_name, users.name AS created_by_name, cohorts.name AS cohort_name, ct.name AS case_type_name, ${SCHOOL_COLS}, ${ON_HOLD_COLS} FROM cases LEFT JOIN severity ON cases.severity_id = severity.id LEFT JOIN categories ON cases.category_id = categories.id LEFT JOIN nationalities ON cases.nationality_id = nationalities.id LEFT JOIN users ON cases.created_by = users.id LEFT JOIN cohorts ON cases.cohort = cohorts.id LEFT JOIN case_type ct ON cases.case_type_id = ct.id LEFT JOIN schools ON cases.school_id = schools.id ${ON_HOLD_JOIN} WHERE cases.school_id = $1 ORDER BY cases.created_at DESC`, [school_id]);
    return result.rows;
};

const getCaseByUserId = async (caseId, user_id) => {
    const result = await pool.query(`SELECT cases.*, CONCAT(cases.first_name, ' ', cases.last_name) AS full_name, severity.name AS severity_name, categories.name AS category_name, nationalities.name AS nationality_name, users.name AS created_by_name, cohorts.name As cohort_name, schools.name AS school_name FROM cases LEFT JOIN severity ON cases.severity_id = severity.id LEFT JOIN categories ON cases.category_id = categories.id LEFT JOIN nationalities ON cases.nationality_id = nationalities.id LEFT JOIN users ON cases.created_by = users.id LEFT JOIN cohorts ON cases.cohort = cohorts.id LEFT JOIN schools ON cases.school_id = schools.id WHERE cases.id = $1 AND cases.created_by = $2`, [caseId, user_id]);
    return result.rows[0];
};

const getCaseByBuilding = async (case_id, building_id) => {
    const result = await pool.query(`SELECT cases.*, CONCAT(cases.first_name, ' ', cases.last_name) AS full_name, severity.name AS severity_name, categories.name AS category_name, nationalities.name AS nationality_name, users.name AS created_by_name, cohorts.name As cohort_name, schools.name AS school_name, cases.case_type_id FROM cases LEFT JOIN severity ON cases.severity_id = severity.id LEFT JOIN categories ON cases.category_id = categories.id LEFT JOIN nationalities ON cases.nationality_id = nationalities.id LEFT JOIN users ON cases.created_by = users.id LEFT JOIN cohorts ON cases.cohort = cohorts.id LEFT JOIN schools ON cases.school_id = schools.id LEFT JOIN case_case_type cct ON cct.case_id = cases.id WHERE cases.id = $1 AND cases.building_id = $2 `, [case_id, building_id]);
    return result.rows[0];
};

const getCaseBySchool = async (case_id, school_id) => {
    const result = await pool.query(`SELECT cases.*, CONCAT(cases.first_name, ' ', cases.last_name) AS full_name, severity.name AS severity_name, categories.name AS category_name, nationalities.name AS nationality_name, users.name AS created_by_name, cohorts.name As cohort_name, schools.name AS school_name, cases.case_type_id FROM cases LEFT JOIN severity ON cases.severity_id = severity.id LEFT JOIN categories ON cases.category_id = categories.id LEFT JOIN nationalities ON cases.nationality_id = nationalities.id LEFT JOIN users ON cases.created_by = users.id LEFT JOIN cohorts ON cases.cohort = cohorts.id LEFT JOIN schools ON cases.school_id = schools.id LEFT JOIN case_case_type cct ON cct.case_id = cases.id WHERE cases.id = $1 AND cases.school_id = $2`, [case_id, school_id]);
    return result.rows[0];
};

const getAllCases = async () => {
    const result = await pool.query(`SELECT cases.*, severity.name AS severity_name, categories.name AS category_name, nationalities.name AS nationality_name, users.name AS created_by_name, cohorts.name AS cohort_name, ct.name AS case_type_name, ${SCHOOL_COLS}, ${ON_HOLD_COLS} FROM cases LEFT JOIN severity ON cases.severity_id = severity.id LEFT JOIN categories ON cases.category_id = categories.id LEFT JOIN nationalities ON cases.nationality_id = nationalities.id LEFT JOIN users ON cases.created_by = users.id LEFT JOIN cohorts ON cases.cohort = cohorts.id LEFT JOIN case_type ct ON cases.case_type_id = ct.id LEFT JOIN schools ON cases.school_id = schools.id ${ON_HOLD_JOIN} ORDER BY cases.created_at DESC`);
    return result.rows;
};

const shareCase = async({ case_id, shared_with_user_id, shared_by_user_id }) => {
    const result = await pool.query(`INSERT INTO case_shares (case_id, shared_with_user_id, shared_by_user_id) VALUES ($1, $2, $3) RETURNING *`, [case_id, shared_with_user_id, shared_by_user_id]);
    return result.rows[0];
};

const getSharedCases = async(user_id) => {
     const result = await pool.query(`SELECT cases.*, severity.name AS severity_name, categories.name AS category_name, nationalities.name AS nationality_name, users.name AS created_by_name, cohorts.name AS cohort_name, ct.name AS case_type_name, ${SCHOOL_COLS}, ${ON_HOLD_COLS} FROM case_shares JOIN cases ON case_shares.case_id = cases.id LEFT JOIN severity ON cases.severity_id = severity.id LEFT JOIN categories ON cases.category_id = categories.id LEFT JOIN nationalities ON cases.nationality_id = nationalities.id LEFT JOIN users ON cases.created_by = users.id LEFT JOIN cohorts ON cases.cohort = cohorts.id LEFT JOIN case_type ct ON cases.case_type_id = ct.id LEFT JOIN schools ON cases.school_id = schools.id ${ON_HOLD_JOIN} WHERE case_shares.shared_with_user_id = $1 ORDER BY cases.created_at DESC`, [user_id]);
     return result.rows;
};

const getSharesByCaseId = async(case_id) => {
    const result = await pool.query(`SELECT * FROM case_shares WHERE case_id = $1`, [case_id]);
    return result.rows;
};

const deleteCase = async (id) => {
    const result = await pool.query('DELETE FROM cases WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
};

const updateStatus = async(case_id, new_status, user_id, old_status, changed_date, comment) => {
    const result = await pool.query(
        `UPDATE cases SET status = $1 WHERE id = $2 RETURNING *`,
        [new_status, case_id]
    );
    if (!result.rows[0]) return null;

    await pool.query(
        `INSERT INTO case_status_history (case_id, changed_by, old_status, new_status, changed_date, comment)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [case_id, user_id, old_status || null, new_status, changed_date, comment || null]
    );

    return result.rows[0];
};

const getStatusHistory = async(case_id) => {
    const result = await pool.query(
        `SELECT csh.*, u.name AS changed_by_name
         FROM case_status_history csh
         LEFT JOIN users u ON csh.changed_by = u.id
         WHERE csh.case_id = $1
         ORDER BY csh.created_at DESC`,
        [case_id]
    );
    return result.rows;
};

const addCaseSubcategory = async(case_id, subcategory_id) => {
    const result = await pool.query(`INSERT INTO case_subcategories(case_id, subcategory_id) VALUES($1, $2) RETURNING *`, [case_id, subcategory_id]);
    return result.rows[0];
};

const getCaseCountsBySchool = async (filters = {}) => {
  const { case_type_id, school_id } = filters;
  
  let query;
  const params = [];
  const conditions = [];

  if (school_id === 1) {
    query = `
      SELECT s.abbreviation AS label, COUNT(c.id) AS total_cases
      FROM schools s
      LEFT JOIN cases c ON s.id = c.school_id
    `;
  } else {
    query = `
      SELECT b.name AS label, COUNT(c.id) AS total_cases
      FROM buildings b
      LEFT JOIN cases c ON b.id = c.building_id
      JOIN schools s ON s.id = b.school_id
    `;
    
    conditions.push(`s.id = $1`);
    params.push(school_id);
  }

  if (case_type_id !== undefined) {
    conditions.push(`c.case_type_id = ANY($${params.length + 1})`);
    params.push([case_type_id, 3]);
  }

  // Append conditions
  if (conditions.length > 0) {
    query += ` WHERE ` + conditions.join(' AND ');
  }

  query += `
    GROUP BY label
    ORDER BY total_cases DESC
  `;

  const result = await pool.query(query, params);
  return result.rows;
};



const getCaseCountsByStatus = async (filters = {}) => {
  const { case_type_id, school_id } = filters;
  let query;
  const params = [];
  const conditions = [];
  if (school_id === 1){
     query = `
      SELECT s.abbreviation AS label, c.status, COUNT(c.id) AS case_count
      FROM schools s
      LEFT JOIN cases c ON s.id = c.school_id
    `;
  } else {
    query = `
      SELECT b.name AS label, c.status, COUNT(c.id) AS case_count
      FROM buildings b
      LEFT JOIN cases c ON b.id = c.building_id
      JOIN schools s ON s.id = b.school_id
    `;
    conditions.push(`s.id = $1`);
    params.push(school_id);
  }
  if (case_type_id !== undefined) {
    conditions.push(`c.case_type_id = ANY($${params.length + 1})`);
    params.push([case_type_id, 3]);
  }

  // Append conditions if any
  if (conditions.length > 0) {
    query += ` WHERE ` + conditions.join(' AND ');
  }

  query += `
    GROUP BY label, c.status
    ORDER BY label, c.status
  `;

  const result = await pool.query(query, params);
  return result.rows;
  
};

const getCaseCountsBySeverity = async (filters = {}) => {
  const { case_type_id, school_id } = filters;
  let query;
  const params = [];
  const conditions = [];
  if (school_id === 1){
     query = `
      SELECT s.abbreviation AS label, se.name, COUNT(c.id) AS case_count
      FROM schools s
      LEFT JOIN cases c ON s.id = c.school_id
      LEFT JOIN severity se ON c.severity_id = se.id
    `;
  } else {
    query = `
      SELECT b.name AS label, se.name, COUNT(c.id) AS case_count
      FROM buildings b
      LEFT JOIN cases c ON b.id = c.building_id
      LEFT JOIN severity se ON c.severity_id = se.id
      JOIN schools s ON s.id = b.school_id
    `;
    conditions.push(`s.id = $1`);
    params.push(school_id);
  }
  if (case_type_id !== undefined) {
    conditions.push(`c.case_type_id = ANY($${params.length + 1})`);
    params.push([case_type_id, 3]);
  }

  if (conditions.length > 0) {
    query += ` WHERE ` + conditions.join(' AND ');
  }

  query += `
    GROUP BY label, se.name
    ORDER BY label, se.name
  `;

  const result = await pool.query(query, params);
  return result.rows; 
};

const getCaseCountsByGender = async (filters = {}) => {
  const { case_type_id, school_id } = filters;
  let query;
  const params = [];
  const conditions = [];
  if (school_id === 1){
     query = `
      SELECT s.abbreviation AS name, se.label, COUNT(c.id) AS case_count
      FROM schools s
      LEFT JOIN cases c ON s.id = c.school_id
      LEFT JOIN sex se ON c.sex_id = se.id
    `;
  } else {
    query = `
      SELECT b.name AS name, se.label, COUNT(c.id) AS case_count
      FROM buildings b
      LEFT JOIN cases c ON b.id = c.building_id
      LEFT JOIN sex se ON c.sex_id = se.id
      JOIN schools s ON s.id = b.school_id
    `;
    conditions.push(`s.id = $1`);
    params.push(school_id);
  }
  if (case_type_id !== undefined) {
    conditions.push(`c.case_type_id = ANY($${params.length + 1})`);
    params.push([case_type_id, 3]);
  }

  if (conditions.length > 0) {
    query += ` WHERE ` + conditions.join(' AND ');
  }

  if (school_id === 1) {
    query += `
      GROUP BY s.abbreviation, se.label
      ORDER BY s.abbreviation, se.label
    `;
  } else {
    query += `
      GROUP BY b.name, se.label
      ORDER BY b.name, se.label
    `;
  }

  const result = await pool.query(query, params);
  return result.rows;  
};

const getCasesByStudentId = async(studentId) => {
    const result = await pool.query(`SELECT c.id, c.student_id, c.status, c.created_at, categories.name AS category, severity.name AS severity, users.name AS users FROM cases c LEFT JOIN categories categories ON c.category_id = categories.id LEFT JOIN severity severity ON c.severity_id = severity.id LEFT JOIN users users ON c.created_by = users.id WHERE c.student_id = $1 ORDER BY c.created_at DESC`, [studentId]);
    return result.rows;
};

const getAllCaseTypes = async() => {
    const result = await pool.query('SELECT * FROM case_type ORDER BY id ASC');
    return result.rows;
};
// Backend - return all categories with a flag for top 5
const getTopCategories = async (filters = {}) => {
  const { case_type_id, school_id } = filters;
  const params = [[case_type_id, 3]];

  let query = `
    SELECT
      cat.name AS category,
      COUNT(c.id) AS case_count,
      (COUNT(c.id) * 100.0 / SUM(COUNT(c.id)) OVER ()) AS percentage
    FROM
      cases c
    JOIN categories cat ON c.category_id = cat.id
  `;

  if (school_id > 1) {
    query += `
      JOIN buildings b ON c.building_id = b.id
      WHERE c.case_type_id = ANY($1) AND b.school_id = $2
    `;
    params.push(school_id);
  } else {
    query += ` WHERE c.case_type_id = ANY($1)`;
  }
  
  query += ` GROUP BY cat.name ORDER BY case_count DESC`;
  
  const result = await pool.query(query, params);
  return result.rows; 
};


const getTopSubCategories = async (filters = {}) => {
  const { case_type_id, school_id } = filters;
  const params = [[case_type_id, 3]];

  let query = `
    SELECT
      sc.name AS subcategory_name,
      COUNT(DISTINCT c.id) AS case_count,
      (COUNT(DISTINCT c.id) * 100.0 / SUM(COUNT(DISTINCT c.id)) OVER ()) AS percentage
    FROM
      cases c
    JOIN case_subcategories cs ON c.id = cs.case_id
    JOIN subcategories sc ON cs.subcategory_id = sc.id
  `;

  if (school_id > 1) {
    query += `
      JOIN buildings b ON c.building_id = b.id
      WHERE c.case_type_id = ANY($1) AND b.school_id = $2
    `;
    params.push(school_id);
  } else {
    query += ` WHERE c.case_type_id = ANY($1)`;
  }
  
  query += ` GROUP BY sc.name ORDER BY percentage DESC`;
  
  const result = await pool.query(query, params);
  return result.rows;
};


const getSubcategoriesByCaseId = async(case_id) => {
  const result = await pool.query(`SELECT s.id, s.name FROM case_subcategories cs JOIN subcategories s ON cs.subcategory_id = s.id WHERE cs.case_id = $1 ORDER BY s.name ASC`, [case_id]);
  return result.rows;
};

const getReportersByCaseType = async (filters = {}) => {
  const { case_type_id, school_id } = filters;
  let query = `
    SELECT 
      u.name AS user_name,
      s.name AS school_name,
      s.abbreviation AS school_short,
      COUNT(c.id) AS report_count
    FROM 
      cases c
    JOIN 
      users u ON c.created_by = u.id
    JOIN 
      schools s ON u.school_id = s.id
  `;
  const params = [];
  const conditions = [];
  
  if (case_type_id !== undefined) {
    conditions.push(`c.case_type_id = ANY($${params.length + 1})`);
    params.push([case_type_id, 3]);
  }
  if (school_id > 1) {
    conditions.push(`u.school_id = $${params.length + 1}`);
    params.push(school_id);
  }
  if (conditions.length > 0) {
    query += ` WHERE ` + conditions.join(' AND ');
  }

  query += `
    GROUP BY 
      u.id, u.name, s.name, s.abbreviation
    ORDER BY 
      report_count DESC
  `;

  const result = await pool.query(query, params);
  return result.rows;
};

const getCaseByIdForNotification = async(case_id, user_id) => {
  const result = await pool.query(`SELECT DISTINCT c.* FROM cases c JOIN notifications n ON n.case_id = c.id WHERE c.id = $1 AND n.receiver_id = $2 LIMIT 1`, [case_id, user_id]);
  return result.rows[0];
}

const getStaleCases = async() => {
  const result = await pool.query(`SELECT 
    c.*,
    EXTRACT(DAY FROM (NOW() - c.created_at)) AS days_stale
    FROM cases c 
    WHERE 
      (c.status = 'in progress' AND c.created_at < NOW() - INTERVAL '7 days')
      OR
      (c.status = 'on hold' AND c.created_at < NOW() - INTERVAL '14 days')`);
  return result.rows;
};

const reminderExists = async({case_id, receiver_id}) => {
  const result = await pool.query(`SELECT 1 FROM notifications WHERE case_id = $1 AND receiver_id = $2 AND type = 'reminder' AND created_at >= CURRENT_DATE LIMIT 1`, [case_id, receiver_id]);
  return result.rowCount > 0;
};

const getCaseStatisticsWithTimeSeries = async (period = 'day', filter = {}, user_id = null, access_level = null) => {
  // First, get the total counts
  const totalCounts = await getTotalCounts(filter, user_id, access_level);
  
  // Then, get the time series data for the line graph
  const timeSeriesData = await getCaseTimeSeries(period, filter, user_id, access_level);
  
  return {
    totals: totalCounts,
    timeSeries: timeSeriesData
  };
};

// Time series function for line graph
const getCaseTimeSeries = async (period = 'day', filter = {}, user_id = null, access_level = null) => {
  let dateTrunc, dateRange, interval;
  
  switch (period) {
    case 'day':
      dateTrunc = 'day';
      dateRange = '30 days';
      interval = '1 day';
      break;
    case 'week':
      dateTrunc = 'week';
      dateRange = '12 weeks';
      interval = '1 week';
      break;
    case 'month':
      dateTrunc = 'month';
      dateRange = '12 months';
      interval = '1 month';
      break;
    case 'year':
      dateTrunc = 'year';
      dateRange = '5 years';
      interval = '1 year';
      break;
    default:
      dateTrunc = 'day';
      dateRange = '30 days';
      interval = '1 day';
  }
  
  let baseQuery = `
    SELECT 
      DATE_TRUNC('${dateTrunc}', created_at) AS period,
      COUNT(*) AS total_cases,
      SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) AS resolved_cases,
      SUM(CASE WHEN status IN ('on hold', 'in progress') THEN 1 ELSE 0 END) AS open_cases
    FROM cases
    WHERE created_at >= NOW() - INTERVAL '${dateRange}'
  `;
  
  let sharedQuery = `
    SELECT 
      DATE_TRUNC('${dateTrunc}', c.created_at) AS period,
      COUNT(*) AS total_cases,
      SUM(CASE WHEN c.status = 'resolved' THEN 1 ELSE 0 END) AS resolved_cases,
      SUM(CASE WHEN c.status IN ('on hold', 'in progress') THEN 1 ELSE 0 END) AS open_cases
    FROM cases c
    INNER JOIN case_shares cs ON c.id = cs.case_id
    WHERE c.created_at >= NOW() - INTERVAL '${dateRange}'
    AND cs.shared_with_user_id = $1
  `;
  console.log(filter)
  let params = [];
  let i = 1;
  let sharedParams = [];
  let j = 2; // $1 is already user_id in sharedQuery
  if (filter.case_type_id) {
    baseQuery += ` AND case_type_id = ANY($${i})`;
    sharedQuery += ` AND c.case_type_id = ANY($${j})`;
    params.push([Number(filter.case_type_id), 3]);
    sharedParams.push([Number(filter.case_type_id), 3]);
    i++;
    j++;
  }
  if (filter.schoolIdQuery && filter.schoolIdQuery > 1 && access_level != 2) {
      baseQuery += ` AND school_id = $${i}`;
      params.push(filter.schoolIdQuery);
      i++;
  }
  console.log(access_level)
  // Add access level specific filters
  if (access_level === 1) {
    baseQuery += ` AND building_id = $${i} AND created_by = $${i+1}`;
    params.push(filter.building_id, user_id);
    i += 2;

  } else if (access_level === 2) {
    baseQuery += ` AND school_id = $${i}`;
    params.push(filter.school_id);
    i++;
  }

  baseQuery += ` GROUP BY period ORDER BY period`;
  sharedQuery += ` GROUP BY period ORDER BY period`;

  try {
    // Get base time series
    const baseResult = await pool.query(baseQuery, params);
    const baseData = baseResult.rows;

    // Get shared time series if user_id is provided
    let sharedData = [];
    if (user_id && !filter.case_id) {
      const sharedResult = await pool.query(sharedQuery, [user_id, ...sharedParams]);
      sharedData = sharedResult.rows;
    }
    // Combine the data (this is simplified - you might need more complex merging)
    const combinedData = [...baseData, ...sharedData];
      
    // Process for cumulative counts and fill gaps
    return processTimeSeriesData(combinedData, period);
  } catch (err) {
    console.error('Error fetching time series data:', err.message);
    throw err;
  }
};

// Helper function to process time series data
const processTimeSeriesData = (data, period) => {
  // Sort by period
  data.sort((a, b) => new Date(a.period) - new Date(b.period));
  
  // Generate cumulative counts
  let cumulativeTotal = 0;
  let cumulativeResolved = 0;
  let cumulativeOpen = 0;
  
  const processedData = data.map(item => {
    cumulativeTotal += parseInt(item.total_cases || 0);
    cumulativeResolved += parseInt(item.resolved_cases || 0);
    cumulativeOpen += parseInt(item.open_cases || 0);
    
    return {
      period: item.period,
      total: cumulativeTotal,
      resolved: cumulativeResolved,
      open: cumulativeOpen,
      new_cases: parseInt(item.total_cases || 0)
    };
  });
  
  return processedData;
};
const getTotalCounts = async (filter = {}, user_id = null, access_level = null) => {
  let baseQuery = `
    SELECT 
      COUNT(*) AS total_cases,
      SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) AS total_resolved,
      SUM(CASE WHEN status IN ('on hold', 'in progress') THEN 1 ELSE 0 END) AS total_open
    FROM cases
    WHERE 1=1
  `;
  
  let sharedQuery = `
    SELECT 
      COUNT(*) AS total_cases,
      SUM(CASE WHEN c.status = 'resolved' THEN 1 ELSE 0 END) AS total_resolved,
      SUM(CASE WHEN c.status IN ('on hold', 'in progress') THEN 1 ELSE 0 END) AS total_open
    FROM cases c
    INNER JOIN case_shares cs ON c.id = cs.case_id
    WHERE cs.shared_with_user_id = $1
  `;
  
  let params = [];
  let i = 1;
  let sharedParams = [];
  let j = 2; // $1 is already user_id in sharedQuery

  if (filter.case_type_id) {
    baseQuery += ` AND case_type_id = ANY($${i})`;
    sharedQuery += ` AND c.case_type_id = ANY($${j})`;
    params.push([Number(filter.case_type_id), 3]);
    sharedParams.push([Number(filter.case_type_id), 3]);
    i++;
    j++;
  }
  if (filter.schoolIdQuery && filter.schoolIdQuery > 1 && access_level != 2) {
      baseQuery += ` AND school_id = $${i}`;
      params.push(filter.schoolIdQuery);
      i++;
  }
  // Add access level specific filters
  if (access_level === 1) {
    baseQuery += `AND created_by = $${i}`;
    params.push(user_id);
    i += 1;
  } else if (access_level === 2) {
    baseQuery += ` AND school_id = $${i}`;
    params.push(filter.school_id);
    i++;
  }
  console.log("BASE QUERY", baseQuery)

  try {
    // Get base counts
    const baseResult = await pool.query(baseQuery, params);
    const baseCounts = baseResult.rows[0];

    // Get shared counts if user_id is provided
    let sharedCounts = { total_cases: 0, total_resolved: 0, total_open: 0 };
    if (user_id) {
      const sharedResult = await pool.query(sharedQuery, [user_id, ...sharedParams]);
      sharedCounts = sharedResult.rows[0];
    }
    
    // Combine counts (this might double-count some cases)
    const combinedCounts = {
      total_cases: parseInt(baseCounts.total_cases || 0) + parseInt(sharedCounts.total_cases || 0),
      total_resolved: parseInt(baseCounts.total_resolved || 0) + parseInt(sharedCounts.total_resolved || 0),
      total_open: parseInt(baseCounts.total_open || 0) + parseInt(sharedCounts.total_open || 0)
    };
    
    return combinedCounts;
  } catch (err) {
    console.error('Error fetching total counts:', err.message);
    throw err;
  }
};

const addCaseMedia = async({ case_id, filename, file_url, file_type }) => {
  const query = `INSERT INTO case_files(case_id, filename, file_url, file_type) VALUES ($1, $2, $3, $4) RETURNING *`;
  const values = [case_id, filename, file_url, file_type];
  const { rows } = await pool.query(query, values);
  return rows[0];
};

const getCaseMediaByCaseId = async(case_id) => {
  const result = await pool.query('SELECT * FROM case_files WHERE case_id = $1 ORDER BY id ASC', [case_id]);
  return result.rows;
};


module.exports = {
    getCategories,
    createCase,
    getSubCategoriesbyCategoryId,
    getCasesById,
    getCasesByUserId,
    getCasesByBuilding,
    getCasesBySchool,
    getCaseByUserId,
    getCaseByBuilding,
    getCaseBySchool,
    getCaseCountsBySchool,
    getAllCases,
    shareCase,
    getSharedCases,
    getSharesByCaseId,
    deleteCase,
    updateStatus,
    addCaseSubcategory,
    getCaseCountsBySchool,
    getCaseCountsByStatus,
    getCaseCountsBySeverity,
    getCaseCountsByGender,
    getCasesByStudentId,
    getAllCaseTypes,
    getTopCategories,
    getTopSubCategories,
    getSubcategoriesByCaseId,
    getReportersByCaseType,
    getStaleCases,
    reminderExists,
    getCaseStatisticsWithTimeSeries,
    getCaseTimeSeries,
    processTimeSeriesData,
    getTotalCounts,
    getCaseByIdForNotification,
    addCaseMedia,
    getCaseMediaByCaseId,
    getStatusHistory
};