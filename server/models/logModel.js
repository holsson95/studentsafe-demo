const pool = require('../db');

const createLog = async ({
    log_type,
    action_code,
    user_id,
    case_id = null,
    target_user_id = null
}) => {
    const result = await pool.query(
        `INSERT INTO audit_logs (log_type, action_code, user_id, case_id, target_user_id)
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [log_type, action_code, user_id, case_id, target_user_id]
    );
    return result.rows[0];
}

const getCaseLogs = async () => {
    const result = await pool.query(
        `SELECT al.*, u.name AS user_name FROM audit_logs al
         LEFT JOIN users u ON al.user_id = u.id
         WHERE al.log_type = 'case'`
    );
    return result.rows;
};

const getUserLogs = async () => {
    const result = await pool.query(
        `SELECT
            al.*,
            actor.name AS user_name,
            target.name AS target_user_name
         FROM audit_logs al
         LEFT JOIN users actor ON al.user_id = actor.id
         LEFT JOIN users target ON al.target_user_id = target.id
         WHERE al.log_type = 'user'
         ORDER BY al.created_at DESC`
    );

    return result.rows;
};
module.exports = {
    createLog,
    getCaseLogs,
    getUserLogs
};