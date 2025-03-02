const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require("../models/user");
require('dotenv').config()
const limiter = require('express-rate-limit');
const app = express();

const JWT_SECRET = process.env.JWT_SECRET;

app.use(limiter);

router.get('/login', async (req, res) => {
    res.render('login', { msg: null });
});


router.post('/login', limiter, async (req, res) => {
    const { login, password } = req.body;

    try {
        const user = await User.findOne({ login });
        if (!user) {
            return res.status(404).render('login', { msg: "Usuário não encontrado!" });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).render('login', { msg: "Senha incorreta!" });
        }

        const token = jwt.sign({ id: user._id, login: user.login, admin: false }, JWT_SECRET, { expiresIn: '1h' })

        // Configurar o cookie
        res.cookie('auth_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 3600000 // 1 hora em milissegundos
        });

        res.redirect(`/edit/${login}`);

    } catch (err) {
        console.error('Erro ao realizar login:', err.message);
        res.status(500).render('login', { msg: "Erro interno no servidor!" });
    }
});

module.exports = router;


