const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require("../models/user");
require('dotenv').config()

const JWT_SECRET = process.env.JWT_SECRET;

router.get('/login', async (req, res) => {
    res.render('login', { msg: null });
});


router.post('/login', async (req, res) => {
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

        const token = jwt.sign({ id: user._id, login: user.login }, JWT_SECRET, { expiresIn: '1h' })


        res.redirect(`/edit/${login}?token=${token}`)

    } catch (err) {
        console.error('Erro ao realizar login:', err.message);
        res.status(500).render('login', { msg: "Erro interno no servidor!" });
    }
});

module.exports = router;


