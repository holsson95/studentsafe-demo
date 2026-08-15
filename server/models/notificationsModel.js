const pool = require('../db');

const createNotif = async ({ receiver_id, message,  created_by_id, case_id = null, session_note_id = null, treatment_plan_id = null, case_share_id = null, type = 'event' }) => {
    const result = await pool.query(`INSERT INTO notifications (receiver_id, message, created_by_id, case_id, session_note_id, treatment_plan_id, case_share_id, type) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *;`, [receiver_id, message, created_by_id, case_id, session_note_id, treatment_plan_id, case_share_id, type]);

    return result.rows[0];
};

const getUserNotif = async (receiver_id) => {
    const result = await pool.query(`SELECT n.*, n.type, COALESCE(u.name, 'SYSTEM') AS submitted_by_name, COALESCE(INITCAP(u.role), 'SYSTEM') AS submitted_by_role, s.name AS severity_name FROM notifications n LEFT JOIN users u on n.created_by_id = u.id LEFT JOIN cases c ON n.case_id = c.id LEFT JOIN severity s ON c.severity_id = s.id WHERE n.receiver_id = $1 ORDER BY n.created_at DESC`, [receiver_id]);

    return result.rows;
};

const getNotifById = async (id, receiver_id) => {
    const result = await pool.query(`SELECT * FROM notifications WHERE id = $1 AND receiver_id = $2`, [id, receiver_id]); 
    return result.rows[0];
};

const deleteNotif = async (id, receiver_id) => {
    const result = await pool.query('DELETE FROM notifications WHERE id = $1 AND receiver_id = $2 RETURNING *', [id, receiver_id]);
    return result.rowCount > 0;
};

const deleteAllReadNotif = async (receiver_id) => {
    const result = await pool.query('DELETE FROM notifications WHERE receiver_id = $1 AND is_read = true', [receiver_id]);
    return result.rowCount;
};

const markAsRead = async (id) => {
    const result = await pool.query('UPDATE notifications SET is_read = TRUE WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
};

const markAllAsRead = async (receiver_id) => {
    const result = await pool.query('UPDATE notifications SET is_read = TRUE WHERE receiver_id = $1 RETURNING *', [receiver_id]);
    return result;
};

const reminderSentToday = async({case_id, receiver_id}) => {
    const result = await pool.query(`SELECT 1 FROM notifications WHERE case_id = $1 AND receiver_id = $2 AND type = 'reminder' AND DATE(created_at) = CURRENT_DATE LIMIT 1`, [case_id, receiver_id]);
    return result.rowCount > 0;
};


module.exports = {
    createNotif,
    getUserNotif,
    deleteNotif,
    deleteAllReadNotif,
    markAsRead,
    getNotifById,
    markAllAsRead,
    reminderSentToday
};