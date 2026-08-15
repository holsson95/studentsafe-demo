const pool = require('../db');

const findUserbyEmail = async(email) => {
    const result = await pool.query(
        'SELECT * FROM users WHERE email = $1', [email]);
        return result.rows[0];
};

const findDomainRecord = async (domain) => {
    const result = await pool.query(
        'SELECT * FROM school_domains WHERE domain = $1', [domain]
    );
    return result.rows[0];
};

const setGoogleId = async (userId, googleId) => {
    await pool.query('UPDATE users SET google_id = $1 WHERE id = $2', [googleId, userId]);
};

const updateFailedAttempts = async(userId, attempts) => {
    await pool.query(`UPDATE users SET failed_login_attempts = $1 WHERE id=$2`, [attempts, userId]);
};

const lockUser = async(userId, lockTime) => {
    await pool.query(`UPDATE users SET failed_login_attempts = 0, locked_until = $1 WHERE id = $2`, [lockTime, userId]);
};

const resetFailedAttempts = async(userId) => {
    await pool.query(`UPDATE users SET failed_login_attempts = 0, locked_until = NULL WHERE id = $1`, [userId]);
};

module.exports = {
    findUserbyEmail,
    findDomainRecord,
    setGoogleId,
    updateFailedAttempts,
    lockUser,
    resetFailedAttempts
};
