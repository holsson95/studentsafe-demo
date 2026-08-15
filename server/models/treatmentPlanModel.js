const pool = require('../db');

const getTreatmentPlan = async(studentId) => {
    const result = await pool.query(`SELECT tp.*, u.name AS created_by_name FROM treatment_plan tp LEFT JOIN users u ON tp.created_by = u.id WHERE tp.student_id = $1 ORDER BY tp.created_at ASC`, [studentId]);
    return result.rows;
};

const getTreatmentPlanById = async(planId) => {
    const result = await pool.query(`
        SELECT 
            tp.*,
            u.name AS created_by_name,
            COALESCE(acad_support.acad_support, '[]') AS acad_support,
            COALESCE(concerns.concerns, '[]') AS concerns,
            COALESCE(emotional_support.emotional_support, '[]') AS emotional_support,
            COALESCE(follow_up.follow_up, '[]') AS follow_up,
            COALESCE(long_term_goals.long_term_goals, '[]') AS long_term_goals,
            COALESCE(metrics.metrics, '[]') AS metrics,
            COALESCE(parental_involvement.parental_involvement, '[]') AS parental_involvement,
            COALESCE(peer_interaction.peer_interaction, '[]') AS peer_interaction,
            COALESCE(short_term_goals.short_term_goals, '[]') AS short_term_goals,
            COALESCE(skill_dev.skill_dev, '[]') AS skill_dev
        FROM treatment_plan tp
        LEFT JOIN users u ON u.id = tp.created_by
        LEFT JOIN (
            SELECT tp_id, jsonb_agg(description) AS acad_support
            FROM tp_acad_support GROUP BY tp_id
        ) acad_support ON acad_support.tp_id = tp.id
        LEFT JOIN (
            SELECT tp_id, jsonb_agg(description) AS concerns
            FROM tp_concerns GROUP BY tp_id
        ) concerns ON concerns.tp_id = tp.id
        LEFT JOIN (
            SELECT tp_id, jsonb_agg(description) AS emotional_support
            FROM tp_emotional_support GROUP BY tp_id
        ) emotional_support ON emotional_support.tp_id = tp.id
        LEFT JOIN (
            SELECT tp_id, jsonb_agg(description) AS follow_up
            FROM tp_follow_up GROUP BY tp_id
        ) follow_up ON follow_up.tp_id = tp.id
        LEFT JOIN (
            SELECT tp_id, jsonb_agg(description) AS long_term_goals
            FROM tp_long_term_goals GROUP BY tp_id
        ) long_term_goals ON long_term_goals.tp_id = tp.id
        LEFT JOIN (
            SELECT tp_id, jsonb_agg(description) AS metrics
            FROM tp_metrics GROUP BY tp_id
        ) metrics ON metrics.tp_id = tp.id
        LEFT JOIN (
            SELECT tp_id, jsonb_agg(description) AS parental_involvement
            FROM tp_parental_involvement GROUP BY tp_id
        ) parental_involvement ON parental_involvement.tp_id = tp.id
        LEFT JOIN (
            SELECT tp_id, jsonb_agg(description) AS peer_interaction
            FROM tp_peer_interaction GROUP BY tp_id
        ) peer_interaction ON peer_interaction.tp_id = tp.id
        LEFT JOIN (
            SELECT tp_id, jsonb_agg(description) AS short_term_goals
            FROM tp_short_term_goals GROUP BY tp_id
        ) short_term_goals ON short_term_goals.tp_id = tp.id
        LEFT JOIN (
            SELECT tp_id, jsonb_agg(description) AS skill_dev
            FROM tp_skill_dev GROUP BY tp_id
        ) skill_dev ON skill_dev.tp_id = tp.id
        WHERE tp.id = $1
    `, [planId]);

    console.log('treatment plan: ', result.rows[0]);
    return result.rows[0];
};

const createTreatmentPlan = async( data ) => {
    const { student_id, case_type_id, school_id, building_id, student_overview, notes, created_by, created_at } = data;
    const result = await pool.query(`INSERT INTO treatment_plan (student_id, case_type_id, school_id, building_id, student_overview, notes, created_by) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`, [ student_id, case_type_id, school_id, building_id, student_overview, notes, created_by ]);

    return result.rows[0];
};


