const pool = require('../db');

const searchQuery = async (query, user, options = {}) => {
    const searchEntry = `%${query.trim()}%`;
    const normalizedQuery = query.trim().toLowerCase();
    const keyword = `%${normalizedQuery}%`;
    const severityLevels = {
        high: 'HIGH',
        medium: 'MEDIUM',
        low: 'LOW'
    };
    const severityValue = severityLevels[normalizedQuery] || null;
    const isLevel3 = Number(user.access_level) === 3;
    const limit = Number(options.limit) || 12;
    const caseOffset = Number(options.caseOffset) || 0;
    const studentOffset = Number(options.studentOffset) || 0;
    console.log('Caseoffset', caseOffset, 'StudentOffset', studentOffset);
    let caseParams = [searchEntry, severityValue];
    let schoolClause = '';
    if(!isLevel3) {
        caseParams.push(user.school_id);
        schoolClause = `AND c.school_id = $${caseParams.length}`;
    }
    caseParams.push(limit);
    const caseLimitIndex = caseParams.length;
    caseParams.push(caseOffset);
    const caseOffsetIndex = caseParams.length;
    const casesQuery = `SELECT c.id, c.first_name || ' ' || c.last_name AS student_name, c.nickname, c.status, s.name AS severity, co.name AS cohort_name, c.created_at, cat.name AS category_name, n.name AS nationality, sc.name AS school_name, sc.abbreviation AS abbreviation FROM cases c LEFT JOIN severity s ON s.id = c.severity_id LEFT JOIN nationalities n ON n.id = c.nationality_id LEFT JOIN schools sc ON sc.id = c.school_id LEFT JOIN categories cat ON cat.id = c.category_id LEFT JOIN cohorts co ON co.id = c.cohort WHERE (c.first_name ILIKE $1 OR c.last_name ILIKE $1 OR (c.first_name || ' ' || c.last_name) ILIKE $1 OR c.status::text ILIKE $1 OR n.name ILIKE $1 OR sc.name ILIKE $1 OR sc.abbreviation ILIKE $1 OR ($2::text IS NOT NULL AND LOWER(s.name) = LOWER($2::text))) ${schoolClause} ORDER BY c.created_at DESC LIMIT $${caseLimitIndex}::int OFFSET $${caseOffsetIndex}::bigint`;
    const cases = await pool.query(casesQuery, caseParams);
    let studentParams = [searchEntry];
    let studentSchoolClause = '';
    if(!isLevel3) {
        studentParams.push(user.school_id);
        studentSchoolClause = `AND s.school_id = $${studentParams.length}`;
    }
    studentParams.push(limit);
    const studentLimitIndex = studentParams.length;
    studentParams.push(studentOffset);
    const studentOffsetIndex = studentParams.length;
    const studentsQuery = `SELECT s.id, s.first_name || ' ' || s.last_name AS student_name, s.nickname, c.name AS cohort_name, n.name AS nationality, sc.name AS school_name, sc.abbreviation AS abbreviation FROM students s LEFT JOIN cohorts c ON c.id = s.cohort LEFT JOIN schools sc ON sc.id = s.school_id LEFT JOIN nationalities n ON n.id = s.nationality_id WHERE (s.first_name ILIKE $1 OR s.last_name ILIKE $1 OR (s.first_name || ' ' || s.last_name) ILIKE $1 OR sc.name ILIKE $1 OR sc.abbreviation ILIKE $1) ${studentSchoolClause} ORDER BY s.first_name ASC LIMIT $${studentLimitIndex}::int OFFSET $${studentOffsetIndex}::bigint`;
    const students = await pool.query(studentsQuery, studentParams);
    return {
    cases: cases.rows,
    students: students.rows
    };
};

module.exports = {
    searchQuery
};
 