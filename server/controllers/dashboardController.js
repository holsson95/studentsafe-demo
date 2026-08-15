const dashboardModel = require('../models/dashboardModel');

const fetchAllCases = async(req, res) => {
    try{
        const { period, caseTypeId, schoolId} = req.query;
        const { access_level, school_id: userSchoolId, building_id } = req.user;

        let filter = {};
        console.log("filter", caseTypeId);
        if(access_level === 3){
            if (schoolId && schoolId !== '1') {
                filter = { school_id: parseInt(schoolId) };
            } else {
                filter = {}; // Show all schools if no filter or filter is 1
            }
        } else if (access_level === 2) {
            filter = {school_id: userSchoolId};
        } else if (access_level === 1){
            filter = {building_id};
        } else if (access_level === 0) {
            return res.status(403).json({message: 'App admin cannot access data.'});
        } else {
            return res.status(403).json({ message: 'Access level not recognized'});
        }

        const total_cases = await dashboardModel.getAllCases(period, filter, caseTypeId);
        res.json({ total_cases });
    } catch (err) {
        console.error('Error fetching cases: ', err.message);
        res.status(500).json({error: err.message});
    }
};

module.exports = {
    fetchAllCases,
   
};