const addedAcadSupport = async(treatmentPlanId, academicSupport) => {
    if(!academicSupport.length) return [];
    const placeholders = academicSupport.map((_, i) => `($1, $${i + 2})`).join(',');
    const description = [treatmentPlanId, ...academicSupport];
    const result = await pool.query(`INSERT INTO tp_acad_support (tp_id, description) VALUES ${placeholders} RETURNING *`, description);
    return result.rows;
};

const addedConcerns = async(treatmentPlanId, concerns) => {
    if(!concerns.length) return [];
    const placeholders = concerns.map((_, i) => `($1, $${i + 2})`).join(',');
    const description = [treatmentPlanId, ...concerns];
    const result = await pool.query(`INSERT INTO tp_concerns (tp_id, description) VALUES ${placeholders} RETURNING *`, description);
    return result.rows;
};

const addedEmotionalSupport = async(treatmentPlanId, emotionalSupport) => {
    if(!emotionalSupport.length) return [];
    const placeholders = emotionalSupport.map((_, i) => `($1, $${i + 2})`).join(',');
    const description = [treatmentPlanId, ...emotionalSupport];
    const result = await pool.query(`INSERT INTO tp_emotional_support (tp_id, description) VALUES ${placeholders} RETURNING *`, description);
    return result.rows;
};

const addedFollowUp = async(treatmentPlanId, followUp) => {
    if(!followUp.length) return [];
    const placeholders = followUp.map((_, i) => `($1, $${i + 2})`).join(',');
    const description = [treatmentPlanId, ...followUp];
    const result = await pool.query(`INSERT INTO tp_follow_up (tp_id, description) VALUES ${placeholders} RETURNING *`, description);
    return result.rows;
};

const addedLongTermGoals = async(treatmentPlanId, longTermGoals) => {
    if(!longTermGoals.length) return [];
    const placeholders = longTermGoals.map((_, i) => `($1, $${i + 2})`).join(',');
    const description = [treatmentPlanId, ...longTermGoals];
    const result = await pool.query(`INSERT INTO tp_long_term_goals (tp_id, description) VALUES ${placeholders} RETURNING *`, description);
    return result.rows;
};

const addedShortTermGoals = async(treatmentPlanId, shortTermGoals) => {
    if(!shortTermGoals.length) return [];
    const placeholders = shortTermGoals.map((_, i) => `($1, $${i + 2})`).join(',');
    const description = [treatmentPlanId, ...shortTermGoals];
    const result = await pool.query(`INSERT INTO tp_short_term_goals (tp_id, description) VALUES ${placeholders} RETURNING *`, description);
    return result.rows;
};

const addedMetrics = async(treatmentPlanId, metrics) => {
    if(!metrics.length) return [];
    const placeholders = metrics.map((_, i) => `($1, $${i + 2})`).join(',');
    const description = [treatmentPlanId, ...metrics];
    const result = await pool.query(`INSERT INTO tp_metrics (tp_id, description) VALUES ${placeholders} RETURNING *`, description);
    return result.rows;
};

const addedParentalInvolvement = async(treatmentPlanId, parentalInvolvement) => {
    if(!parentalInvolvement.length) return [];
    const placeholders = parentalInvolvement.map((_, i) => `($1, $${i + 2})`).join(',');
    const description = [treatmentPlanId, ...parentalInvolvement];
    const result = await pool.query(`INSERT INTO tp_parental_involvement (tp_id, description) VALUES ${placeholders} RETURNING *`, description);
    return result.rows;
};

const addedPeerInteraction = async(treatmentPlanId, peerInteraction) => {
    if(!peerInteraction.length) return [];
    const placeholders = peerInteraction.map((_, i) => `($1, $${i + 2})`).join(',');
    const description = [treatmentPlanId, ...peerInteraction];
    const result = await pool.query(`INSERT INTO tp_peer_interaction (tp_id, description) VALUES ${placeholders} RETURNING *`, description);
    return result.rows;
};

