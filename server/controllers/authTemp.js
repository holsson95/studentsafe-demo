const authModel = require('../models/authModel');
const userModel = require('../models/userModel');
const logModel = require('../models/logModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');

const login = async (req, res) => {
    const { email, password } = req.body;
    try{
        const user = await authModel.findUserbyEmail(email);
        if(!user) return res.status(401).json({ message: 'Invalid credentials' });
        console.log(
            "LOGIN CHECK:",
            user.email,
            "Attempts:",
            user.failed_login_attempts,
            "Locked:",
            user.locked_until
        );
        if(user.locked_until && new Date(user.locked_until) > new Date()){
            await logModel.createLog({ log_type: 'auth', action_code: 'LOGIN_LOCKED', user_id: user.id });
            return res.status(423).json({
                message: 'Account temporarily locked. Try again later.'
            });
        } else if (user.locked_until) {
            await authModel.resetFailedAttempts(user.id);
        }
        if (!user.is_active) return res.status(401).json({ message: 'Invalid credentials' });
        if (!user.password_hash) return res.status(401).json({ message: 'Invalid credentials' });
        const match = await bcrypt.compare(password, user.password_hash);
        if(!match){
            const attempts = (user.failed_login_attempts || 0) + 1;

            if(attempts >= 3){
                await authModel.lockUser(
                    user.id,
                    new Date(Date.now() + 15 * 60 * 1000)
                );
                await logModel.createLog({ log_type: 'auth', action_code: 'LOGIN_LOCKED', user_id: user.id });
                return res.status(423).json({
                    message: 'Account temporarily locked for 15 minutes.'
                });
            }

            await authModel.updateFailedAttempts(user.id, attempts);
            await logModel.createLog({ log_type: 'auth', action_code: 'LOGIN_FAILED', user_id: user.id });
            return res.status(401).json({ message: `Invalid credentials. ${3 - attempts } attempts remaining. `});
        }

        await authModel.resetFailedAttempts(user.id);
        await logModel.createLog({ log_type: 'auth', action_code: 'LOGIN_SUCCESS', user_id: user.id });

        const token = jwt.sign(
            {
            id: user.id,
            email: user.email,
            role: user.role,
            access_level: user.access_level,
            school_id: user.school_id,
            building_id: user.building_id,
            is_admin: user.is_admin,
            },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                access_level: user.access_level,
                school_id: user.school_id,
                building_id: user.building_id,
                is_admin: user.is_admin,
            },
        });
    } catch (error){
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const googleLogin = async (req, res) => {
    const { credential } = req.body;
    if (!credential) return res.status(400).json({ message: 'Missing Google credential' });

    try {
        const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        const { email, sub: google_id, name, email_verified } = payload;
        if (!email_verified) return res.status(403).json({ message: 'Google email not verified' });

        const domain = email.split('@')[1];
        const domainRecord = await authModel.findDomainRecord(domain);
        if (!domainRecord) {
            return res.status(403).json({ message: 'Email domain not authorised' });
        }

        let user = await authModel.findUserbyEmail(email);

        if (!user) {
            await userModel.createUser({
                name,
                email,
                password_hash: null,
                role: 'teacher',
                school_id: domainRecord.school_id,
                building_id: null,
                access_level: 4,
                is_active: true,
            });
            user = await authModel.findUserbyEmail(email);
        }

        if (!user.is_active) {
            return res.status(403).json({ message: 'Account deactivated' });
        }

        if (!user.google_id) {
            await authModel.setGoogleId(user.id, google_id);
        }

        await logModel.createLog({ log_type: 'auth', action_code: 'GOOGLE_LOGIN_SUCCESS', user_id: user.id });

        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                role: user.role,
                access_level: user.access_level,
                school_id: user.school_id,
                building_id: user.building_id,
                is_admin: user.is_admin,
            },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                access_level: user.access_level,
                school_id: user.school_id,
                building_id: user.building_id,
                is_admin: user.is_admin,
            },
        });
    } catch (error) {
        console.error('Google login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = { login, googleLogin };
