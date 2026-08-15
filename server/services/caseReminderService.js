const cron = require('node-cron');
const caseModel = require('../models/caseModel');
const notificationModel = require('../models/notificationsModel');

const SYSTEM_USER_ID = 54;

async function runCaseReminders() {
    const staleCases = await caseModel.getStaleCases();
    console.log('[Reminder Service] Running case reminder check...');
    for (const caseItem of staleCases) {
        const alreadySentToday = await notificationModel.reminderSentToday({
            case_id: caseItem.id,
            receiver_id: caseItem.created_by_id
        });
        if (!alreadySentToday) {
            await notificationModel.createNotif({
                receiver_id: caseItem.created_by_id,
                message: `Case has been ${caseItem.status} for more than ${caseItem.days_stale} days.`,
                created_by_id: null,
                case_id: caseItem.id,
                type: 'reminder'
            });
        }
    }
}

module.exports = { runCaseReminders };