const addedSkillDev = async(treatmentPlanId, skillDevelopment) => {
    if(!skillDevelopment.length) return [];
    const placeholders = skillDevelopment.map((_, i) => `($1, $${i + 2})`).join(',');
    const description = [treatmentPlanId, ...skillDevelopment];
    const result = await pool.query(`INSERT INTO tp_skill_dev (tp_id, description) VALUES ${placeholders} RETURNING *`, description);
    return result.rows;
};
const shareTreatmentPlan = async({ tp_id, shared_with_user_id, shared_by_user_id }) => {
    const result = await pool.query(`INSERT INTO tp_shares (tp_id, shared_with_user_id, shared_by_user_id) VALUES ($1, $2, $3) RETURNING *`, [tp_id, shared_with_user_id, shared_by_user_id]);
    return result.rows[0];
};

const getSharedTreatmentPlans = async(studentId, user_id) => {
    const result = await pool.query(`SELECT DISTINCT tp.*, u.name AS created_by_name FROM treatment_plan tp JOIN tp_shares ts ON ts.tp_id = tp.id LEFT JOIN users u ON tp.created_by = u.id WHERE tp.student_id = $1 AND ts.shared_with_user_id = $2 ORDER BY tp.created_at DESC`, [studentId, user_id]);
    return result.rows;
};

const getSharesByTreatmentPlanId = async(tp_id) => {
    const result = await pool.query(`SELECT ss.*, u.name AS shared_with_name FROM tp_shares ss JOIN users u ON ss.shared_with_user_id = u.id WHERE ss.tp_id = $1`, [tp_id]);
    return result.rows;
};

const getTreatmentPlansByUser = async(studentId, user_id) => {
    const result = await pool.query(`SELECT DISTINCT tp.*, u.name AS created_by_name FROM treatment_plan tp LEFT JOIN users u on tp.created_by = u.id LEFT JOIN tp_shares ts ON ts.tp_id = tp.id WHERE tp.student_id = $1 AND (tp.created_by = $2 OR ts.shared_with_user_id = $2) ORDER BY tp.created_at DESC`, [studentId, user_id]);
    return result.rows;
};

const getTreatmentPlansBySchool = async(studentId, school_id) => {
    const result = await pool.query(`SELECT tp.*, u.name AS created_by_name FROM treatment_plan tp LEFT JOIN users u ON tp.created_by = u.id WHERE tp.student_id = $1 AND tp.school_id = $2 ORDER BY tp.created_at DESC`, [studentId, school_id]);
    return result.rows;
};

const deleteTreatmentPlan = async(id) => {
    const client = await pool.connect();
    try{
        await client.query('BEGIN');
        await client.query(`DELETE FROM tp_concerns WHERE tp_id = $1`, [id]);
        await client.query(`DELETE FROM tp_acad_support WHERE tp_id = $1`, [id]);
        await client.query(`DELETE FROM tp_emotional_support WHERE tp_id = $1`, [id]);
        await client.query(`DELETE FROM tp_follow_up WHERE tp_id = $1`, [id]);
        await client.query(`DELETE FROM tp_long_term_goals WHERE tp_id = $1`, [id]);
        await client.query(`DELETE FROM tp_metrics WHERE tp_id = $1`, [id]);
        await client.query(`DELETE FROM tp_parental_involvement WHERE tp_id = $1`, [id]);
        await client.query(`DELETE FROM tp_peer_interaction WHERE tp_id = $1`, [id]);
        await client.query(`DELETE FROM tp_short_term_goals WHERE tp_id = $1`, [id]);
        await client.query(`DELETE FROM tp_skill_dev WHERE tp_id = $1`, [id]);
        await client.query(`DELETE FROM tp_shares WHERE tp_id = $1`, [id]);
        await client.query(`DELETE FROM notifications WHERE treatment_plan_id = $1`, [id]);
        
        const result = await client.query(`DELETE FROM treatment_plan WHERE id = $1 RETURNING *`, [id]);
        await client.query('COMMIT');
        return result.rows[0];
}catch (err){
    await client.query('ROLLBACK');
    throw err;
}finally{
    client.release();
}
};

module.exports = {
getTreatmentPlan,
getTreatmentPlanById,
createTreatmentPlan,
addedAcadSupport,
addedConcerns,
addedEmotionalSupport,
addedFollowUp,
addedLongTermGoals,
addedMetrics,
addedParentalInvolvement,
addedPeerInteraction,
addedShortTermGoals,
addedSkillDev,
shareTreatmentPlan,
getSharedTreatmentPlans,
getSharesByTreatmentPlanId,
getTreatmentPlansByUser,
getTreatmentPlansBySchool,
deleteTreatmentPlan
};