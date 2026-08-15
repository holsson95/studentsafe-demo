const schoolModel = require('../models/schoolModel');

const getAllSchools = async (req, res) => {
    const { access_level, school_id, building_id } = req.user;
    const { exclude } = req.query;
    try{
        let schools;
        if(access_level === 3){
            const excludeId = exclude ? parseInt(exclude, 10) : undefined;
            schools = await schoolModel.getAllSchools(excludeId);
        } else if (access_level === 2) {
            schools = await schoolModel.getBuildingsBySchool(school_id);
            schools = schools ? [schools] : [];
        } else if (access_level === 1){
            return res.status(403).json({message: 'Level 1 users cannot access school data.'});
        } else if (access_level === 0) {
            return res.status(403).json({message: 'App admin cannot access data.'});
        } else {
            return res.status(403).json({ message: 'Access level not recognized'});
        }
        res.json(schools);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch schools' });
    }
};

const getBuildingsBySchool = async (req, res) => {
    const { access_level, school_id, building_id } = req.user;
    const { schoolId } = req.params;
    const targetSchoolId = parseInt(req.params.schoolId);

    try{
    let buildings = [];
    if (access_level === 3) {
        buildings = await schoolModel.getBuildingsBySchool(targetSchoolId);
    } else if (access_level === 2) {
        if(school_id !== targetSchoolId){
            return res.status(403).json({ message: "Access denied." });
        }
        buildings = await schoolModel.getBuildingsBySchool(targetSchoolId);
    }else if(access_level === 1){
        const building = await schoolModel.getBuildingById(building_id);
        if(building && building.schoolId === targetSchoolId){
            buildings = [building];
        }else{
            return res.status(403).json({ message: "Access denied."})
        }
    }else if (access_level === 0){
            return res.status(403).json({message: 'App admin cannot access case data'});
    } else {
            return res.status(403).json({ message: 'Access level not recognized'});
    }
    res.json(buildings);

    } catch(err){
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch buildings' });    
    }
};
const fetchSchoolByID = async (req, res) => {
    const { id } = req.params;
    const schoolId = parseInt(id, 10);
    
    // Validate the ID
    if (isNaN(schoolId) || schoolId <= 0) {
        return res.status(400).json({ error: 'Invalid school ID' });
    }

    try {
        const school = await schoolModel.getSchoolById(schoolId);
        
        if (!school) {
            return res.status(404).json({ error: 'School not found' });
        }
        
        res.json(school);
    } catch (err) {
        console.error('Error fetching school by ID:', err);
        res.status(500).json({ error: 'Failed to fetch school' });
    }
};

module.exports = {
    getAllSchools,
    getBuildingsBySchool,
    fetchSchoolByID
};
