const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;

function authenticateToken(req, res, next) {
    // Verificar primeiro o token de admin
    const adminToken = req.cookies.admin_token;
    if (adminToken) {
        try {
            const decoded = jwt.verify(adminToken, JWT_SECRET);
            if (decoded.admin) {
                req.user = decoded;
                return next();
            }
        } catch (err) {
            console.log('erro em autenticacao - admin')
        }
    }

    // Verificar o token normal
    const token = req.cookies.auth_token;

    if (!token) {
        if (req.xhr || req.headers.accept?.includes('json')) {
            return res.status(401).json({
                success: false,
                message: 'Token não fornecido'
            });
        }
        return res.redirect('/login');
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            if (err.name === 'TokenExpiredError') {
                res.clearCookie('auth_token');
                return res.status(401).json({
                    success: false,
                    message: 'Token expirado'
                });
            }

            res.clearCookie('auth_token');
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
