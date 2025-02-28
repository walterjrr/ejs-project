const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;

function authenticateToken(req, res, next) {
    if (req.isAdmin) {
        return next();
    }

    const authHeader = req.headers['authorization'];
    let token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        token = req.query.token;
    }

    if (!token) {
        if (req.xhr || req.headers.accept?.includes('json')) {
            return res.status(401).json({
                success: false,
                message: 'Token não fornecido'
            });
        }
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            if (err.name === 'TokenExpiredError') {
                return res.status(401).json({
                    success: false,
                    message: 'Token expirado'
                });
            }

            return res.status(401).json({
                success: false,
                message: 'Token inválido'
            });
        }

        req.user = user;
        next();
    });
}

module.exports = authenticateToken;
