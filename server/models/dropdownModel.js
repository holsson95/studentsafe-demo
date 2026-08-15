const pool = require('../db');

const getDropdownData = async () => {
    const [nationality] = await Promise.all([
        pool.query('SELECT id, name FROM nationalities ORDER BY name ASC')
    ]);
    return {
        nationality: nationality.rows
    }
};

const getCohortsByBuilding = async(buildingId) => {
    const query = `SELECT id, name FROM cohorts WHERE building_id = $1 ORDER BY name ASC`;
    const { rows } = await pool.query(query, [buildingId]);
    return rows;
};
const getCategories = async (caseTypeId = null) => {
    let query;
    let params = [];
    if (caseTypeId) {
        query = `SELECT * FROM categories WHERE case_type_id = ANY($1) AND is_active = true ORDER BY name ASC`;
        params = [[Number(caseTypeId), 3]];
    } else {
        query = `SELECT * FROM categories WHERE is_active = true ORDER BY name ASC`;
    }
    const { rows } = await pool.query(query, params);
    return rows;
};

const getSpecByCategory = async (categoryId) => {
    const query = `SELECT id, name FROM subcategories WHERE category_id = $1 AND is_active = true ORDER BY name ASC`;
    const { rows } = await pool.query(query, [categoryId]);
    return rows;
};

const getUsersBySchool = async(schoolId, currentUserId) => {
    const query = `SELECT id, name FROM users WHERE ((school_id = $1 AND access_level IN (1, 2)) OR access_level = 3) AND is_active = true AND id != $2 ORDER BY name ASC`;
    const { rows } = await pool.query(query, [schoolId, currentUserId]);
    return rows;
};

const getSchoolsForAdmin = async() => {
    const query = 'SELECT id, name FROM schools ORDER BY id ASC';
    const { rows } = await pool.query(query);
    return rows;
};

const getBuildingsForAdmin = async(school_id) => {
    const query = 'SELECT id, name FROM buildings WHERE school_id = $1 ORDER BY name ASC';
    const { rows } = await pool.query(query, [school_id]);
    return rows;
};



const getAdminCategories = async () => {
    const query = `
        SELECT c.id, c.name, c.case_type_id, c.is_active,
               ct.name AS case_type_name,
               COALESCE(
                 json_agg(
                   json_build_object('id', s.id, 'name', s.name)
                   ORDER BY s.name
                 ) FILTER (WHERE s.id IS NOT NULL AND s.is_active = true),
                 '[]'
               ) AS subcategories
        FROM categories c
        LEFT JOIN case_type ct ON c.case_type_id = ct.id
        LEFT JOIN subcategories s ON s.category_id = c.id
        GROUP BY c.id, c.name, c.case_type_id, c.is_active, ct.name
        ORDER BY c.name ASC
    `;
    const { rows } = await pool.query(query);
    return rows;
};

const getAdminCategoryById = async (id) => {
    const catResult = await pool.query(
        `SELECT c.id, c.name, c.case_type_id, ct.name AS case_type_name
         FROM categories c
         LEFT JOIN case_type ct ON c.case_type_id = ct.id
         WHERE c.id = $1`,
        [id]
    );
    if (!catResult.rows.length) return null;
    const subsResult = await pool.query(
        `SELECT id, name FROM subcategories WHERE category_id = $1 AND is_active = true ORDER BY name ASC`,
        [id]
    );
    return { ...catResult.rows[0], subcategories: subsResult.rows };
};

const createCategories = async (entries) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        for (const entry of entries) {
            if (entry.type === 'new') {
                const { rows } = await client.query(
                    `INSERT INTO categories (name, case_type_id) VALUES ($1, $2) RETURNING id`,
                    [entry.name, entry.case_type_id]
                );
                const catId = rows[0].id;
                for (const subName of (entry.subcategories || [])) {
                    if (subName.trim()) {
                        await client.query(
                            `INSERT INTO subcategories (name, category_id, case_type_id) VALUES ($1, $2, $3)`,
                            [subName.trim(), catId, entry.case_type_id]
                        );
                    }
                }
            } else {
                const parent = await client.query(
                    `SELECT case_type_id FROM categories WHERE id = $1`,
                    [entry.category_id]
                );
                const caseTypeId = parent.rows[0]?.case_type_id;
                if (entry.subcategory_name && entry.subcategory_name.trim()) {
                    await client.query(
                        `INSERT INTO subcategories (name, category_id, case_type_id) VALUES ($1, $2, $3)`,
                        [entry.subcategory_name.trim(), entry.category_id, caseTypeId]
                    );
                }
            }
        }
        await client.query('COMMIT');
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
};

const updateCategory = async (id, { name, case_type_id, subcategories }) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        await client.query(
            `UPDATE categories SET name = $1, case_type_id = $2 WHERE id = $3`,
            [name, case_type_id, id]
        );
        await client.query(
            `UPDATE subcategories SET case_type_id = $1 WHERE category_id = $2 AND is_active = true`,
            [case_type_id, id]
        );
        for (const sub of (subcategories || [])) {
            if (sub.remove && sub.id) {
                await client.query(
                    `UPDATE subcategories SET is_active = false WHERE id = $1`,
                    [sub.id]
                );
            } else if (sub.id) {
                await client.query(
                    `UPDATE subcategories SET name = $1 WHERE id = $2`,
                    [sub.name, sub.id]
                );
            } else if (sub.name && sub.name.trim()) {
                await client.query(
                    `INSERT INTO subcategories (name, category_id, case_type_id) VALUES ($1, $2, $3)`,
                    [sub.name.trim(), id, case_type_id]
                );
            }
        }
        await client.query('COMMIT');
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
};

const deleteCategory = async (id) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        await client.query(`UPDATE subcategories SET is_active = false WHERE category_id = $1`, [id]);
        await client.query(`UPDATE categories SET is_active = false WHERE id = $1`, [id]);
        await client.query('COMMIT');
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
};

const addSubcategory = async ({ name, category_id }) => {
    const parent = await pool.query(`SELECT case_type_id FROM categories WHERE id = $1`, [category_id]);
    const case_type_id = parent.rows[0]?.case_type_id;
    const { rows } = await pool.query(
        `INSERT INTO subcategories (name, category_id, case_type_id) VALUES ($1, $2, $3) RETURNING *`,
        [name.trim(), category_id, case_type_id]
    );
    return rows[0];
};

const deleteSubcategory = async (id) => {
    await pool.query(`UPDATE subcategories SET is_active = false WHERE id = $1`, [id]);
};

module.exports = {
    getDropdownData,
    getCohortsByBuilding,
    getCategories,
    getSpecByCategory,
    getUsersBySchool,
    getSchoolsForAdmin,
    getBuildingsForAdmin,
    getAdminCategories,
    getAdminCategoryById,
    createCategories,
    updateCategory,
    deleteCategory,
    addSubcategory,
    deleteSubcategory,
};