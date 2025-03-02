require('dotenv').config();

const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;


const verifyAdminToken = async (req, res, next) => {
    const adminToken = req.cookies.admin_token;
    console.log('admin token que chega no verify', adminToken)
    
    if (!adminToken) {
        return res.status(401).json({
            success: false,
            message: 'Token de administrador não encontrado'
        });
    }

    try {
        const decoded = jwt.verify(adminToken, JWT_SECRET);
        console.log('token decode apos verify',decoded)
        if (!decoded.admin) {
            return res.status(403).json({
                success: false,
                message: 'Acesso não autorizado'
            });
        }
        
        req.admin = decoded;
        next();
    } catch (err) {
        res.clearCookie('admin_token'); // Remove o cookie inválido
        return res.status(401).json({
            success: false,
            message: 'Token de administrador inválido'
        });
    }
};

module.exports = verifyAdminToken