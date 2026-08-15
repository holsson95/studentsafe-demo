const pool = require('../db');

const getAllSchools = async (exclude) => {
  let query = 'SELECT * FROM schools';
  const params = [];

  if (exclude!== undefined) {
    query += ' WHERE id != $1';
    params.push(exclude);
  }

  query += ' ORDER BY name ASC';

  const result = await pool.query(query, params);
  return result.rows;
};

const getSchoolById = async(id) => {
    const result = await pool.query('SELECT * FROM schools WHERE id = $1', [id]);
    return result.rows[0];
};

const getBuildingsBySchool = async(school_id) => {
    const result = await pool.query('SELECT * FROM buildings WHERE school_id = $1 ORDER BY name ASC', [school_id]);
    return result.rows;
};

const getBuildingById = async(id) => {
    const result = await pool.query('SELECT * FROM buildings WHERE id = $1', [id]);
    return result.rows[0];
};

module.exports = {
    getAllSchools,
    getSchoolById,
    getBuildingsBySchool,
    getBuildingById
};
