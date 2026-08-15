const pool = require('../db');

const findByEmail = async(email) => {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0];
};

const getUserById = async(id) => {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0];
};

const getUsersByIds = async(userIds) => {
    const result = await pool.query(`SELECT * FROM users WHERE id = ANY($1) AND is_active = TRUE`, [userIds]);
    return result.rows;
};

const createUser = async({ name, email, password_hash, role, school_id, building_id, access_level, is_active}) => {
    const result = await pool.query(`INSERT INTO users (name, email, password_hash, role, school_id, building_id, access_level, is_active) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id, name, email, role, school_id, building_id, access_level, is_active`, [name, email, password_hash, role, school_id, building_id, access_level, is_active]);
    return result.rows[0];
};

const getAllUsers = async() => {
    const result = await pool.query(`SELECT users.*, schools.name AS school_name FROM users LEFT JOIN schools ON users.school_id = schools.id ORDER BY name ASC`);
    return result.rows;
};

const deleteUser = async(id) => {
    const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
};

const deactivateUser = async (id) => {
    const result = await pool.query('UPDATE users SET is_active = FALSE WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
};

const updateUser = async(id, fields) => {
    const keys = Object.keys(fields).filter(key => fields[key] != undefined);
    const values = keys.map(key => fields[key]);

    if(keys.length === 0) return null;

    const setClause = keys.map((key, i) => `${key} = $${i+1}`).join(', ');

    const query = `UPDATE users SET ${setClause} WHERE id = $${keys.length + 1} RETURNING id, name, email, role, school_id, building_id, access_level, is_active`;
    const result = await pool.query(query, [...values, id]);
    return result.rows[0];
};

const getUsersBySchoolAndLevel = async(school_id, access_level) => {
    const result = await pool.query(`SELECT * FROM users WHERE school_id = $1 AND access_level = $2 AND is_active = TRUE ORDER BY  name`, [school_id, access_level]);
    return result.rows;
};

const getUsersByLevel = async(access_level) => {
    const result = await pool.query(`SELECT * FROM users WHERE access_level = $1`, [access_level]);
    return result.rows;
};

const getLevel1UsersByBuilding = async (building_id) => {
    const result = await pool.query(`SELECT id FROM users WHERE building_id = $1 AND access_level = 1 AND is_active = TRUE`, [building_id]);
    return result.rows;
};

const getLevel2UsersBySchool = async (school_id) => {
    const result = await pool.query(`SELECT id FROM users WHERE access_level = 2 AND school_id = $1 AND is_active = TRUE`, [school_id]);
    return result.rows;
};

const bulkCreateUsers = async (users) => {
    let created = 0;
    let skipped = 0;
    const errors = [];

    for (const u of users) {
        try {
            const schoolResult = await pool.query(
                'SELECT id FROM schools WHERE LOWER(name) = LOWER($1)', [u.school]
            );
            if (schoolResult.rows.length === 0) {
                errors.push({ row: u.email, reason: `School not found: ${u.school}` });
                continue;
            }
            const school_id = schoolResult.rows[0].id;

            const existing = await pool.query('SELECT id FROM users WHERE email = $1', [u.email]);
            if (existing.rows.length > 0) {
                skipped++;
                continue;
            }

            await pool.query(
                `INSERT INTO users (name, email, password_hash, role, school_id, access_level, is_active)
                 VALUES ($1, $2, NULL, $3, $4, $5, TRUE)`,
                [u.name, u.email, u.role, school_id, Number(u.access_level)]
            );
            created++;
        } catch (err) {
            errors.push({ row: u.email, reason: err.message });
        }
    }

    return { created, skipped, errors };
};

module.exports = {
    findByEmail,
    getUserById,
    getUsersByIds,
    createUser,
    getAllUsers,
    deleteUser,
    // deactivateUser,
    updateUser,
    getUsersBySchoolAndLevel,
    getUsersByLevel,
    getLevel1UsersByBuilding,
    getLevel2UsersBySchool,
    bulkCreateUsers
};