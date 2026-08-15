const searchModel = require('../models/searchModel');

const searchQuery = async (req, res) => {
    const { query, limit, caseOffset, studentOffset } = req.query;

    if(!query || query.trim().length < 1) {
        return res.json({ students: [], cases: [] });
    }
    
    try{
        const results = await searchModel.searchQuery(query.trim(), req.user, { limit, caseOffset, studentOffset});
        res.json(results);
    } catch (err) {
        console.error('Search error: ', err);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    searchQuery
};
