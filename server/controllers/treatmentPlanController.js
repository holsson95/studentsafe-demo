const treatmentPlanModel = require('../models/treatmentPlanModel');
const studentModel = require('../models/studentModel');
const userModel = require('../models/userModel');
const notificationModel = require('../models/notificationsModel');

const getAllTreatmentPlanById = async(req, res) => {
    try{
        const {studentId} = req.params;
        const { id: user_id, access_level, school_id } = req.user;
        let record = [];

        if(access_level === 1){
            record = await treatmentPlanModel.getTreatmentPlansByUser(studentId, user_id);
        }

        else if(access_level === 2){
            record = await treatmentPlanModel.getTreatmentPlansBySchool(studentId, school_id);
        }
        else if(access_level === 3){
            record = await treatmentPlanModel.getSharedTreatmentPlans(studentId, user_id);
        }

        res.json(record);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch session notes' });
    }
};


const getTreatmentPlanById = async(req, res) => {
    try{
        const { planId } = req.params;
        const treatmentPlan = await treatmentPlanModel.getTreatmentPlanById(planId);
        if(!treatmentPlan){
             return res.status(404).json({error: 'Treatment plan not found'});
        }

        const sharedUsers = await treatmentPlanModel.getSharesByTreatmentPlanId(planId);
        treatmentPlan.shared_users = sharedUsers;

        res.json(treatmentPlan);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch treatment' });
    }
};

const createTreatmentPlan = async(req, res) => {
    try{
        const { studentId } = req.params;
        const { case_type_id, student_overview, notes, concerns, short_term_goals, long_term_goals, emotional_support, parental_involvement, skill_development, peer_interaction, academic_support, follow_up, metrics, shared_with_user_ids } = req.body;
        const created_by = req.user.id;
        const student = await studentModel.getStudentById(studentId);
        if(!student) return res.status(404).json({error: 'Student not found'});
        const school_id = student.school_id;
        const building_id = student.building_id;
        const newPlan = await treatmentPlanModel.createTreatmentPlan({
            student_id: studentId,
            case_type_id,
            school_id,
            building_id,
            student_overview,
            notes,
            created_by
        });
        let addedAcadSupport = [];
        let addedConcerns = [];      
        let addedEmotionalSupport = []; 
        let addedFollowUp = [];
        let addedLongTermGoals = [];
        let addedMetrics = [];
        let addedParentalInvolvement = [];
        let addedPeerInteraction = [];
        let addedShortTermGoals = [];
        let addedSkillDev = [];
        let addedSharedUsers = [];    

        if(Array.isArray(academic_support) && academic_support.length > 0) {
            addedAcadSupport = await treatmentPlanModel.addedAcadSupport(newPlan.id, academic_support);
        }
        if(Array.isArray(concerns) && concerns.length > 0) {
            addedConcerns = await treatmentPlanModel.addedConcerns(newPlan.id, concerns);
        }
        if(Array.isArray(emotional_support) && emotional_support.length > 0) {
            addedEmotionalSupport = await treatmentPlanModel.addedEmotionalSupport(newPlan.id, emotional_support);
        }
        if(Array.isArray(follow_up) && follow_up.length > 0) {
            addedFollowUp = await treatmentPlanModel.addedFollowUp(newPlan.id, follow_up);
        }
        if(Array.isArray(long_term_goals) && long_term_goals.length > 0) {
            addedLongTermGoals = await treatmentPlanModel.addedLongTermGoals(newPlan.id, long_term_goals);
        }
        if(Array.isArray(metrics) && metrics.length > 0) {
            addedMetrics = await treatmentPlanModel.addedMetrics(newPlan.id, metrics);
        }
        if(Array.isArray(parental_involvement) && parental_involvement.length > 0) {
            addedParentalInvolvement = await treatmentPlanModel.addedParentalInvolvement(newPlan.id, parental_involvement);
        }
        if(Array.isArray(peer_interaction) && peer_interaction.length > 0) {
            addedPeerInteraction = await treatmentPlanModel.addedPeerInteraction(newPlan.id, peer_interaction);
        }
        if(Array.isArray(short_term_goals) && short_term_goals.length > 0) {
            addedShortTermGoals = await treatmentPlanModel.addedShortTermGoals(newPlan.id, short_term_goals);
        }
        if(Array.isArray(skill_development) && skill_development.length > 0) {
            addedSkillDev = await treatmentPlanModel.addedSkillDev(newPlan.id, skill_development);
        }
        if (Array.isArray(shared_with_user_ids) && shared_with_user_ids.length > 0) {
            for (const shared_with_user_id of shared_with_user_ids){
                await treatmentPlanModel.shareTreatmentPlan({
                    tp_id: newPlan.id,
                    shared_with_user_id,
                    shared_by_user_id: created_by
                });
            }
        }
        try{
            let recipients = [];

            if(Array.isArray(shared_with_user_ids) && shared_with_user_ids.length > 0){
                recipients = await userModel.getUsersByIds(shared_with_user_ids);
            } else {
                if(req.user.access_level === 1) {
                    const [level2, level3] = await Promise.all([
                        userModel.getUsersBySchoolAndLevel(school_id, 2),
                        userModel.getUsersByLevel(3)
                    ]);
                    recipients = [...level2, ...level3];
                } else if(req.user.access_level === 2) {
                    recipients = await userModel.getUsersByLevel(3);
                }
            }
            for (const recipient of recipients) {
                await notificationModel.createNotif({
                    receiver_id: recipient.id,
                    message: `New Treatment Plan created for ${student.name}.`,
                    created_by_id: created_by,
                    treatment_plan_id: newPlan.id
                });
            }
        } catch (err) {
            console.error('Failed to create notifications:', err);
        }
            res.status(201).json(newPlan);
        } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to create session notes' });
    };
}

const deleteTreatmentPlan = async(req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    try{
        const treatmentPlan = await treatmentPlanModel.getTreatmentPlanById(id);
        if(!treatmentPlan){
            return res.status(404).json({
                message: 'Treatment plan not found'
            });
        }
        if(treatmentPlan.created_by !== userId){
            return res.status(403).json({
                message: 'You are not allowed to delete this treatment plan'
            });
        }

        const deletePlan = await treatmentPlanModel.deleteTreatmentPlan(id);

        res.status(200).json({
            message: 'Treatment plan deleted successfully!',
            deletePlan
        });
    } catch (err) {
        console.error('Error deleting treatment plan:', err);
        res.status(500).json({
            message: 'Internal server error'
        });
    }
};

module.exports = {
    getAllTreatmentPlanById,
    getTreatmentPlanById,
    createTreatmentPlan,
    deleteTreatmentPlan
};
