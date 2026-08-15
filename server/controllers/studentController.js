const studentModel = require('../models/studentModel');
const pool = require('../db');

// ---------------------------------------------------------------------------
// Simple in-memory rate limiter for the student search endpoint.
// Limits to 30 requests per minute per IP to prevent PII scraping.
// ---------------------------------------------------------------------------
const rateLimitStore = new Map();
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX       = 30;

function isRateLimited(ip) {
  const now   = Date.now();
  const entry = rateLimitStore.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }
  entry.count++;
  return entry.count > RATE_LIMIT_MAX;
}

// Purge stale entries to prevent unbounded memory growth
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of rateLimitStore.entries()) {
    if (now > entry.resetAt) rateLimitStore.delete(ip);
  }
}, RATE_LIMIT_WINDOW_MS);

// const createStudent = async (req, res) => {
//     try{
//         const newStudent = await studentModel.createStudent(req.body);
//         res.status(201).json(newStudent);
//     } catch (err) {
//         console.error('Error creating student:', err.message, '\nFull error:', err);
//         res.status(500).json({ error: 'Error creating student' });
//     }
// };

// const getStudents = async (req, res) => {
//     const { access_level, school_id, building_id } = req.user;
//     console.log(`Access level: ${access_level}`);

//     try{
//         let students;

//         if (access_level === 1) {
//             students = await studentModel.getStudentsByBuilding(building_id);
//         } else if (access_level === 2) {
//             students = await studentModel.getStudentsBySchool(school_id);
//         } else if (access_level === 3) {
//             students = await studentModel.getAllStudents();
//         } else if (access_level === 0) {
//             return res.status(403).json({message: 'App admin cannot access student data'});
//         } else {
//             return res.status(403).json({ message: 'Access level not recognized'});
//         }
//         res.json(students);
//     } catch (err) {
//         console.error('Error creating student:', err);
//         res.status(500).json({ error: 'Error creating student' });
//     }
// };

const getStudentById = async(req, res) => {
    const { id } = req.params;

    try{
        const student = await studentModel.getStudentById(id);
        if(!student){
            return res.status(404).json({ message: 'Student not found' });
        }
        res.json(student);
    } catch (err) {
        res.status(500).json({error: 'Failed to fetch student data', err});
    }
};

const getStudents = async(req, res) => {
    const { access_level, school_id, building_id } = req.user;

    try{
        let students;
        
        if (access_level === 1) {
            students = await studentModel.getStudentsByBuilding(building_id);
        } else if (access_level === 2) {
            students = await studentModel.getStudentsBySchool(school_id);
        } else if (access_level === 3) {
            students = await studentModel.getAllStudents();
        } else if (access_level === 0) {
            return res.status(403).json({message: 'App admin cannot access student data'});
        } else {
            return res.status(403).json({ message: 'Access level not recognized'});
        }
        res.json(students);
    } catch (err) {
        console.error('Error fetching student:', err);
        res.status(500).json({ error: 'Error fetching student' });
    }
}

// ---------------------------------------------------------------------------
// GET /students/search?q=&building_id=&cohort_id=
// Searches alma_students for the live case-filing dropdown.
// Requires: authenticated session, building AND cohort selected in form.
// Returns: max 20 active students matching the query, ordered by last_name.
// ---------------------------------------------------------------------------
const searchAlmaStudents = async (req, res) => {
  // Rate limit check
  const ip = req.ip || req.socket?.remoteAddress || 'unknown';
  if (isRateLimited(ip)) {
    return res.status(429).json({ message: 'Too many requests. Please slow down.' });
  }

  const { q, building_id, cohort_id } = req.query;

  if (!q || q.length < 2) {
    return res.status(400).json({ message: 'Query must be at least 2 characters.' });
  }

  try {
    // Resolve building_id → application_id (Alma app ID string)
    let applicationId = null;
    if (building_id) {
      const appRes = await pool.query(
        `SELECT a.school_app_id
         FROM buildings b
         JOIN alma_school_app_id a ON b.alma_app_school_id = a.id
         WHERE b.id = $1`,
        [building_id]
      );
      applicationId = appRes.rows[0]?.school_app_id || null;
    }

    // Resolve cohort_id → Alma tag for matching against alma_students.cohort.
    // Use alma_tag when set (Alma's naming may differ from our display name);
    // fall back to name if alma_tag is null.
    let cohortName = null;
    if (cohort_id) {
      const cohortRes = await pool.query(
        `SELECT name, alma_tag FROM cohorts WHERE id = $1`,
        [cohort_id]
      );
      cohortName = cohortRes.rows[0]?.alma_tag || cohortRes.rows[0]?.name || null;
    }

    // Build dynamic query — only active students, ILIKE on all name fields
    const params = [`%${q}%`];
    let paramIdx = 2;

    let sql = `
      SELECT
        als.id,
        als.alma_student_id,
        als.application_id,
        als.full_name,
        als.first_name,
        als.middle_name,
        als.last_name,
        als.preferred_name,
        als.gender,
        als.cohort,
        als.nationality,
        als.enrollment_date,
        n.id AS nationality_id
      FROM alma_students als
      LEFT JOIN nationalities n ON LOWER(n.name) = LOWER(als.nationality)
      WHERE als.is_active = TRUE
        AND (
          als.first_name    ILIKE $1
          OR als.last_name  ILIKE $1
          OR als.middle_name ILIKE $1
          OR als.preferred_name ILIKE $1
        )
    `;

    if (applicationId) {
      sql += ` AND als.application_id = $${paramIdx}`;
      params.push(applicationId);
      paramIdx++;
    }

    if (cohortName) {
      sql += ` AND als.cohort = $${paramIdx}`;
      params.push(cohortName);
      paramIdx++;
    }

    sql += ` ORDER BY als.last_name ASC LIMIT 20`;

    const result = await pool.query(sql, params);
    res.json(result.rows);
  } catch (err) {
    // Do not expose DB errors or stack traces to the frontend
    console.error('[Student Search] Error:', err.message);
    res.status(500).json({ message: 'Search failed.' });
  }
};

module.exports = {
    // createStudent,
    getStudents,
    getStudentById,
    searchAlmaStudents,
    // getStudentsFromCases
};