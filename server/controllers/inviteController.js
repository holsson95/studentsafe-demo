const userModel = require('../models/userModel');
const emailService = require('../services/emailService');

const bulkImport = async (req, res) => {
    const { users } = req.body;
    if (!Array.isArray(users) || users.length === 0) {
        return res.status(400).json({ message: 'No users provided' });
    }
    try {
        const result = await userModel.bulkCreateUsers(users);
        res.json(result);
    } catch (err) {
        console.error('Bulk import error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

const sendInvites = async (req, res) => {
    const { user_ids } = req.body;
    if (!Array.isArray(user_ids) || user_ids.length === 0) {
        return res.status(400).json({ message: 'No user IDs provided' });
    }
    try {
        const users = await userModel.getUsersByIds(user_ids);
        let sent = 0;
        const errors = [];

        for (const user of users) {
            try {
                await emailService.sendInvite(user);
                sent++;
            } catch (err) {
                errors.push({ user_id: user.id, reason: err.message });
            }
        }

        res.json({ sent, errors });
    } catch (err) {
        console.error('Send invites error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { bulkImport, sendInvites };
