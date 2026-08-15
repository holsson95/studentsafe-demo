const logModel = require('../models/logModel');

const getCaseLogs = async (req, res) => {
    try {
        const logs = await logModel.getCaseLogs();
        res.json(logs);
    } catch (error) {
        console.error('Error fetching case logs:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const getUserLogs = async (req, res) => {
    try {
        const logs = await logModel.getUserLogs();
        res.json(logs);
    } catch (error) {
        console.error('Error fetching user logs:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    getCaseLogs,
    getUserLogs
};