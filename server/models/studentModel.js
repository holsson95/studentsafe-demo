const pool = require('../db');
const { get } = require('../routes/notificationsRoute');

const createStudent = async (studentData) => {
    const { school_id, building_id, first_name, last_name, nickname, cohort, nationality_id, start_date } = studentData;
    const result = await pool.query(`INSERT INTO students (school_id, building_id, first_name, last_name, nickname, cohort, nationality_id, start_date) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`, 
        [school_id, building_id,first_name, last_name, nickname, cohort, nationality_id, start_date]);
        return result.rows[0];
};

const addStudentIfNotExists = async({ first_name, last_name, nickname, cohort, nationality_id, entry_date, school_id, building_id}) => {
    const trimmedName = `${first_name.trim()} ${last_name.trim()}`;
    const result = await pool.query(`SELECT * FROM students WHERE LOWER(first_name || ' ' || last_name) = LOWER($1)`,[trimmedName]);
    if (result.rows.length === 0){
        const insertResult = await pool.query(`INSERT INTO students(first_name, last_name, nickname, cohort, nationality_id, entry_date, school_id, building_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`, [first_name, last_name, nickname, cohort, nationality_id, entry_date, school_id, building_id]);
        return insertResult.rows[0];
    }
    return result.rows[0];
};

// const getAllStudents = async() => {
//     const result = await pool.query('SELECT DISTINCT s.id, s.first_name, s.last_name, s.nickname, s.cohort, s.school_id FROM students ORDER BY last_name ASC');
//     return result.rows;
// };

// const getStudentsByBuilding = async(building_id) => {
//     const result = await pool.query('SELECT * FROM students WHERE building_id = $1 ORDER BY last_name ASC', [building_id]);
//     return result.rows;
// };

// const getStudentsBySchool = async(school_id) => {
//     const result = await pool.query('SELECT * FROM students WHERE school_id = $1 ORDER BY last_name ASC', [school_id]);
//     return result.rows;
// };

const getStudentById = async (id) => {
    const result = await pool.query(
        `SELECT s.id, 
        INITCAP(LOWER(TRIM(s.first_name)) || ' ' || LOWER(TRIM(s.last_name))) AS student_name, 
        s.first_name, s.last_name, 
        s.nickname, 
        c.name AS cohort_name, 
        sc.name AS school_name, 
        n.name AS nationality_name,
        s.entry_date,
        s.school_id, 
        s.building_id 
        FROM students s 
        LEFT JOIN cohorts c ON s.cohort = c.id 
        LEFT JOIN schools sc ON s.school_id = sc.id 
        LEFT JOIN nationalities n ON s.nationality_id = n.id 
        WHERE s.id = $1`, 
        [id]);

    if(result.rows.length === 0){
        return null;
    }
    const student = result.rows[0];
    return {
        id: student.id,
        name: student.student_name,
        nickname: student.nickname,
        cohort: student.cohort_name,
        school: student.school_name,
        nationality: student.nationality_name || '-',
        status: getStudentStatus(student.entry_date),
        school_id: student.school_id,
        building_id: student.building_id
    };
};

const getAllStudents = async () => {
    const result = await pool.query(`SELECT s.id, INITCAP(LOWER(TRIM(s.first_name)) || ' ' || LOWER(TRIM(s.last_name))) AS student_name , s.first_name, s.last_name, s.nickname, c.name AS cohort_name, schools.name AS schools_name, buildings.name AS building_name, n.name AS nationality_name, COUNT(cs.id) AS case_count FROM students s LEFT JOIN cohorts c ON s.cohort = c.id LEFT JOIN schools schools ON s.school_id = schools.id LEFT JOIN buildings buildings ON s.building_id = buildings.id LEFT JOIN nationalities n ON s.nationality_id = n.id LEFT JOIN cases cs ON cs.student_id = s.id GROUP BY s.id, s.first_name, s.last_name, s.nickname, c.name, schools.name, buildings.name, n.name ORDER BY s.first_name ASC`);
    console.log(result.rows);
    return result.rows.map(student => ({
        id: student.id,
        name: student.student_name,
        nickname: student.nickname,
        cohort: student.cohort_name,
        school: student.schools_name,
        building: student.building_name,
        nationality: student.nationality_name || '-',
        case_count: Number(student.case_count)
    }));
};

const getStudentsByBuilding = async (building_id) => {
    const result = await pool.query(`SELECT s.id, INITCAP(LOWER(TRIM(s.first_name)) || ' ' || LOWER(TRIM(s.last_name))) AS student_name , s.first_name, s.last_name, s.nickname, c.name AS cohort_name, schools.name AS schools_name, buildings.name AS building_name, n.name AS nationality_name, COUNT(cs.id) AS case_count FROM students s LEFT JOIN cohorts c ON s.cohort = c.id LEFT JOIN schools schools ON s.school_id = schools.id LEFT JOIN buildings buildings ON s.building_id = buildings.id LEFT JOIN nationalities n ON s.nationality_id = n.id LEFT JOIN cases cs ON cs.student_id = s.id WHERE s.building_id = $1 GROUP BY s.id, s.first_name, s.last_name, s.nickname, c.name, schools.name, buildings.name, n.name ORDER BY s.first_name ASC`, [building_id]);
    console.log(result.rows);
    return result.rows.map(student => ({
        id: student.id,
        name: student.student_name,
        nickname: student.nickname,
        cohort: student.cohort_name,
        school: student.schools_name,
        building: student.building_name,
        nationality: student.nationality_name || '-',
        case_count: Number(student.case_count)
    }));
};

const getStudentsBySchool = async (school_id) => {
    const result = await pool.query(`SELECT s.id, INITCAP(LOWER(TRIM(s.first_name)) || ' ' || LOWER(TRIM(s.last_name))) AS student_name , s.first_name, s.last_name, s.nickname, c.name AS cohort_name, schools.name AS schools_name, buildings.name AS building_name, n.name AS nationality_name, COUNT(cs.id) AS case_count FROM students s LEFT JOIN cohorts c ON s.cohort = c.id LEFT JOIN schools schools ON s.school_id = schools.id LEFT JOIN buildings buildings ON s.building_id = buildings.id LEFT JOIN nationalities n ON s.nationality_id = n.id LEFT JOIN cases cs ON cs.student_id = s.id WHERE s.school_id = $1 GROUP BY s.id, s.first_name, s.last_name, s.nickname, c.name, schools.name, buildings.name, n.name ORDER BY s.first_name ASC`, [school_id]);
    console.log(result.rows);
    return result.rows.map(student => ({
        id: student.id,
        name: student.student_name,
        nickname: student.nickname,
        cohort: student.cohort_name,
        school: student.schools_name,
        building: student.building_name,
        nationality: student.nationality_name || '-',
        case_count: Number(student.case_count)
    }));
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

module.exports = {
    createStudent,
    getAllStudents,
    getStudentsByBuilding,
    getStudentsBySchool,
    getStudentById,
    // getStudentsFromCases,
    // getStudentsFromCasesByBuilding,
    // getStudentsFromCasesBySchool,
    addStudentIfNotExists,
    getStudentStatus
};

