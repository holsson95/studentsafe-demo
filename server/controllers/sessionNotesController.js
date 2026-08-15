const sessionNotesModel = require('../models/sessionNotesModel');
const studentModel = require('../models/studentModel');
const userModel = require('../models/userModel');
const notificationModel = require('../models/notificationsModel');

const getAllSessionNotesById = async(req, res) => {
    try{
        const {studentId} = req.params;
        const { id: user_id, access_level, school_id } = req.user;
        let notes = [];

        if(access_level === 1){
            notes = await sessionNotesModel.getSessionNotesByUser(studentId, user_id);
        }

        else if(access_level === 2){
            notes = await sessionNotesModel.getSessionNotesBySchool(studentId, school_id);
        }
        else if(access_level === 3){
            notes = await sessionNotesModel.getSharedSessionNotes(studentId, user_id);
        }

        res.json(notes);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch session notes' });
    }
};

const getSessionNoteById = async(req, res) => {
    try{
        const { noteId } = req.params;
        const note = await sessionNotesModel.getSessionNoteById(noteId);

        if(!note) return res.status(404).json({error: 'Session note  not found'});

        const people_present = await sessionNotesModel.getPeoplePresent(noteId);
        const actions_taken = await sessionNotesModel.getActionsTaken(noteId);
        const outcome = await sessionNotesModel.getOutcome(noteId);
        const future_actions = await sessionNotesModel.getFutureActions(noteId);
        const shared_users = await sessionNotesModel.getSharesBySessionNoteId(noteId);
        res.json({...note, people_present, actions_taken, outcome, future_actions, shared_users});
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch schools' });
    }
};

const createSessionNote = async(req, res) => {
    try{
        const { studentId } = req.params;
        const { case_type_id, overview, observation_notes, follow_up_date, notes, sn_people_present: people_present, sn_actions_taken: actions_taken, sn_outcome: outcome, sn_future_actions: future, shared_with_user_ids } = req.body;
        const created_by = req.user.id;
        const student = await studentModel.getStudentById(studentId);
        if(!student) return res.status(404).json({error: 'Student not found'});
        const school_id = student.school_id;
        const building_id = student.building_id;
        const newNote = await sessionNotesModel.createSessionNote({
            student_id: studentId,
            case_type_id,
            school_id,
            building_id,
            overview,
            observation_notes,
            follow_up_date,
            notes,
            created_by
        });
        let addedPeople = [];
        let addedActions = [];
        let addedOutcome = [];
        let addedFuture = [];
        let addedSharedUsers = [];
        if(Array.isArray(people_present) && people_present.length > 0) {
            addedPeople = await sessionNotesModel.addPeoplePresent(newNote.id, people_present);
        }
        if(Array.isArray(actions_taken) && actions_taken.length > 0) {
            addedActions = await sessionNotesModel.addedActions(newNote.id, actions_taken);
        }
        if(Array.isArray(outcome) && outcome.length > 0) {
            addedOutcome = await sessionNotesModel.addedOutcome(newNote.id, outcome);
        }
        if(Array.isArray(future) && future.length > 0) {
            addedFuture = await sessionNotesModel.addedFuture(newNote.id, future);
        }
        if (Array.isArray(shared_with_user_ids) && shared_with_user_ids.length > 0) {
            for (const shared_with_user_id of shared_with_user_ids){
                await sessionNotesModel.shareSessionNote({
                    sn_id: newNote.id,
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
                    message: `New session note created for ${student.name}.`,
                    created_by_id: created_by,
                    session_note_id: newNote.id
                });
            }
        } catch (err) {
            console.error('Failed to create notifications:', err);
        }
            res.status(201).json({...newNote, people_present: addedPeople, shared_with: shared_with_user_ids || []});
        } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to create session notes' });
    };
}

const getAllRoles = async(req, res) => {
    try{
        const roles = await sessionNotesModel.getAllRoles();
        res.json(roles);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch roles' });
    }
};
 
module.exports = {
    getAllSessionNotesById,
    getSessionNoteById,
    createSessionNote,
    getAllRoles
};
