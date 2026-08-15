const userModel = require('../models/userModel');
const schoolModel = require('../models/schoolModel');
const logModel = require('../models/logModel');
const bcrypt =  require('bcrypt');

const createUser = async(req, res) => {
    try{
        const {name, email, password, role, school_id, building_id, access_level} = req.body;

        const is_active = req.body.is_active !== undefined ? req.body.is_active : true;
        
        const existing = await userModel.findByEmail(email);
        if(existing) return res.status(400).json({ message: 'Email already exists'});

        if (!password || password.length < 8) {
            return res.status(400).json({ message: 'Password must be at least 8 characters' });
        }

        const password_hash = await bcrypt.hash(password, 10);

        const newUser = await userModel.createUser({
            name,
            email,
            password_hash,
            role,
            school_id,
            building_id,
            access_level,
            is_active
        });

        await logModel.createLog({
            log_type: 'user',
            action_code: 'USER_CREATED',
            user_id: req.user.id,
            target_user_id: newUser.id
        });
        res.status(201).json({message: 'User created', user: newUser });
    } catch (err) {
        console.error('User creation error', err);
        res.status(500).json({ message: 'Server error' });
    }
};

const getAllUsers = async (req, res) => {
    try{
        const users = await userModel.getAllUsers();
        res.json(users);
    } catch (err){
        console.error('Get all users error:', err);
        res.status(500).json({ error: 'Server error'});
    }
};

const getUserById = async(req, res) => {
    const { id } = req.params;

    try{
        const result = await userModel.getUserById(id);
        if(!result){
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(result);
    } catch (err) {
        res.status(500).json({error: 'Failed to fetch user data', err});
    }
};
function initcap(str){
    if(!str) return '';
    return str
        .split(' ')
        .map(word =>word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};
const getLoggedUser = async(req, res) => {
    try{
        const user = await userModel.getUserById(req.user.id);
        if(!user) {
            return res.status(404).json({ message: 'User not found'});
        }
        const school = user.school_id ? await schoolModel.getSchoolById(user.school_id) : null;
        const building = user.building_id ? await schoolModel.getBuildingById(user.building_id) : null;

        res.json({
            access_level: user.access_level,
            id: user.id,
            name: user.name,
            role: initcap(user.role),
            school_id: user.school_id,
            schoolBuilding: `${school?.name || ''} - ${building?.name || ''}`
        });
    } catch(err){
        console.error('Error fetching user: ', err);
        res.status(500).json({ message: 'Failed to fetch user details'});
    }
};

const deleteUser = async (req, res) => {
    try{
        const { id } = req.params;
        const deleted = await userModel.deleteUser(id);
        if (!deleted) return res.status(404).json({ message: 'Usernot  found' });

        await logModel.createLog({
            log_type: 'user',
            action_code: 'USER_DELETED',
            user_id: req.user.id,
            target_user_id: id
        });
        res.json({ message: 'User deleted', user: deleted });
    } catch (err) {
        console. error('Delete user error:', err);
    res.status(500).json({ message: 'Server error' });
    }
};

// const deactivateUser = async(req, res) => {
//     const { id } = req.params;
//     try{
//         const updated = await userModel.deactivateUser(id);
//         if(!updated) {
//             return res.status(404).json({ message: 'User not found'});
//         }
//         res.json({ message: 'User deactivated', notification: updated});
//     } catch (err) {
//         console.error('Failed to deactivate user', err);
//         res.status(500).json({ error: 'Failed to deactivate user'});
//     }
// };

const updateUser = async(req, res) => {
    const { id } = req.params;
    const {role, school_id, building_id, access_level, is_active } = req.body;

    try{
        const user = await userModel.getUserById(id);
        if(!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const updatedUser = await  userModel.updateUser(id, {
            role: role ?? user.role,
            school_id: school_id ?? user.school_id,
            building_id: building_id ?? user.building_id,
            access_level: access_level ?? user.access_level,
            is_active: is_active !== undefined ? is_active : user.is_active
        });
        if (is_active !== undefined && is_active !== user.is_active){
            await logModel.createLog({
                log_type: 'user',
                action_code: is_active ? 'USER_ACTIVATED' : 'USER_DEACTIVATED',
                user_id: req.user.id,
                target_user_id: id
            });
        }
        res.json({ message: 'User updated', user: updatedUser });
    } catch(err){
        console.error('Failed to update user', err);
        res.status(500).json({ error: 'Server error'});
    }
};

module.exports = {
    createUser,
    getAllUsers,
    getUserById,
    getLoggedUser,
    deleteUser,
    // deactivateUser,
    updateUser
};