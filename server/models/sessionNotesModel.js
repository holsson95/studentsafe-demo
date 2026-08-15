const pool = require('../db');

const getSubcategoriesByCaseId = async(case_id) => {
  const result = await pool.query(`SELECT s.id, s.name FROM case_subcategories cs JOIN subcategories s ON cs.subcategory_id = s.id WHERE cs.case_id = $1 ORDER BY s.name ASC`, [case_id]);
  return result.rows;
};

const getSessionNote = async(studentId) => {
    const result = await pool.query(`SELECT sn.*, u.name AS created_by_name FROM session_notes sn LEFT JOIN users u ON sn.created_by = u.id WHERE sn.student_id = $1 ORDER BY sn.created_at ASC`, [studentId]);
    return result.rows;
};

const getSessionNoteById = async(noteId) => {
    const result = await pool.query(`SELECT * FROM session_notes WHERE id=$1`, [noteId]);
    return result.rows[0];
};

const createSessionNote = async( data ) => {
    const { student_id, case_type_id, school_id, building_id, overview, observation_notes, follow_up_date, notes, created_by } = data;
    const result = await pool.query(`INSERT INTO session_notes (student_id, case_type_id, school_id, building_id, overview, observation_notes, follow_up_date, notes, created_by) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`, [ student_id, case_type_id, school_id, building_id, overview, observation_notes, follow_up_date, notes, created_by ]);

    return result.rows[0];
};

const getAllRoles = async() => {
    const result = await pool.query(`SELECT * FROM sn_role ORDER BY name ASC`);
    return result.rows;
};

const addPeoplePresent = async(sessionNoteId, people) => {
    if(!people.length) return [];
    const values = [];
    const placeholders = [];
    people.forEach((p, index) => {
        const base = index * 3;
        placeholders.push(`($${base + 1}, $${base + 2}, $${base + 3})`);
        values.push(sessionNoteId, p.name, p.role);
    });
    const result = await pool.query(`INSERT INTO sn_people_present (sn_id, name, role) VALUES ${placeholders.join(',')} RETURNING *;`, values);
    return result.rows;
};

const addedActions = async(sessionNoteId, actions) => {
    if(!actions.length) return [];
    const placeholders = actions.map((_, i) => `($1, $${i + 2})`).join(',');
    const values = [sessionNoteId, ...actions];
    const result = await pool.query(`INSERT INTO sn_actions_taken (sn_id, description) VALUES ${placeholders} RETURNING *`, values);
    return result.rows;
};

const addedOutcome = async(sessionNoteId, outcome) => {
    if(!outcome.length) return [];
    const placeholders = outcome.map((_, i) => `($1, $${i + 2})`).join(',');
    const values = [sessionNoteId, ...outcome];
    const result = await pool.query(`INSERT INTO sn_outcome (sn_id, description) VALUES ${placeholders} RETURNING *`, values);
    return result.rows;
};

const addedFuture = async(sessionNoteId, future) => {
    if(!future.length) return [];
    const placeholders = future.map((_, i) => `($1, $${i + 2})`).join(',');
    const values = [sessionNoteId, ...future];
    const result = await pool.query(`INSERT INTO sn_future_actions (sn_id, description) VALUES ${placeholders} RETURNING *`, values);
    return result.rows;
};

const getPeoplePresent = async(snId) => {
    const result = await pool.query('SELECT p.id, p.name, p.role, r.name AS role_name FROM sn_people_present p LEFT JOIN sn_role r ON p.role = r.id WHERE p.sn_id = $1', [snId]);
    return result.rows;
};

const getActionsTaken = async(snId) => {
    const result = await pool.query('SELECT description FROM sn_actions_taken WHERE sn_id = $1', [snId]);
    return result.rows.map(r => r.description);
};

const getOutcome = async(snId) => {
    const result = await pool.query('SELECT description FROM sn_outcome WHERE sn_id = $1', [snId]);
    return result.rows.map(r => r.description);
};

const getFutureActions = async(snId) => {
    const result = await pool.query('SELECT description FROM sn_future_actions WHERE sn_id = $1', [snId]);
    return result.rows.map(r => r.description);
};
const shareSessionNote = async({ sn_id, shared_with_user_id, shared_by_user_id }) => {
    const result = await pool.query(`INSERT INTO sn_shares (sn_id, shared_with_user_id, shared_by_user_id) VALUES ($1, $2, $3) RETURNING *`, [sn_id, shared_with_user_id, shared_by_user_id]);
    return result.rows[0];
};

const getSharedSessionNotes = async(studentId, user_id) => {
    const result = await pool.query(`SELECT DISTINCT sn.*, u.name AS created_by_name FROM session_notes sn JOIN sn_shares ss ON ss.sn_id = sn.id LEFT JOIN users u ON sn.created_by = u.id WHERE sn.student_id = $1 AND ss.shared_with_user_id = $2 ORDER BY sn.created_at DESC`, [studentId, user_id]);
    return result.rows;
};

const getSharesBySessionNoteId = async(sn_id) => {
    const result = await pool.query(`SELECT ss.*, u.name AS shared_with_name FROM sn_shares ss JOIN users u ON ss.shared_with_user_id = u.id WHERE ss.sn_id = $1`, [sn_id]);
    return result.rows;
};

const getSessionNotesByUser = async(studentId, user_id) => {
    const result = await pool.query(`SELECT DISTINCT sn.*, u.name AS created_by_name FROM session_notes sn LEFT JOIN users u on sn.created_by = u.id LEFT JOIN sn_shares ss ON ss.sn_id = sn.id WHERE sn.student_id = $1 AND (sn.created_by = $2 OR ss.shared_with_user_id = $2) ORDER BY sn.created_at DESC`, [studentId, user_id]);
    return result.rows;
};

const getSessionNotesBySchool = async(studentId, school_id) => {
    const result = await pool.query(`SELECT sn.*, u.name AS created_by_name FROM session_notes sn LEFT JOIN users u ON sn.created_by = u.id WHERE sn.student_id = $1 AND sn.school_id = $2 ORDER BY sn.created_at DESC`, [studentId, school_id]);
    return result.rows;
};


module.exports = {
getSubcategoriesByCaseId,
getSessionNote,
getSessionNoteById,
createSessionNote,
getAllRoles,
addPeoplePresent,
addedActions,
addedOutcome,
addedFuture,
getActionsTaken,
getFutureActions,
getOutcome,
getPeoplePresent,
shareSessionNote,
getSharedSessionNotes,
getSharesBySessionNoteId,
getSessionNotesBySchool,
getSessionNotesByUser
};