const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
require('dotenv').config();
const User = require("../models/user");
const multer = require("multer");
const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

const storage = multer.diskStorage({
    destination: "imagePerfil/",
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}.jpg`;
        cb(null, uniqueName);
    },
});

const upload = multer({ storage });

router.get('/submited', (req, res) => {
    res.render('submited', { User });
});

router.post('/submited', upload.single('image'), async (req, res) => {
    const { name, login, password } = req.body;

    try {
        const alreadyEmail = await User.findOne({ login });
        if (alreadyEmail) {
            return res.status(400).json({
                field: 'login',
                message: 'Login já existe',
            });
        }

        console.log(req.file);
        const passwordHash = await bcrypt.hash(password, 12);
        const newUser = new User({
            name,
            login,
            password: passwordHash,
            image: req.file.filename
        });

        await newUser.save();

        const token = jwt.sign({
            id: newUser.id,
            login: newUser.login
        },
            JWT_SECRET, { expiresIn: '1h' });

        res.cookie('auth_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 3600000
        });

        res.json({
            success: true,
            redirect: '/login'
        });
        console.log(res.json);
        console.log('Generated Token:', token);
    } catch (err) {
        console.error('Erro ao salvar o usuário:', err);
        res.status(500).send('Erro ao salvar o usuário');
    }
});

module.exports = router;
