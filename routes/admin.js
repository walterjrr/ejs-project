const express = require('express');
const app = express();
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require("../models/user");
require('dotenv').config()
const verifyAdminToken = require("../middlewares/verifyToken");
const JWT_SECRET = process.env.JWT_SECRET;
const ratelimiter = require('../middlewares/rateLimit');


router.get('/admin/login', (req, res) => {
    res.render('adminLogin', { msg: null });
});

router.get('/admin/index', verifyAdminToken, async (req, res) => {
    res.render('adminPage')
});

router.post('/admin/delete', verifyAdminToken, async (req, res) => {
    const { login } = req.body;
    
    try {
        const user = await User.findOne({ login });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuário não encontrado'
            });
        }
        
        await User.deleteOne({ login });
        res.json({
            success: true,
            message: 'Usuário deletado com sucesso'
        });
    } catch (err) {
        console.error('Erro ao deletar o usuário:', err);
        res.status(500).json({
            success: false,
            message: 'Erro ao deletar o usuário'
        });
    }
});

router.post('/admin/login',ratelimiter, async (req, res) => {
    const { adminLogin, adminPassword } = req.body;
    
    if (adminLogin === process.env.ADMIN_LOGIN && adminPassword === process.env.ADMIN_PASSWORD) {
        const token = jwt.sign({ admin: true }, JWT_SECRET, { expiresIn: '1h' });
        
        res.cookie('admin_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 3600000 
        });

        return res.redirect('/admin/index');
    } else {
        return res.redirect('/admin/login');
    }
});

router.get('/admin/logout', verifyAdminToken, (req, res) => {
    res.clearCookie('admin_token');
    res.redirect('/admin/login');
});

module.exports = router