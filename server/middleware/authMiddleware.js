const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'No token provided' });

    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if(err) {
            return res.status(403).json({ error: 'Invalid token' });
        }
        req.user = decoded;
        next();
    });
};

const authorizeAdmin = (req, res, next) => {
    if(!req.user ||  (!req.user.is_admin && req.user.access_level !== 0)) {
        return res.status(403).json({ error: 'Admin only' });
    }
    next();
};

module.exports = {
    authenticate,
    authorizeAdmin,
}